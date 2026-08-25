import { and, desc, eq, ne } from 'drizzle-orm';

import { assessmentBlueprintClaims, assessmentBlueprintObjectives, assessmentBlueprints } from '../db/schema/assessmentBlueprints.js';
import { assessments, questions } from '../db/schema/assessments.js';
import { getDb } from '../db/index.js';
import { competencies } from '../db/schema/competencies.js';
import { competencyClaims, learningObjectives } from '../db/schema/learningObjectives.js';
import { questionSourceProvenance, questionValidationResults, questionVersions } from '../db/schema/questionIntelligence.js';
import { sourceChunks, sourceDocumentVersions, sourceDocuments } from '../db/schema/sourceProvenance.js';

const QUESTION_TYPES = new Set(['MCQ', 'SCENARIO']);
const COGNITIVE_LEVELS = new Set(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE']);

function lifecycleError(code, field, message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = [{ code, field, message }];
  return error;
}

function normalize(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

async function loadCurrentVersion(db, questionId) {
  const [question] = await db.select().from(questions).where(eq(questions.id, questionId));
  if (!question) throw lifecycleError('QUESTION_NOT_FOUND', 'questionId', 'Question was not found.', 404);
  const [version] = await db.select().from(questionVersions).where(eq(questionVersions.questionId, questionId)).orderBy(desc(questionVersions.version)).limit(1);
  if (!version) throw lifecycleError('QUESTION_VERSION_NOT_FOUND', 'questionId', 'Question has no version.', 404);
  return { question, version };
}

async function provenanceChecks(db, versionId) {
  const rows = await db.select({
    provenanceId: questionSourceProvenance.id,
    chunkId: sourceChunks.id,
    chunkVersionId: sourceChunks.documentVersionId,
    versionId: sourceDocumentVersions.id,
    documentId: sourceDocuments.id,
    text: sourceChunks.text,
  }).from(questionSourceProvenance)
    .innerJoin(sourceChunks, eq(questionSourceProvenance.sourceChunkId, sourceChunks.id))
    .innerJoin(sourceDocumentVersions, eq(sourceChunks.documentVersionId, sourceDocumentVersions.id))
    .innerJoin(sourceDocuments, eq(sourceDocumentVersions.documentId, sourceDocuments.id))
    .where(eq(questionSourceProvenance.questionVersionId, versionId));
  return rows;
}

async function validateQuestionData(db, question, version) {
  const errors = [];
  const warnings = [];
  const checks = [];
  const add = (id, passed, message, severity = 'ERROR') => {
    checks.push({ id, passed, severity, message });
    if (!passed && severity === 'ERROR') errors.push({ code: id, field: '', message });
    if (!passed && severity === 'WARNING') warnings.push({ code: id, field: '', message });
  };

  add('QUESTION_TEXT_REQUIRED', Boolean(version.stem?.trim()), 'Question text is required.');
  add('QUESTION_TYPE_SUPPORTED', QUESTION_TYPES.has(version.questionType), 'Question type is not supported.');
  add('COGNITIVE_LEVEL_SUPPORTED', COGNITIVE_LEVELS.has(version.bloomLevel), 'Cognitive level is not supported.');
  const options = Array.isArray(version.options) ? version.options : [];
  add('OPTIONS_REQUIRED', version.questionType !== 'MCQ' || options.length >= 2, 'MCQ questions require at least two options.');
  const optionTexts = options.map((option) => typeof option === 'object' ? option.text : option);
  add('OPTIONS_WELL_FORMED', options.every((option) => option && typeof option === 'object' && typeof option.text === 'string' && option.text.trim()), 'Every option must contain non-empty text.');
  add('OPTIONS_UNIQUE', new Set(optionTexts.map(normalize)).size === optionTexts.length, 'Options must not be duplicated.');
  const answer = typeof version.correctAnswer === 'object' && version.correctAnswer !== null ? version.correctAnswer.id || version.correctAnswer.value : version.correctAnswer;
  add('CORRECT_ANSWER_PRESENT', Boolean(answer), 'A correct answer is required.');
  add('CORRECT_ANSWER_MATCHES_OPTION', !answer || options.some((option) => option.id === answer || option.text === answer), 'Correct answer must match an option.');
  add('EXPLANATION_PRESENT', Boolean(version.rationale?.trim()), 'An explanation/rationale is required.', 'WARNING');
  add('PLACEHOLDER_CONTENT', !/lorem ipsum|todo|placeholder|unsupported alternative/i.test(`${version.stem} ${version.rationale || ''}`), 'Placeholder content detected.');

  const [competency] = question.competencyId ? await db.select().from(competencies).where(eq(competencies.id, question.competencyId)) : [null];
  add('COMPETENCY_EXISTS', Boolean(competency), 'Referenced competency does not exist.');
  const [claim] = question.claimId ? await db.select().from(competencyClaims).where(eq(competencyClaims.id, question.claimId)) : [null];
  add('CLAIM_EXISTS', !question.claimId || Boolean(claim), 'Referenced claim does not exist.');
  add('CLAIM_COMPETENCY_MATCH', !claim || claim.competencyId === question.competencyId, 'Claim does not belong to the question competency.');
  const [objective] = question.learningObjectiveId ? await db.select().from(learningObjectives).where(eq(learningObjectives.id, question.learningObjectiveId)) : [null];
  add('OBJECTIVE_EXISTS', !question.learningObjectiveId || Boolean(objective), 'Referenced learning objective does not exist.');
  add('OBJECTIVE_COMPETENCY_MATCH', !objective || objective.competencyId === question.competencyId, 'Learning objective does not belong to the question competency.');

  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, question.assessmentId));
  const blueprintId = version.blueprintId || assessment?.blueprintId;
  if (blueprintId) {
    const [blueprint] = await db.select().from(assessmentBlueprints).where(eq(assessmentBlueprints.id, blueprintId));
    add('BLUEPRINT_EXISTS', Boolean(blueprint), 'Referenced blueprint does not exist.');
    if (blueprint) {
      add('BLUEPRINT_COMPETENCY_MATCH', blueprint.competencyId === question.competencyId, 'Question competency is not allowed by the blueprint.');
      const claimAllowed = question.claimId ? await db.select().from(assessmentBlueprintClaims).where(and(eq(assessmentBlueprintClaims.blueprintId, blueprint.id), eq(assessmentBlueprintClaims.claimId, question.claimId))) : [];
      const objectiveAllowed = question.learningObjectiveId ? await db.select().from(assessmentBlueprintObjectives).where(and(eq(assessmentBlueprintObjectives.blueprintId, blueprint.id), eq(assessmentBlueprintObjectives.learningObjectiveId, question.learningObjectiveId))) : [];
      add('BLUEPRINT_CLAIM_ALLOWED', !question.claimId || claimAllowed.length > 0, 'Question claim is not selected in the blueprint.');
      add('BLUEPRINT_OBJECTIVE_ALLOWED', !question.learningObjectiveId || objectiveAllowed.length > 0, 'Question learning objective is not selected in the blueprint.');
      add('BLUEPRINT_TYPE_ALLOWED', !blueprint.supportedQuestionTypes?.length || blueprint.supportedQuestionTypes.includes(version.questionType), 'Question type is not supported by the blueprint.');
    }
  }

  const provenance = await provenanceChecks(db, version.id);
  add('PROVENANCE_PRESENT', provenance.length > 0, 'At least one source provenance record is required.');
  add('PROVENANCE_TRACEABLE', provenance.every((row) => row.chunkId && row.versionId && row.documentId), 'Every provenance record must resolve to a source chunk, version, and document.');
  const otherVersions = await db.select({ questionId: questionVersions.questionId, stem: questionVersions.stem }).from(questionVersions).where(ne(questionVersions.questionId, question.id));
  add('EXACT_DUPLICATE', !otherVersions.some((row) => normalize(row.stem) === normalize(version.stem)), 'An exact duplicate question was detected.');
  return { errors, warnings, checks, provenance, score: Math.max(0, Math.round(((checks.filter((check) => check.passed).length / Math.max(1, checks.length)) * 100))) };
}

