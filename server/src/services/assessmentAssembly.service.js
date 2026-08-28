import { asc, desc, eq, inArray } from 'drizzle-orm';

import { assessmentQuestionItems } from '../db/schema/index.js';
import { assessments, questions } from '../db/schema/index.js';
import { getDb } from '../db/index.js';
import { questionSourceProvenance, questionVersions } from '../db/schema/index.js';
import { getAssessmentBlueprintById } from './assessmentBlueprint.service.js';

function failure(code, field, message, statusCode = 400, extra = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = [{ code, field, message, ...extra }];
  return error;
}

function blueprintRequirements(result) {
  const blueprint = result.blueprint;
  return {
    blueprintId: blueprint.id,
    competencyId: blueprint.competencyId,
    questionCount: blueprint.questionCount,
    cognitiveDistribution: blueprint.cognitiveDistribution || {},
    supportedQuestionTypes: blueprint.supportedQuestionTypes || [],
    claims: result.claims.map((mapping) => ({ claimId: mapping.claimId, questionCount: mapping.questionCount })),
    learningObjectives: result.learningObjectives.map((mapping) => ({ learningObjectiveId: mapping.learningObjectiveId, questionCount: mapping.questionCount })),
  };
}

async function loadEligibleVersions(db, requirements) {
  const versions = await db.select({ version: questionVersions, question: questions })
    .from(questionVersions)
    .innerJoin(questions, eq(questionVersions.questionId, questions.id))
    .where(eq(questionVersions.competencyId, requirements.competencyId))
    .orderBy(desc(questionVersions.version), asc(questionVersions.questionId));
  const latestByQuestion = new Map();
  for (const row of versions) if (!latestByQuestion.has(row.question.id)) latestByQuestion.set(row.question.id, row);
  const approved = [...latestByQuestion.values()];
  const provenance = approved.length ? await db.select({ questionVersionId: questionSourceProvenance.questionVersionId }).from(questionSourceProvenance).where(inArray(questionSourceProvenance.questionVersionId, approved.map((row) => row.version.id))) : [];
  const grounded = new Set(provenance.map((row) => row.questionVersionId));
  return approved.filter((row) => grounded.has(row.version.id) && row.version.validationStatus === 'PASSED' && row.version.reviewStatus === 'APPROVED' && requirements.supportedQuestionTypes.includes(row.version.questionType));
}

function selectQuestions(eligible, requirements) {
  const selected = [];
  const used = new Set();
  const take = (predicate) => {
    const candidate = eligible.find((row) => !used.has(row.question.id) && predicate(row));
    if (candidate) { used.add(candidate.question.id); selected.push(candidate); }
    return candidate;
  };
  for (const claim of requirements.claims) for (let index = 0; index < claim.questionCount; index += 1) take((row) => row.version.claimId === claim.claimId);
  for (const objective of requirements.learningObjectives) for (let index = 0; index < objective.questionCount; index += 1) take((row) => row.version.learningObjectiveId === objective.learningObjectiveId);
  for (const [level, count] of Object.entries(requirements.cognitiveDistribution)) for (let index = 0; index < count; index += 1) take((row) => row.version.bloomLevel === level);
  while (selected.length < requirements.questionCount) {
    const candidate = take(() => true);
    if (!candidate) break;
  }
  return selected;
}

export function validateAssessmentAssembly(requirements, selected) {
  const errors = [];
  const warnings = [];
  const checks = [];
  const check = (id, passed, message) => { checks.push({ id, passed, message }); if (!passed) errors.push({ code: id, field: '', message }); };
  check('QUESTION_COUNT', selected.length === requirements.questionCount, `Blueprint requires ${requirements.questionCount} questions but ${selected.length} were selected.`);
  check('COMPETENCY_COVERAGE', selected.every((row) => row.version.competencyId === requirements.competencyId), 'All questions must match the blueprint competency.');
  check('APPROVED_ONLY', selected.every((row) => row.version.reviewStatus === 'APPROVED' && row.version.validationStatus === 'PASSED'), 'Only approved and validated questions may be assembled.');
  check('CURRENT_VERSIONS', new Set(selected.map((row) => row.question.id)).size === selected.length, 'Assessment must not contain duplicate logical questions.');
  check('LATEST_VERSIONS', selected.every((row) => row.isCurrent !== false), 'Assessment must reference the current question version.');
  check('PROVENANCE_PRESENT', selected.every((row) => row.hasProvenance !== false), 'Every assembled question must have source provenance.');
  for (const claim of requirements.claims) check(`CLAIM_${claim.claimId}`, selected.filter((row) => row.version.claimId === claim.claimId).length >= claim.questionCount, `Claim ${claim.claimId} does not have enough eligible questions.`);
  for (const objective of requirements.learningObjectives) check(`OBJECTIVE_${objective.learningObjectiveId}`, selected.filter((row) => row.version.learningObjectiveId === objective.learningObjectiveId).length >= objective.questionCount, `Learning objective ${objective.learningObjectiveId} does not have enough eligible questions.`);
  for (const [level, count] of Object.entries(requirements.cognitiveDistribution)) check(`COGNITIVE_${level}`, selected.filter((row) => row.version.bloomLevel === level).length >= count, `Cognitive level ${level} does not have enough eligible questions.`);
  return { valid: errors.length === 0, errors, warnings, checks, summary: { selected: selected.length, required: requirements.questionCount } };
}

