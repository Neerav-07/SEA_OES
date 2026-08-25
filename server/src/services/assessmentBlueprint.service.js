import { and, desc, eq, inArray } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import {
  assessmentBlueprintClaims,
  assessmentBlueprintObjectives,
  assessmentBlueprints,
} from '../db/schema/assessmentBlueprints.js';
import { competencies } from '../db/schema/competencies.js';
import { competencyClaims, learningObjectives } from '../db/schema/learningObjectives.js';
import { sourceDocumentVersions, sourceDocuments } from '../db/schema/sourceProvenance.js';
import {
  validateAssessmentBlueprint as validateBlueprintConfiguration,
  validateBlueprintId,
  validateCompetencyId as validateBlueprintCompetencyId,
} from '../validators/assessmentBlueprint.validator.js';

const DRAFT_STATUS = 'DRAFT';

function ignoreContext(context) {
  return context;
}

function createValidationError(errors) {
  const error = new Error('Validation failed.');
  error.statusCode = 400;
  error.errors = errors;
  return error;
}

function createDomainError(code, field, message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = [{ code, field, message }];
  return error;
}

function throwIfInvalid(result) {
  if (!result.valid) throw createValidationError(result.errors);
}

function validateLookupCompetencyId(competencyId) {
  const error = validateBlueprintCompetencyId(competencyId);
  if (error) throw createValidationError([error]);
}

function validateAssessmentBlueprintId(id) {
  const error = validateBlueprintId(id);
  if (error) throw createValidationError([error]);
}

function normalizeBlueprintInput(input = {}) {
  return {
    title: typeof input.title === 'string' ? input.title.trim() : input.title,
    competencyId: typeof input.competencyId === 'string' ? input.competencyId.trim() : input.competencyId,
    targetProficiency: input.targetProficiency,
    cognitiveDistribution: input.cognitiveDistribution,
    questionCount: input.questionCount,
    supportedQuestionTypes: input.supportedQuestionTypes,
    claims: input.claims,
    learningObjectives: input.learningObjectives,
    sourceRestrictions: input.sourceRestrictions,
    evidenceRequirements: input.evidenceRequirements,
  };
}

function blueprintValues(input, status = DRAFT_STATUS) {
  return {
    title: input.title.trim(),
    competencyId: input.competencyId.trim(),
    targetProficiency: input.targetProficiency,
    cognitiveDistribution: input.cognitiveDistribution,
    questionCount: input.questionCount,
    supportedQuestionTypes: input.supportedQuestionTypes,
    sourceRestrictions: input.sourceRestrictions ?? {},
    evidenceRequirements: input.evidenceRequirements ?? {},
    status,
  };
}

function claimMappingValues(blueprintId, claims = []) {
  return claims.map(({ claimId, questionCount }) => ({
    blueprintId,
    claimId: claimId.trim(),
    questionCount,
  }));
}

function objectiveMappingValues(blueprintId, learningObjectives = []) {
  return learningObjectives.map(({ learningObjectiveId, questionCount }) => ({
    blueprintId,
    learningObjectiveId: learningObjectiveId.trim(),
    questionCount,
  }));
}

export async function validateCompetencyExists(competencyId) {
  const db = getDb();
  const [competency] = await db
    .select()
    .from(competencies)
    .where(eq(competencies.id, competencyId));

  if (!competency) {
    throw createDomainError('COMPETENCY_NOT_FOUND', 'competencyId', 'Competency was not found.', 404);
  }
  return competency;
}

export async function validateClaimsForCompetency(competencyId, claims = []) {
  if (claims.length === 0) return [];

  const db = getDb();
  const claimIds = claims.map(({ claimId }) => claimId);
  const rows = await db
    .select()
    .from(competencyClaims)
    .where(inArray(competencyClaims.id, claimIds));
  const claimsById = new Map(rows.map((claim) => [claim.id, claim]));
  const errors = [];

  claims.forEach(({ claimId }, index) => {
    const claim = claimsById.get(claimId);
    const field = `claims[${index}].claimId`;
    if (!claim) {
      errors.push({ code: 'CLAIM_NOT_FOUND', field, message: 'Claim was not found.' });
    } else if (claim.competencyId !== competencyId) {
      errors.push({ code: 'CLAIM_COMPETENCY_MISMATCH', field, message: 'Claim does not belong to the selected competency.' });
    } else if (claim.status !== 'ACTIVE') {
      errors.push({ code: 'CLAIM_NOT_USABLE', field, message: 'Claim is not usable.' });
    }
  });

  return errors;
}

