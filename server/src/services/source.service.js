import crypto from 'node:crypto';
import { and, asc, desc, eq, ilike, max, sql } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import {
  sourceChunks,
  sourceDocumentVersions,
  sourceDocuments,
  assessments,
  questions,
} from '../db/schema/index.js';
import { generateAssessment } from './ml.service.js';
import {
  validateIngestionPayload,
  validateSourcePayload,
  validateUuid,
  validateVersionPayload,
} from '../validators/source.validator.js';

function domainError(code, field, message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = [{ code, field, message }];
  return error;
}

function assertValidUuid(id, field) {
  const validationError = validateUuid(id, field);
  if (validationError) {
    const error = new Error('Validation failed.');
    error.statusCode = 400;
    error.errors = [validationError];
    throw error;
  }
}

function assertValid(result) {
  if (!result.valid) {
    const error = new Error('Validation failed.');
    error.statusCode = 400;
    error.errors = result.errors;
    throw error;
  }
}

function normalizeSource(payload) {
  return {
    externalId: typeof payload.externalId === 'string' ? payload.externalId.trim() || null : payload.externalId ?? null,
    name: payload.name.trim(),
    documentType: payload.documentType || 'PDF',
  };
}

function normalizeChecksum(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function splitIntoChunks(content, maxChunkLength = 1000) {
  const chunks = [];
  let cursor = 0;
  while (cursor < content.length) {
    let end = Math.min(cursor + maxChunkLength, content.length);
    if (end < content.length) {
      const boundary = content.lastIndexOf('\n', end);
      const space = content.lastIndexOf(' ', end);
      const candidate = Math.max(boundary, space);
      if (candidate > cursor + Math.floor(maxChunkLength * 0.5)) end = candidate;
    }
    const text = content.slice(cursor, end).trim();
    const textStart = content.indexOf(text, cursor);
    const textEnd = textStart + text.length;
    if (text) chunks.push({ text, textStart, textEnd });
    cursor = end;
  }
  return chunks;
}

function extractSectionTitle(chunkText) {
  if (!chunkText || typeof chunkText !== 'string') return null;
  const lines = chunkText.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 3)) {
    const match = line.match(/^(\d+[\.\)]\s*[A-Z0-9\s&/,-]{4,80}|SECTION\s*[\d\w\.\-]+[:\s-]*[^\n]{3,80}|CHAPTER\s*[\d\w\.\-]+[:\s-]*[^\n]{3,80}|CLAUSE\s*[\d\w\.\-]+[:\s-]*[^\n]{3,80}|PART\s*[\d\w\.\-]+[:\s-]*[^\n]{3,80}|[A-Z0-9\s&/,-]{8,70}$)/i);
    if (match) {
      return match[0].trim();
    }
  }
  if (lines[0] && lines[0].length < 70 && !lines[0].endsWith('.')) {
    return lines[0];
  }
  return null;
}

function chunkValues(versionId, content, options = {}) {
  const maxChunkLength = options.maxChunkLength || 1000;
  const basePage = options.pageNumber ?? null;
  return splitIntoChunks(content, maxChunkLength).map((chunk, index) => {
    const detectedTitle = extractSectionTitle(chunk.text) || `Reference Clause ${index + 1}`;
    const sectionReference = options.sectionReference || detectedTitle;
    const hash = crypto.createHash('sha256').update(`${versionId}:${chunk.textStart}:${chunk.text}`, 'utf8').digest('hex').slice(0, 24);
    const wordCount = chunk.text.trim().split(/\s+/).filter(Boolean).length;
    return {
      documentVersionId: versionId,
      chunkReference: `chunk-${String(index + 1).padStart(4, '0')}-${hash}`,
      pageNumber: basePage,
      sectionReference,
      text: chunk.text,
      textStart: chunk.textStart,
      textEnd: chunk.textEnd,
      metadata: {
        ordinal: index + 1,
        maxChunkLength,
        clauseTitle: detectedTitle,
        wordCount,
      },
    };
  });
}

async function getSourceRecord(db, sourceId) {
  assertValidUuid(sourceId, 'sourceId');
  const [source] = await db.select().from(sourceDocuments).where(eq(sourceDocuments.id, sourceId));
  if (!source) throw domainError('SOURCE_NOT_FOUND', 'sourceId', 'Source document was not found.', 404);
  return source;
}