export async function assembleAssessment(blueprintId) {
  const result = await getAssessmentBlueprintById(blueprintId);
  const requirements = blueprintRequirements(result);
  const db = getDb();
  const eligible = await loadEligibleVersions(db, requirements);
  const selected = selectQuestions(eligible, requirements);
  const validation = validateAssessmentAssembly(requirements, selected);
  if (!validation.valid) throw failure('ASSESSMENT_NOT_ASSEMBLABLE', 'blueprintId', 'Blueprint cannot be assembled from eligible approved questions.', 409, { missing: { totalQuestions: Math.max(0, requirements.questionCount - selected.length) } });
  const items = selected.map((row, index) => ({ position: index + 1, questionId: row.question.id, questionVersionId: row.version.id }));
  const [assessment] = await db.insert(assessments).values({ title: `${result.blueprint.title} — Assessment`, competencyId: result.blueprint.competencyId, blueprintId: result.blueprint.id, totalQuestions: requirements.questionCount, blueprint: { assemblyStatus: 'ASSEMBLED', requirements } }).returning();
  await db.insert(assessmentQuestionItems).values(items.map((item) => ({ assessmentId: assessment.id, ...item })));
  return { assessment, requirements, items, validation };
}

async function loadAssessmentRecord(assessmentId) {
  const db = getDb();
  if (typeof assessmentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(assessmentId)) throw failure('INVALID_ASSESSMENT_ID', 'id', 'Assessment ID must be a valid identifier.');
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, assessmentId));
  if (!assessment) throw failure('ASSESSMENT_NOT_FOUND', 'id', 'Assessment was not found.', 404);
  return assessment;
}

export async function getAssessment(assessmentId) {
  const db = getDb();
  const assessment = await loadAssessmentRecord(assessmentId);
  const items = await db.select({ item: assessmentQuestionItems, question: questions, version: questionVersions })
    .from(assessmentQuestionItems)
    .innerJoin(questions, eq(assessmentQuestionItems.questionId, questions.id))
    .innerJoin(questionVersions, eq(assessmentQuestionItems.questionVersionId, questionVersions.id))
    .where(eq(assessmentQuestionItems.assessmentId, assessmentId))
    .orderBy(asc(assessmentQuestionItems.position));
  return { assessment, requirements: assessment.blueprint?.requirements || null, items };
}

export async function validateAssessment(assessmentId) {
  const assembled = await getAssessment(assessmentId);
  if (!assembled.requirements) throw failure('ASSESSMENT_REQUIREMENTS_MISSING', 'assessmentId', 'Assessment requirements are missing.');
  const questionIds = assembled.items.map((item) => item.question.id);
  const versions = questionIds.length ? await getDb().select().from(questionVersions).where(inArray(questionVersions.questionId, questionIds)).orderBy(desc(questionVersions.version)) : [];
  const latest = new Map();
  for (const version of versions) if (!latest.has(version.questionId)) latest.set(version.questionId, version.id);
  const provenance = assembled.items.length ? await getDb().select({ questionVersionId: questionSourceProvenance.questionVersionId }).from(questionSourceProvenance).where(inArray(questionSourceProvenance.questionVersionId, assembled.items.map((item) => item.version.id))) : [];
  const grounded = new Set(provenance.map((row) => row.questionVersionId));
  const validation = validateAssessmentAssembly(assembled.requirements, assembled.items.map((item) => ({ question: item.question, version: item.version, isCurrent: latest.get(item.question.id) === item.version.id, hasProvenance: grounded.has(item.version.id) })));
  return { ...validation, assessmentId };
}