export async function validateLearningObjectivesForCompetency(competencyId, objectives = []) {
  if (objectives.length === 0) return [];

  const db = getDb();
  const objectiveIds = objectives.map(({ learningObjectiveId }) => learningObjectiveId);
  const rows = await db
    .select()
    .from(learningObjectives)
    .where(inArray(learningObjectives.id, objectiveIds));
  const objectivesById = new Map(rows.map((objective) => [objective.id, objective]));
  const errors = [];

  objectives.forEach(({ learningObjectiveId }, index) => {
    const objective = objectivesById.get(learningObjectiveId);
    const field = `learningObjectives[${index}].learningObjectiveId`;
    if (!objective) {
      errors.push({ code: 'LEARNING_OBJECTIVE_NOT_FOUND', field, message: 'Learning objective was not found.' });
    } else if (objective.competencyId !== competencyId) {
      errors.push({ code: 'LEARNING_OBJECTIVE_COMPETENCY_MISMATCH', field, message: 'Learning objective does not belong to the selected competency.' });
    } else if (objective.status !== 'ACTIVE' || !objective.isActive) {
      errors.push({ code: 'LEARNING_OBJECTIVE_NOT_USABLE', field, message: 'Learning objective is not usable.' });
    }
  });

  return errors;
}

export async function validateSourceRestrictions(sourceRestrictions = {}) {
  const errors = [];
  const db = getDb();
  const documentIds = sourceRestrictions.documentIds ?? [];
  const documentVersionIds = sourceRestrictions.documentVersionIds ?? [];

  if (documentIds.length > 0) {
    const rows = await db
      .select({ id: sourceDocuments.id })
      .from(sourceDocuments)
      .where(inArray(sourceDocuments.id, documentIds));
    const foundIds = new Set(rows.map(({ id }) => id));
    documentIds.forEach((documentId, index) => {
      if (!foundIds.has(documentId)) {
        errors.push({
          code: 'SOURCE_DOCUMENT_NOT_FOUND',
          field: `sourceRestrictions.documentIds[${index}]`,
          message: 'Source document was not found.',
        });
      }
    });
  }

  if (documentVersionIds.length > 0) {
    const rows = await db
      .select({ id: sourceDocumentVersions.id })
      .from(sourceDocumentVersions)
      .where(inArray(sourceDocumentVersions.id, documentVersionIds));
    const foundIds = new Set(rows.map(({ id }) => id));
    documentVersionIds.forEach((documentVersionId, index) => {
      if (!foundIds.has(documentVersionId)) {
        errors.push({
          code: 'SOURCE_VERSION_NOT_FOUND',
          field: `sourceRestrictions.documentVersionIds[${index}]`,
          message: 'Source document version was not found.',
        });
      }
    });
  }

  return errors;
}

export async function listBlueprintCompetencies() {
  const db = getDb();
  return db
    .select({
      id: competencies.id,
      code: competencies.code,
      name: competencies.name,
      category: competencies.category,
      description: competencies.description,
    })
    .from(competencies);
}

export async function listBlueprintClaimsByCompetency(competencyId) {
  validateLookupCompetencyId(competencyId);
  await validateCompetencyExists(competencyId);
  const db = getDb();
  return db
    .select({
      id: competencyClaims.id,
      competencyId: competencyClaims.competencyId,
      learningObjectiveId: competencyClaims.learningObjectiveId,
      code: competencyClaims.code,
      statement: competencyClaims.statement,
      status: competencyClaims.status,
    })
    .from(competencyClaims)
    .where(and(
      eq(competencyClaims.competencyId, competencyId),
      eq(competencyClaims.status, 'ACTIVE'),
    ));
}