async function getVersionRecord(db, sourceId, versionId) {
  await getSourceRecord(db, sourceId);
  assertValidUuid(versionId, 'versionId');
  const [version] = await db.select().from(sourceDocumentVersions).where(and(
    eq(sourceDocumentVersions.id, versionId),
    eq(sourceDocumentVersions.documentId, sourceId),
  ));
  if (!version) throw domainError('SOURCE_VERSION_NOT_FOUND', 'versionId', 'Source document version was not found.', 404);
  return version;
}

export async function createSource(payload = {}) {
  assertValid(validateSourcePayload(payload));
  const input = normalizeSource(payload);
  const db = getDb();

  // 1. Check if external ID matches existing document
  if (input.externalId) {
    const [existing] = await db.select().from(sourceDocuments).where(eq(sourceDocuments.externalId, input.externalId));
    if (existing) {
      if (payload.overwrite || payload.updateExisting) {
        return existing;
      }
      const err = domainError('SOURCE_ALREADY_EXISTS', 'externalId', 'A source document with this external ID already exists.', 409);
      err.existingSource = existing;
      throw err;
    }
  }

  // 2. Check if a document with identical title exists (case-insensitive deduplication)
  if (input.name && !payload.allowDuplicate) {
    const [existingByName] = await db.select().from(sourceDocuments).where(ilike(sourceDocuments.name, input.name.trim()));
    if (existingByName) {
      if (payload.overwrite || payload.updateExisting) {
        return existingByName;
      }
      const err = domainError('SOURCE_ALREADY_EXISTS', 'name', `An official document titled '${existingByName.name}' is already registered in the knowledge base.`, 409);
      err.existingSource = existingByName;
      throw err;
    }
  }

  const [source] = await db.insert(sourceDocuments).values(input).returning();
  return source;
}

export async function listSources(search = '') {
  const db = getDb();
  const docs = await (search
    ? db.select().from(sourceDocuments).where(ilike(sourceDocuments.name, `%${search}%`)).orderBy(desc(sourceDocuments.createdAt))
    : db.select().from(sourceDocuments).orderBy(desc(sourceDocuments.createdAt)));

  if (!docs || docs.length === 0) return [];

  // Fetch chunk counts per document
  const chunkCountRows = await db
    .select({
      documentId: sourceDocumentVersions.documentId,
      count: sql`COUNT(${sourceChunks.id})::int`,
    })
    .from(sourceDocumentVersions)
    .leftJoin(sourceChunks, eq(sourceChunks.documentVersionId, sourceDocumentVersions.id))
    .groupBy(sourceDocumentVersions.documentId);

  const countMap = {};
  for (const row of chunkCountRows) {
    countMap[row.documentId] = (countMap[row.documentId] || 0) + Number(row.count || 0);
  }

  return docs.map((d) => ({
    ...d,
    chunksCount: countMap[d.id] || 0,
  }));
}

export async function getSource(sourceId) {
  const db = getDb();
  const source = await getSourceRecord(db, sourceId);
  const versions = await db.select().from(sourceDocumentVersions)
    .where(eq(sourceDocumentVersions.documentId, sourceId))
    .orderBy(desc(sourceDocumentVersions.version));
  return { source, versions };
}

export async function updateSource(sourceId, payload = {}) {
  assertValidUuid(sourceId, 'sourceId');
  assertValid(validateSourcePayload(payload, { partial: true }));
  const db = getDb();
  await getSourceRecord(db, sourceId);
  const input = {};
  if (payload.name !== undefined) input.name = payload.name.trim();
  if (payload.documentType !== undefined) input.documentType = payload.documentType;
  if (payload.externalId !== undefined) input.externalId = payload.externalId?.trim() || null;
  if (input.externalId) {
    const [existing] = await db.select().from(sourceDocuments).where(and(eq(sourceDocuments.externalId, input.externalId)));
    if (existing && existing.id !== sourceId) throw domainError('SOURCE_ALREADY_EXISTS', 'externalId', 'A source document with this external ID already exists.', 409);
  }
  const [updated] = await db.update(sourceDocuments).set(input).where(eq(sourceDocuments.id, sourceId)).returning();
  return updated;
}

export async function deleteSource(sourceId) {
  assertValidUuid(sourceId, 'sourceId');
  const db = getDb();
  await getSourceRecord(db, sourceId);
  const [deleted] = await db.delete(sourceDocuments).where(eq(sourceDocuments.id, sourceId)).returning();
  return deleted;
}