export async function validateQuestion(questionId) {
  const db = getDb();
  const { question, version } = await loadCurrentVersion(db, questionId);
  const result = await validateQuestionData(db, question, version);
  const valid = result.errors.length === 0;
  await db.transaction(async (tx) => {
    await tx.insert(questionValidationResults).values({ questionVersionId: version.id, deterministicStatus: valid ? 'PASSED' : 'FAILED', groundingStatus: result.provenance.length > 0 ? 'GROUNDED' : 'FAILED', duplicateStatus: result.errors.some((item) => item.code === 'EXACT_DUPLICATE') ? 'DUPLICATE' : 'PASSED', errors: result.errors, reasons: result.warnings, validatorVersion: 'module-d-1' });
    await tx.update(questions).set({ validationStatus: valid ? 'PASSED' : 'FAILED', reviewStatus: valid ? 'NEEDS_REVIEW' : 'REJECTED' }).where(eq(questions.id, question.id));
    await tx.update(questionVersions).set({ validationStatus: valid ? 'PASSED' : 'FAILED', reviewStatus: valid ? 'NEEDS_REVIEW' : 'REJECTED' }).where(eq(questionVersions.id, version.id));
  });
  return { valid, status: valid ? 'NEEDS_REVIEW' : 'REJECTED', errors: result.errors, warnings: result.warnings, checks: result.checks, score: result.score, questionId: question.id, versionId: version.id };
}