export async function listBlueprintLearningObjectivesByCompetency(competencyId) {
  validateLookupCompetencyId(competencyId);
  await validateCompetencyExists(competencyId);
  const db = getDb();
  return db
    .select({
      id: learningObjectives.id,
      competencyId: learningObjectives.competencyId,
      code: learningObjectives.code,
      title: learningObjectives.title,
      description: learningObjectives.description,
      targetLevel: learningObjectives.targetLevel,
      status: learningObjectives.status,
      isActive: learningObjectives.isActive,
    })
    .from(learningObjectives)
    .where(and(
      eq(learningObjectives.competencyId, competencyId),
      eq(learningObjectives.status, 'ACTIVE'),
      eq(learningObjectives.isActive, true),
    ));
}

async function validateDatabaseRelationships(input) {
  const competency = await validateCompetencyExists(input.competencyId);
  const errors = [
    ...(await validateClaimsForCompetency(input.competencyId, input.claims)),
    ...(await validateLearningObjectivesForCompetency(input.competencyId, input.learningObjectives)),
    ...(await validateSourceRestrictions(input.sourceRestrictions ?? {})),
  ];

  if (errors.length > 0) throw createValidationError(errors);
  return competency;
}

async function validateConfigurationAndRelationships(input) {
  const normalizedInput = normalizeBlueprintInput(input);
  const structuralResult = validateBlueprintConfiguration(normalizedInput);
  throwIfInvalid(structuralResult);
  const competency = await validateDatabaseRelationships(normalizedInput);
  return { input: normalizedInput, competency };
}

async function loadBlueprintMappings(db, blueprintId) {
  const [claimMappings, objectiveMappings] = await Promise.all([
    db
      .select()
      .from(assessmentBlueprintClaims)
      .where(eq(assessmentBlueprintClaims.blueprintId, blueprintId)),
    db
      .select()
      .from(assessmentBlueprintObjectives)
      .where(eq(assessmentBlueprintObjectives.blueprintId, blueprintId)),
  ]);
  return { claimMappings, objectiveMappings };
}

function toValidatorInput(blueprint, claimMappings, objectiveMappings) {
  return {
    title: blueprint.title,
    competencyId: blueprint.competencyId,
    targetProficiency: blueprint.targetProficiency,
    cognitiveDistribution: blueprint.cognitiveDistribution,
    questionCount: blueprint.questionCount,
    supportedQuestionTypes: blueprint.supportedQuestionTypes,
    claims: claimMappings.map(({ claimId, questionCount }) => ({ claimId, questionCount })),
    learningObjectives: objectiveMappings.map(({ learningObjectiveId, questionCount }) => ({ learningObjectiveId, questionCount })),
    sourceRestrictions: blueprint.sourceRestrictions,
    evidenceRequirements: blueprint.evidenceRequirements,
  };
}

async function loadBlueprintRecord(id) {
  validateAssessmentBlueprintId(id);
  const db = getDb();
  const [blueprint] = await db
    .select()
    .from(assessmentBlueprints)
    .where(eq(assessmentBlueprints.id, id));

  if (!blueprint) {
    throw createDomainError('BLUEPRINT_NOT_FOUND', 'id', 'Assessment blueprint was not found.', 404);
  }
  return blueprint;
}

async function persistMappings(tx, blueprintId, input) {
  const claimValues = claimMappingValues(blueprintId, input.claims);
  const objectiveValues = objectiveMappingValues(blueprintId, input.learningObjectives);
  if (claimValues.length > 0) await tx.insert(assessmentBlueprintClaims).values(claimValues);
  if (objectiveValues.length > 0) await tx.insert(assessmentBlueprintObjectives).values(objectiveValues);
}

export async function createAssessmentBlueprint(input, context = {}) {
  ignoreContext(context);
  const { input: normalizedInput, competency } = await validateConfigurationAndRelationships(input);
  const db = getDb();

  return db.transaction(async (tx) => {
    const [blueprint] = await tx
      .insert(assessmentBlueprints)
      .values(blueprintValues(normalizedInput))
      .returning();
    await persistMappings(tx, blueprint.id, normalizedInput);
    return {
      blueprint,
      competency,
      claims: normalizedInput.claims,
      learningObjectives: normalizedInput.learningObjectives,
    };
  });
}