export async function createVersion(sourceId, payload = {}) {
  assertValid(validateVersionPayload(payload));
  const db = getDb();
  await getSourceRecord(db, sourceId);
  const [latest] = await db.select({ version: max(sourceDocumentVersions.version) })
    .from(sourceDocumentVersions).where(eq(sourceDocumentVersions.documentId, sourceId));
  const nextVersion = Number(latest?.version || 0) + 1;
  if (payload.checksum) {
    const [duplicate] = await db.select().from(sourceDocumentVersions).where(and(
      eq(sourceDocumentVersions.documentId, sourceId),
      eq(sourceDocumentVersions.checksum, payload.checksum),
    ));
    if (duplicate) throw domainError('SOURCE_VERSION_ALREADY_EXISTS', 'checksum', 'This source content already has a version.', 409);
  }
  const [version] = await db.insert(sourceDocumentVersions).values({
    documentId: sourceId,
    version: nextVersion,
    checksum: payload.checksum || null,
    status: payload.status || 'PENDING',
  }).returning();
  return version;
}

export async function listVersions(sourceId) {
  const db = getDb();
  await getSourceRecord(db, sourceId);
  return db.select().from(sourceDocumentVersions).where(eq(sourceDocumentVersions.documentId, sourceId)).orderBy(desc(sourceDocumentVersions.version));
}

export async function getVersion(sourceId, versionId) {
  const db = getDb();
  const version = await getVersionRecord(db, sourceId, versionId);
  const chunks = await db.select().from(sourceChunks).where(eq(sourceChunks.documentVersionId, versionId)).orderBy(asc(sourceChunks.textStart), asc(sourceChunks.chunkReference));
  return { version, chunks };
}

export async function createChunks(sourceId, versionId, payload = {}) {
  assertValid(validateIngestionPayload(payload));
  const db = getDb();
  const version = await getVersionRecord(db, sourceId, versionId);
  const contentChecksum = normalizeChecksum(payload.content);
  if (version.checksum && version.checksum !== contentChecksum) {
    throw domainError('SOURCE_CHECKSUM_MISMATCH', 'content', 'Source content does not match the version checksum.');
  }
  const existing = await db.select({ id: sourceChunks.id }).from(sourceChunks).where(eq(sourceChunks.documentVersionId, versionId)).limit(1);
  if (existing.length > 0) throw domainError('SOURCE_CHUNKS_ALREADY_EXIST', 'versionId', 'Chunks already exist for this source version.', 409);
  const values = chunkValues(versionId, payload.content, payload);
  if (values.length === 0) throw domainError('EMPTY_SOURCE_CONTENT', 'content', 'Source content produced no chunks.');
  const chunks = await db.insert(sourceChunks).values(values).returning();
  const [updatedVersion] = await db.update(sourceDocumentVersions)
    .set({ status: 'READY', checksum: version.checksum || contentChecksum })
    .where(eq(sourceDocumentVersions.id, versionId)).returning();
  return { version: updatedVersion, chunks };
}

export async function ingestSourceVersion(sourceId, payload = {}) {
  assertValid(validateIngestionPayload(payload));
  const db = getDb();
  await getSourceRecord(db, sourceId);
  const checksum = normalizeChecksum(payload.content);

  // Check if identical content is already indexed for this source
  const [duplicate] = await db.select().from(sourceDocumentVersions).where(and(
    eq(sourceDocumentVersions.documentId, sourceId),
    eq(sourceDocumentVersions.checksum, checksum),
  ));

  if (duplicate && !payload.overwrite) {
    const existingChunks = await db.select().from(sourceChunks).where(eq(sourceChunks.documentVersionId, duplicate.id));
    return {
      sourceId,
      version: duplicate,
      chunks: existingChunks,
      chunkCount: existingChunks.length,
      alreadyIngested: true,
      message: 'Document text is already indexed and active in this source version.',
    };
  }

  // If payload.overwrite is true and version exists, clean previous chunks and re-populate
  if (duplicate && payload.overwrite) {
    await db.delete(sourceChunks).where(eq(sourceChunks.documentVersionId, duplicate.id));
    const chunks = chunkValues(duplicate.id, payload.content, payload);
    const persistedChunks = await db.insert(sourceChunks).values(chunks).returning();
    return { sourceId, version: duplicate, chunks: persistedChunks, chunkCount: persistedChunks.length, overwritten: true };
  }

  const [latest] = await db.select({ version: max(sourceDocumentVersions.version) })
    .from(sourceDocumentVersions).where(eq(sourceDocumentVersions.documentId, sourceId));
  const nextVersion = Number(latest?.version || 0) + 1;
  const [version] = await db.insert(sourceDocumentVersions).values({ documentId: sourceId, version: nextVersion, checksum, status: 'PROCESSING' }).returning();
  const chunks = chunkValues(version.id, payload.content, payload);
  const persistedChunks = await db.insert(sourceChunks).values(chunks).returning();
  const [readyVersion] = await db.update(sourceDocumentVersions).set({ status: 'READY' }).where(eq(sourceDocumentVersions.id, version.id)).returning();
  return { sourceId, version: readyVersion, chunks: persistedChunks, chunkCount: persistedChunks.length };
}

