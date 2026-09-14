import { and, desc, eq, ne } from 'drizzle-orm';

import { assessmentBlueprintClaims, assessmentBlueprintObjectives, assessmentBlueprints } from '../db/schema/index.js';
import { assessments, questions } from '../db/schema/index.js';
import { getDb } from '../db/index.js';
import { competencies } from '../db/schema/index.js';
import { competencyClaims, learningObjectives } from '../db/schema/index.js';
import { aiGuardrailResults, questionAiEvaluations, questionSourceProvenance, questionValidationResults, questionVersions } from '../db/schema/index.js';
import { sourceChunks, sourceDocumentVersions, sourceDocuments } from '../db/schema/index.js';

const QUESTION_TYPES = new Set(['MCQ', 'SCENARIO']);
const COGNITIVE_LEVELS = new Set(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE']);

function lifecycleError(code, field, message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = [{ code, field, message }];
  return error;
}

function normalize(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
const STOPWORDS = new Set(['about', 'according', 'after', 'also', 'and', 'are', 'because', 'been', 'before', 'being', 'best', 'does', 'each', 'from', 'have', 'into', 'must', 'only', 'other', 'should', 'source', 'that', 'the', 'their', 'these', 'this', 'those', 'under', 'using', 'what', 'when', 'where', 'which', 'with', 'would']);
function tokens(value) { return new Set(normalize(value).split(' ').filter((token) => token.length > 2 && !STOPWORDS.has(token))); }
function supportScore(claim, source) {
  const claimTokens = tokens(claim);
  if (claimTokens.size === 0) return 1;
  const sourceTokens = tokens(source);
  return [...claimTokens].filter((token) => sourceTokens.has(token)).length / claimTokens.size;
}
function similarity(left, right) {
  const a = tokens(left); const b = tokens(right);
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 1;
  return [...a].filter((token) => b.has(token)).length / union.size;
}

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
  add('OPTIONS_REQUIRED', version.questionType !== 'MCQ' || options.length === 4, 'MCQ questions require exactly four options.');
  const optionTexts = options.map((option) => typeof option === 'object' ? option.text : option);
  add('OPTIONS_WELL_FORMED', options.every((option) => option && typeof option === 'object' && typeof option.text === 'string' && option.text.trim()), 'Every option must contain non-empty text.');
  add('OPTIONS_UNIQUE', new Set(optionTexts.map(normalize)).size === optionTexts.length, 'Options must not be duplicated.');
  const answer = typeof version.correctAnswer === 'object' && version.correctAnswer !== null ? version.correctAnswer.id || version.correctAnswer.value : version.correctAnswer;
  add('CORRECT_ANSWER_PRESENT', Boolean(answer), 'A correct answer is required.');
  add('CORRECT_ANSWER_MATCHES_OPTION', !answer || options.some((option) => option.id === answer || option.text === answer), 'Correct answer must match an option.');
  const markedCorrect = options.filter((option) => option?.correct === true || option?.isCorrect === true || option?.is_correct === true);
  add('EXACTLY_ONE_CORRECT_OPTION', markedCorrect.length === 1, 'Exactly one option must be marked correct.');
  add('MARKED_CORRECT_CONSISTENT', markedCorrect.length !== 1 || markedCorrect[0].id === answer || markedCorrect[0].text === answer, 'Marked correct option must match the answer.');
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
  const sourceText = provenance.map((row) => row.text).join('\n');
  const correctOption = options.find((option) => option?.id === answer || option?.text === answer);
  const answerSupport = supportScore(correctOption?.text || '', sourceText);
  const rationaleSupport = supportScore(version.rationale || '', sourceText);
  const generatedNumbers = new Set(`${version.stem || ''} ${correctOption?.text || ''} ${version.rationale || ''}`.match(/(?<![A-Za-z])\d+(?:\.\d+)?%?/g) || []);
  const sourceNumbers = new Set(sourceText.match(/(?<![A-Za-z])\d+(?:\.\d+)?%?/g) || []);
  const unsupportedNumbers = [...generatedNumbers].filter((value) => !sourceNumbers.has(value));
  add('ANSWER_GROUNDED', answerSupport >= 0.35, 'The correct answer is insufficiently supported by source evidence.');
  add('RATIONALE_GROUNDED', !version.rationale || rationaleSupport >= 0.25, 'The rationale is insufficiently supported by source evidence.');
  add('NUMERIC_CLAIMS_GROUNDED', unsupportedNumbers.length === 0, 'Generated numeric claims are absent from source evidence.');
  const otherVersions = await db.select({ questionId: questionVersions.questionId, stem: questionVersions.stem }).from(questionVersions).where(ne(questionVersions.questionId, question.id));
  add('EXACT_DUPLICATE', !otherVersions.some((row) => normalize(row.stem) === normalize(version.stem)), 'An exact duplicate question was detected.');
  add('SEMANTIC_DUPLICATE', !otherVersions.some((row) => similarity(row.stem, version.stem) >= 0.82), 'A semantically similar question was detected.');
  const groundingScore = (answerSupport * 0.65) + (rationaleSupport * 0.35);
  return { errors, warnings, checks, provenance, groundingScore, score: Math.max(0, Math.round(((checks.filter((check) => check.passed).length / Math.max(1, checks.length)) * 100))) };
}

export async function validateQuestion(questionId) {
  const db = getDb();
  const { question, version } = await loadCurrentVersion(db, questionId);
  const result = await validateQuestionData(db, question, version);
  const valid = result.errors.length === 0;
  const duplicate = result.errors.some((item) => ['EXACT_DUPLICATE', 'SEMANTIC_DUPLICATE'].includes(item.code));
  const groundingPassed = !result.errors.some((item) => ['PROVENANCE_PRESENT', 'PROVENANCE_TRACEABLE', 'ANSWER_GROUNDED', 'RATIONALE_GROUNDED', 'NUMERIC_CLAIMS_GROUNDED'].includes(item.code));
  await db.insert(questionValidationResults).values({ questionVersionId: version.id, deterministicStatus: valid ? 'PASSED' : 'FAILED', groundingStatus: groundingPassed ? 'GROUNDED' : 'FAILED', duplicateStatus: duplicate ? 'DUPLICATE' : 'PASSED', errors: result.errors, reasons: result.warnings, validatorVersion: 'module-d-2' });
  await db.insert(aiGuardrailResults).values({ questionVersionId: version.id, stage: 'VALIDATION', allowed: valid, violations: result.errors, scores: { grounding: result.groundingScore, validation: result.score / 100 }, policyVersion: '2026-09-05.1' });
  await db.update(questions).set({ validationStatus: valid ? 'PASSED' : 'FAILED', reviewStatus: valid ? 'NEEDS_REVIEW' : 'REJECTED' }).where(eq(questions.id, question.id));
  await db.update(questionVersions).set({ validationStatus: valid ? 'PASSED' : 'FAILED', reviewStatus: valid ? 'NEEDS_REVIEW' : 'REJECTED' }).where(eq(questionVersions.id, version.id));
  return { valid, status: valid ? 'NEEDS_REVIEW' : 'REJECTED', errors: result.errors, warnings: result.warnings, checks: result.checks, score: result.score, questionId: question.id, versionId: version.id };
}

export async function reviseQuestion(questionId, changes = {}) {
  const db = getDb();
  const { version: current } = await loadCurrentVersion(db, questionId);
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
  const [created] = await db.insert(questionVersions).values({ questionId, version: nextVersion, ...next, validationStatus: 'PENDING', reviewStatus: 'DRAFT' }).returning();
  await db.update(questions).set({ stem: next.stem, options: next.options, questionType: next.questionType, correctAnswer: next.correctAnswer, rationale: next.rationale, bloomLevel: next.bloomLevel, validationStatus: 'PENDING', reviewStatus: 'DRAFT' }).where(eq(questions.id, questionId));
  const previousProvenance = await db.select().from(questionSourceProvenance).where(eq(questionSourceProvenance.questionVersionId, current.id));
  if (previousProvenance.length) await db.insert(questionSourceProvenance).values(previousProvenance.map(({ id: _id, questionVersionId: _questionVersionId, ...row }) => ({ ...row, questionVersionId: created.id })));
  return { questionId, version: created, previousVersionId: current.id, provenanceCopied: previousProvenance.length };
}

export async function reviewQuestion(questionId, action, reason = '') {
  const db = getDb();
  const { question, version } = await loadCurrentVersion(db, questionId);
  if (!['APPROVE', 'REJECT', 'REQUEST_REVISION'].includes(action)) throw lifecycleError('INVALID_REVIEW_ACTION', 'action', 'Review action is not supported.');
  if (action === 'APPROVE') {
    const validation = await validateQuestion(questionId);
    if (!validation.valid) throw lifecycleError('QUESTION_NOT_APPROVABLE', 'reviewStatus', 'Question must pass validation before approval.', 409);
    const [evaluation] = await db.select().from(questionAiEvaluations).where(eq(questionAiEvaluations.questionVersionId, version.id)).orderBy(desc(questionAiEvaluations.createdAt)).limit(1);
    if (!evaluation || evaluation.status !== 'PASSED') throw lifecycleError('QUESTION_EVALUATION_NOT_PASSED', 'reviewStatus', 'Question must pass independent grounding evaluation before approval.', 409);
  }
  const status = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'REVISION_REQUIRED';
  const [updatedQuestion] = await db.update(questions).set({ reviewStatus: status }).where(eq(questions.id, question.id)).returning();
  const [updatedVersion] = await db.update(questionVersions).set({ reviewStatus: status }).where(eq(questionVersions.id, version.id)).returning();
  return { action, reason, question: updatedQuestion, version: updatedVersion };
}
