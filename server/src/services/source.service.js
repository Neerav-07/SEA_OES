import crypto from 'node:crypto';
import { and, asc, desc, eq, ilike, max } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import { sourceChunks, sourceDocumentVersions, sourceDocuments } from '../db/schema/index.js';
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

function chunkValues(versionId, content, options = {}) {
  const maxChunkLength = options.maxChunkLength || 1000;
  const basePage = options.pageNumber ?? null;
  const sectionReference = options.sectionReference ?? null;
  return splitIntoChunks(content, maxChunkLength).map((chunk, index) => {
    const hash = crypto.createHash('sha256').update(`${versionId}:${chunk.textStart}:${chunk.text}`, 'utf8').digest('hex').slice(0, 24);
    return {
      documentVersionId: versionId,
      chunkReference: `chunk-${String(index + 1).padStart(4, '0')}-${hash}`,
      pageNumber: basePage,
      sectionReference,
      text: chunk.text,
      textStart: chunk.textStart,
      textEnd: chunk.textEnd,
      metadata: { ordinal: index + 1, maxChunkLength },
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
  if (input.externalId) {
    const [existing] = await db.select().from(sourceDocuments).where(eq(sourceDocuments.externalId, input.externalId));
    if (existing) throw domainError('SOURCE_ALREADY_EXISTS', 'externalId', 'A source document with this external ID already exists.', 409);
  }
  const [source] = await db.insert(sourceDocuments).values(input).returning();
  return source;
}

export async function listSources(search = '') {
  const db = getDb();
  const query = db.select().from(sourceDocuments).orderBy(desc(sourceDocuments.createdAt));
  return search ? query.where(ilike(sourceDocuments.name, `%${search}%`)) : query;
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
  const [duplicate] = await db.select().from(sourceDocumentVersions).where(and(
    eq(sourceDocumentVersions.documentId, sourceId),
    eq(sourceDocumentVersions.checksum, checksum),
  ));
  if (duplicate) throw domainError('SOURCE_VERSION_ALREADY_EXISTS', 'content', 'This source content already has a version.', 409);
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