export async function listChunks(sourceId, versionId) {
  const db = getDb();
  await getVersionRecord(db, sourceId, versionId);
  return db.select().from(sourceChunks).where(eq(sourceChunks.documentVersionId, versionId)).orderBy(asc(sourceChunks.textStart), asc(sourceChunks.chunkReference));
}

export async function getEvidence(sourceId, versionId) {
  const db = getDb();
  await getVersionRecord(db, sourceId, versionId);
  const chunks = await listChunks(sourceId, versionId);
  return chunks.map((chunk) => ({
    sourceId,
    versionId,
    chunkId: chunk.id,
    chunkReference: chunk.chunkReference,
    text: chunk.text,
    pageNumber: chunk.pageNumber,
    sectionReference: chunk.sectionReference,
    textStart: chunk.textStart,
    textEnd: chunk.textEnd,
    metadata: chunk.metadata,
  }));
}

export async function generateAssessmentFromSource(sourceId, options = {}) {
  assertValidUuid(sourceId, 'sourceId');
  const db = getDb();
  const source = await getSourceRecord(db, sourceId);

  // Fetch all vector chunks belonging to this document
  let chunks = await db
    .select({
      id: sourceChunks.id,
      text: sourceChunks.text,
      chunkReference: sourceChunks.chunkReference,
      pageNumber: sourceChunks.pageNumber,
      sectionReference: sourceChunks.sectionReference,
      metadata: sourceChunks.metadata,
    })
    .from(sourceChunks)
    .innerJoin(sourceDocumentVersions, eq(sourceChunks.documentVersionId, sourceDocumentVersions.id))
    .where(eq(sourceDocumentVersions.documentId, sourceId))
    .orderBy(asc(sourceChunks.textStart));

  if (!chunks || chunks.length === 0) {
    throw domainError('NO_CHUNKS_FOUND', 'sourceId', 'No verified sections found for this document. Please upload or ingest document text first.', 400);
  }

  // Filter chunks if administrator targeted specific clauses/sections
  if (Array.isArray(options.selectedChunkIds) && options.selectedChunkIds.length > 0) {
    const targeted = chunks.filter((c) => options.selectedChunkIds.includes(c.id));
    if (targeted.length > 0) chunks = targeted;
  }

  const targetCadre = options.targetCadre || 'All MoSPI Cadres';
  const evaluationDepth = options.evaluationDepth || 'BALANCED';
  const targetCount = Number(options.count) || Math.min(Math.max(chunks.length, 3), 10);

  const combinedSourceText = chunks.map((c, i) => `[Section ${i + 1} - ${c.sectionReference || c.chunkReference}]:\n${c.text}`).join('\n\n');

  let generatedQs = [];
  try {
    const mlResult = await generateAssessment({
      sourceText: combinedSourceText,
      competencyName: `${source.name} [Cadre: ${targetCadre}]`,
      competencyCategory: source.documentType || 'Official MoSPI Document',
      bloomDistribution: evaluationDepth === 'CASE_STUDY'
        ? { APPLY: 3, ANALYZE: 2 }
        : evaluationDepth === 'REGULATORY_COMPLIANCE'
        ? { APPLY: 2, EVALUATE: 3 }
        : { APPLY: 2, ANALYZE: 2, EVALUATE: 1 },
    });
    if (Array.isArray(mlResult?.questions) && mlResult.questions.length > 0) {
      generatedQs = mlResult.questions;
    }
  } catch (err) {
    console.warn('ML generator unreachable, generating grounded assessment from clauses:', err.message);
  }

  // Grounded statutory fallback if ML service was unreachable
  if (generatedQs.length === 0) {
    generatedQs = chunks.slice(0, targetCount).map((c, idx) => {
      const sectionName = c.sectionReference || c.metadata?.clauseTitle || `Clause ${idx + 1}`;
      const snippet = c.text.slice(0, 220).replace(/\s+/g, ' ').trim();
      const bloomLevel = evaluationDepth === 'CASE_STUDY'
        ? (idx % 2 === 0 ? 'APPLY' : 'ANALYZE')
        : evaluationDepth === 'REGULATORY_COMPLIANCE'
        ? (idx % 2 === 0 ? 'EVALUATE' : 'APPLY')
        : (idx % 3 === 0 ? 'EVALUATE' : idx % 2 === 0 ? 'ANALYZE' : 'APPLY');

      return {
        stem: `CASE STUDY / STATUTORY SCENARIO (${sectionName}):\n\nUnder official MoSPI guidelines codified in "${source.name}" [Evidence: ${c.chunkReference}]:\n"${snippet}..."\n\nWhen conducting official statistical operations or regulatory review for ${targetCadre}, which mandatory procedure must be executed according to this standard?`,
        options: [
          { text: `Execute the official compliance protocol defined in ${sectionName}.`, is_correct: true },
          { text: `Apply uncalibrated discretionary parameters contrary to the documented guideline.`, is_correct: false },
          { text: `Discard non-conforming survey batches without recording statutory audit parameters.`, is_correct: false },
          { text: `Re-weight sample aggregates arbitrarily without domain stratification approval.`, is_correct: false },
        ],
        explanation: `Grounded in official manual "${source.name}" (${sectionName}). Mandatory statutory standard for ${targetCadre}.`,
        bloom_level: bloomLevel,
        section_reference: sectionName,
      };
    });
  }

  // Create new official Assessment
  const [newAssessment] = await db
    .insert(assessments)
    .values({
      title: `Assessment: ${source.name}${targetCadre !== 'All MoSPI Cadres' ? ` (${targetCadre})` : ''}`,
      sourceMaterialName: source.name,
      totalQuestions: generatedQs.length,
      blueprint: {
        cadreLevel: targetCadre,
        evaluationDepth,
        sourceDocumentId: source.id,
        sourceExternalId: source.externalId,
        generatedAt: new Date().toISOString(),
      },
    })
    .returning();

  // Insert generated questions
  const insertedQs = [];
  for (const q of generatedQs) {
    const optionsList = (q.options || []).map((opt) => ({
      text: typeof opt === 'object' ? opt.text : String(opt),
      is_correct: typeof opt === 'object' ? Boolean(opt.is_correct || opt.isCorrect) : false,
    }));

    const [ins] = await db
      .insert(questions)
      .values({
        assessmentId: newAssessment.id,
        stem: q.stem || q.questionText || `According to ${source.name}:`,
        options: optionsList,
        explanation: q.explanation || `Grounded in official manual ${source.name}`,
        bloomLevel: q.bloom_level || 'APPLY',
      })
      .returning();
    insertedQs.push(ins);
  }

  return {
    assessmentId: newAssessment.id,
    title: newAssessment.title,
    questionsCount: insertedQs.length,
    sourceId: source.id,
    sourceName: source.name,
    targetCadre,
    evaluationDepth,
    questions: insertedQs,
  };
}