export async function reviseQuestion(questionId, changes = {}) {
  const db = getDb();
  const { question, version: current } = await loadCurrentVersion(db, questionId);
  const nextVersion = current.version + 1;
  const next = {
    questionType: changes.questionType || current.questionType,
    stem: changes.stem || current.stem,
    options: changes.options || current.options,
    correctAnswer: changes.correctAnswer ?? current.correctAnswer,
    rationale: changes.rationale ?? current.rationale,
    competencyId: current.competencyId,
    claimId: current.claimId,
    learningObjectiveId: current.learningObjectiveId,
    blueprintId: current.blueprintId,
    bloomLevel: changes.cognitiveLevel || current.bloomLevel,
    targetLevel: current.targetLevel,
  };
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(questionVersions).values({ questionId, version: nextVersion, ...next, validationStatus: 'PENDING', reviewStatus: 'DRAFT' }).returning();
    await tx.update(questions).set({ stem: next.stem, options: next.options, questionType: next.questionType, correctAnswer: next.correctAnswer, rationale: next.rationale, bloomLevel: next.bloomLevel, validationStatus: 'PENDING', reviewStatus: 'DRAFT' }).where(eq(questions.id, questionId));
    const previousProvenance = await tx.select().from(questionSourceProvenance).where(eq(questionSourceProvenance.questionVersionId, current.id));
    if (previousProvenance.length) await tx.insert(questionSourceProvenance).values(previousProvenance.map(({ id, questionVersionId, ...row }) => ({ ...row, questionVersionId: created.id })));
    return { questionId, version: created, previousVersionId: current.id, provenanceCopied: previousProvenance.length };
  });
}

export async function reviewQuestion(questionId, action, reason = '') {
  const db = getDb();
  const { question, version } = await loadCurrentVersion(db, questionId);
  if (!['APPROVE', 'REJECT', 'REQUEST_REVISION'].includes(action)) throw lifecycleError('INVALID_REVIEW_ACTION', 'action', 'Review action is not supported.');
  if (action === 'APPROVE') {
    const validation = await validateQuestion(questionId);
    if (!validation.valid) throw lifecycleError('QUESTION_NOT_APPROVABLE', 'reviewStatus', 'Question must pass validation before approval.', 409);
  }
  const status = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'REVISION_REQUIRED';
  const [updatedQuestion] = await db.update(questions).set({ reviewStatus: status }).where(eq(questions.id, question.id)).returning();
  const [updatedVersion] = await db.update(questionVersions).set({ reviewStatus: status }).where(eq(questionVersions.id, version.id)).returning();
  return { action, reason, question: updatedQuestion, version: updatedVersion };
}