export async function getAssessmentBlueprintById(id, context = {}) {
  ignoreContext(context);
  const blueprint = await loadBlueprintRecord(id);
  const db = getDb();
  const [competency, mappings] = await Promise.all([
    db.select().from(competencies).where(eq(competencies.id, blueprint.competencyId)).then(([row]) => row),
    loadBlueprintMappings(db, id),
  ]);

  const claimRows = mappings.claimMappings.length > 0
    ? await db.select().from(competencyClaims).where(inArray(competencyClaims.id, mappings.claimMappings.map(({ claimId }) => claimId)))
    : [];
  const objectiveRows = mappings.objectiveMappings.length > 0
    ? await db.select().from(learningObjectives).where(inArray(learningObjectives.id, mappings.objectiveMappings.map(({ learningObjectiveId }) => learningObjectiveId)))
    : [];
  const claimsById = new Map(claimRows.map((claim) => [claim.id, claim]));
  const objectivesById = new Map(objectiveRows.map((objective) => [objective.id, objective]));

  return {
    blueprint,
    competency,
    claims: mappings.claimMappings.map((mapping) => ({ ...mapping, claim: claimsById.get(mapping.claimId) })),
    learningObjectives: mappings.objectiveMappings.map((mapping) => ({ ...mapping, learningObjective: objectivesById.get(mapping.learningObjectiveId) })),
  };
}

export async function listAssessmentBlueprints(filters = {}, context = {}) {
  ignoreContext(context);
  const db = getDb();
  const conditions = [];
  if (filters.competencyId) conditions.push(eq(assessmentBlueprints.competencyId, filters.competencyId));
  if (filters.status) conditions.push(eq(assessmentBlueprints.status, filters.status));
  if (filters.targetProficiency !== undefined) conditions.push(eq(assessmentBlueprints.targetProficiency, filters.targetProficiency));

  const query = db.select().from(assessmentBlueprints).orderBy(desc(assessmentBlueprints.updatedAt));
  return conditions.length > 0 ? query.where(and(...conditions)) : query;
}

export async function updateAssessmentBlueprint(id, input, context = {}) {
  ignoreContext(context);
  const existing = await loadBlueprintRecord(id);
  const db = getDb();
  const { claimMappings, objectiveMappings } = await loadBlueprintMappings(db, id);
  const proposedInput = {
    ...existing,
    ...input,
    claims: input.claims ?? claimMappings.map(({ claimId, questionCount }) => ({ claimId, questionCount })),
    learningObjectives: input.learningObjectives ?? objectiveMappings.map(({ learningObjectiveId, questionCount }) => ({ learningObjectiveId, questionCount })),
  };
  const { input: normalizedInput, competency } = await validateConfigurationAndRelationships(proposedInput);

  return db.transaction(async (tx) => {
    const [blueprint] = await tx
      .update(assessmentBlueprints)
      .set({ ...blueprintValues(normalizedInput, existing.status), updatedAt: new Date() })
      .where(eq(assessmentBlueprints.id, id))
      .returning();
    await tx.delete(assessmentBlueprintClaims).where(eq(assessmentBlueprintClaims.blueprintId, id));
    await tx.delete(assessmentBlueprintObjectives).where(eq(assessmentBlueprintObjectives.blueprintId, id));
    await persistMappings(tx, id, normalizedInput);
    return {
      blueprint,
      competency,
      claims: normalizedInput.claims,
      learningObjectives: normalizedInput.learningObjectives,
    };
  });
}

export async function validateAssessmentBlueprint(id, context = {}) {
  ignoreContext(context);
  const blueprint = await loadBlueprintRecord(id);
  const db = getDb();
  const { claimMappings, objectiveMappings } = await loadBlueprintMappings(db, id);
  const input = toValidatorInput(blueprint, claimMappings, objectiveMappings);
  const structuralResult = validateBlueprintConfiguration(input);
  const errors = [...structuralResult.errors];

  if (structuralResult.valid) {
    const relationshipErrors = [
      ...(await validateClaimsForCompetency(input.competencyId, input.claims)),
      ...(await validateLearningObjectivesForCompetency(input.competencyId, input.learningObjectives)),
      ...(await validateSourceRestrictions(input.sourceRestrictions ?? {})),
    ];
    errors.push(...relationshipErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}