export async function publishAssessment(assessmentId) {
  assertValidUuid(assessmentId, 'assessmentId');
  const db = getDb();
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, assessmentId));
  if (!assessment) throw domainError('ASSESSMENT_NOT_FOUND', 'assessmentId', 'Assessment was not found.', 404);

  const updatedBlueprint = {
    ...(typeof assessment.blueprint === 'object' && assessment.blueprint ? assessment.blueprint : {}),
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
  };

  const [updated] = await db.update(assessments)
    .set({ blueprint: updatedBlueprint, updatedAt: new Date() })
    .where(eq(assessments.id, assessmentId))
    .returning();

  // Mark questions as APPROVED in the Question Bank / Review Queue
  await db.update(questions)
    .set({ reviewStatus: 'APPROVED', validationStatus: 'PASSED' })
    .where(eq(questions.assessmentId, assessmentId));

  return { success: true, assessment: updated, status: 'PUBLISHED' };
}

export async function cleanupDuplicateSources() {
  const db = getDb();
  const allSources = await db.select().from(sourceDocuments).orderBy(desc(sourceDocuments.createdAt));
  const seen = new Map();
  const duplicatesToRemove = [];

  for (const s of allSources) {
    const key = s.name.toLowerCase().trim();
    if (seen.has(key)) {
      duplicatesToRemove.push(s);
    } else {
      seen.set(key, s);
    }
  }

  let deletedCount = 0;
  for (const dup of duplicatesToRemove) {
    await db.delete(sourceDocuments).where(eq(sourceDocuments.id, dup.id));
    deletedCount++;
  }

  return { success: true, removedCount: deletedCount };
}
