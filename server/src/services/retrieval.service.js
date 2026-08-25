import { and, asc, eq, inArray } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import { competencies } from '../db/schema/competencies.js';
import { competencyClaims, learningObjectives } from '../db/schema/learningObjectives.js';
import { sourceChunks, sourceDocumentVersions, sourceDocuments } from '../db/schema/sourceProvenance.js';
import { validateRetrievalRequest } from '../validators/retrieval.validator.js';

function invalidRequest(errors) {
  const error = new Error('Validation failed.');
  error.statusCode = 400;
  error.errors = errors;
  return error;
}

function domainError(code, field, message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = [{ code, field, message }];
  return error;
}

function tokens(value = '') {
  return [...new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((token) => token.length > 2))];
}

function scoreChunk(text, terms) {
  if (terms.length === 0) return 0;
  const normalized = text.toLowerCase();
  const hits = terms.reduce((count, term) => count + (normalized.includes(term) ? 1 : 0), 0);
  return hits / terms.length;
}

async function loadContext(db, request) {
  let competency;
  let claim;
  let learningObjective;
  if (request.competencyId) {
    [competency] = await db.select().from(competencies).where(eq(competencies.id, request.competencyId));
    if (!competency) throw domainError('COMPETENCY_NOT_FOUND', 'competencyId', 'Competency was not found.', 404);
  }
  if (request.claimId) {
    [claim] = await db.select().from(competencyClaims).where(eq(competencyClaims.id, request.claimId));
    if (!claim) throw domainError('CLAIM_NOT_FOUND', 'claimId', 'Claim was not found.', 404);
    if (request.competencyId && claim.competencyId !== request.competencyId) throw domainError('CLAIM_COMPETENCY_MISMATCH', 'claimId', 'Claim does not belong to the selected competency.');
  }
  if (request.learningObjectiveId) {
    [learningObjective] = await db.select().from(learningObjectives).where(eq(learningObjectives.id, request.learningObjectiveId));
    if (!learningObjective) throw domainError('LEARNING_OBJECTIVE_NOT_FOUND', 'learningObjectiveId', 'Learning objective was not found.', 404);
    if (request.competencyId && learningObjective.competencyId !== request.competencyId) throw domainError('LEARNING_OBJECTIVE_COMPETENCY_MISMATCH', 'learningObjectiveId', 'Learning objective does not belong to the selected competency.');
  }
  if (claim && learningObjective && claim.learningObjectiveId && claim.learningObjectiveId !== learningObjective.id) throw domainError('CLAIM_OBJECTIVE_MISMATCH', 'learningObjectiveId', 'Claim is not aligned to the selected learning objective.');
  return { competency, claim, learningObjective };
}

export async function searchSourceEvidence(request = {}) {
  const validation = validateRetrievalRequest(request);
  if (!validation.valid) throw invalidRequest(validation.errors);
  const db = getDb();
  const context = await loadContext(db, request);
  const terms = tokens([
    request.query,
    context.competency?.code,
    context.competency?.name,
    context.claim?.code,
    context.claim?.statement,
    context.learningObjective?.code,
    context.learningObjective?.title,
    context.learningObjective?.description,
  ].filter(Boolean).join(' '));
  const conditions = [eq(sourceDocumentVersions.status, 'READY')];
  if (request.sourceDocumentIds?.length) conditions.push(inArray(sourceDocuments.id, request.sourceDocumentIds));
  if (request.sourceVersionIds?.length) conditions.push(inArray(sourceDocumentVersions.id, request.sourceVersionIds));
  const rows = await db.select({
    sourceDocumentId: sourceDocuments.id,
    sourceDocumentName: sourceDocuments.name,
    sourceVersionId: sourceDocumentVersions.id,
    sourceVersion: sourceDocumentVersions.version,
    sourceChunkId: sourceChunks.id,
    content: sourceChunks.text,
    pageNumber: sourceChunks.pageNumber,
    section: sourceChunks.sectionReference,
    chunkReference: sourceChunks.chunkReference,
    metadata: sourceChunks.metadata,
    textStart: sourceChunks.textStart,
    textEnd: sourceChunks.textEnd,
  }).from(sourceChunks)
    .innerJoin(sourceDocumentVersions, eq(sourceChunks.documentVersionId, sourceDocumentVersions.id))
    .innerJoin(sourceDocuments, eq(sourceDocumentVersions.documentId, sourceDocuments.id))
    .where(and(...conditions))
    .orderBy(asc(sourceChunks.textStart), asc(sourceChunks.chunkReference));
  const scored = rows.map((row) => ({ ...row, relevanceScore: scoreChunk(`${row.content} ${row.section || ''}`, terms) }))
    .filter((row) => terms.length === 0 || row.relevanceScore > 0)
    .sort((left, right) => right.relevanceScore - left.relevanceScore || left.sourceDocumentId.localeCompare(right.sourceDocumentId) || (left.textStart ?? 0) - (right.textStart ?? 0))
    .slice(0, request.limit || 5);
  return { context: { competencyId: request.competencyId || null, claimId: request.claimId || null, learningObjectiveId: request.learningObjectiveId || null, query: request.query || '' }, strategy: 'postgresql-lexical', evidence: scored };
}
