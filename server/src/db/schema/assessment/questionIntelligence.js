import { index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { assessmentBlueprints } from './assessmentBlueprints.js';
import { competencies } from '../core/competencies.js';
import { competencyClaims, learningObjectives } from '../core/learningObjectives.js';
import { questions } from './assessments.js';
import { sourceChunks } from '../sources/sourceProvenance.js';

export const questionVersions = pgTable('question_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').default(1).notNull(),
  questionType: text('question_type').default('MCQ').notNull(),
  stem: text('stem').notNull(),
  options: jsonb('options').default([]).notNull(),
  correctAnswer: jsonb('correct_answer'),
  rationale: text('rationale'),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'restrict' }),
  claimId: uuid('claim_id').references(() => competencyClaims.id, { onDelete: 'set null' }),
  learningObjectiveId: uuid('learning_objective_id').references(() => learningObjectives.id, { onDelete: 'set null' }),
  blueprintId: uuid('blueprint_id').references(() => assessmentBlueprints.id, { onDelete: 'set null' }),
  bloomLevel: text('bloom_level').default('APPLY').notNull(),
  targetLevel: real('target_level'),
  intentHash: text('intent_hash'),
  validationStatus: text('validation_status').default('PENDING').notNull(),
  reviewStatus: text('review_status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  questionVersionUnique: uniqueIndex('question_versions_question_version_uidx').on(table.questionId, table.version),
  questionIdx: index('question_versions_question_idx').on(table.questionId),
  blueprintIdx: index('question_versions_blueprint_idx').on(table.blueprintId),
  competencyIdx: index('question_versions_competency_idx').on(table.competencyId),
  learningObjectiveIdx: index('question_versions_learning_objective_idx').on(table.learningObjectiveId),
  intentHashIdx: index('question_versions_intent_hash_idx').on(table.intentHash),
  reviewValidationIdx: index('question_versions_review_validation_idx').on(table.reviewStatus, table.validationStatus),
}));

export const questionIntents = pgTable('question_intents', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionVersionId: uuid('question_version_id').references(() => questionVersions.id, { onDelete: 'cascade' }).notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'restrict' }),
  learningObjectiveId: uuid('learning_objective_id').references(() => learningObjectives.id, { onDelete: 'set null' }),
  claimId: uuid('claim_id').references(() => competencyClaims.id, { onDelete: 'set null' }),
  cognitiveProcess: text('cognitive_process').notNull(),
  requiredAction: text('required_action').notNull(),
  coreConcept: text('core_concept').notNull(),
  scenarioType: text('scenario_type'),
  fingerprint: jsonb('fingerprint').notNull(),
  intentHash: text('intent_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  questionVersionIdx: index('question_intents_question_version_idx').on(table.questionVersionId),
  intentHashIdx: index('question_intents_intent_hash_idx').on(table.intentHash),
  competencyIdx: index('question_intents_competency_idx').on(table.competencyId),
  learningObjectiveIdx: index('question_intents_learning_objective_idx').on(table.learningObjectiveId),
}));

export const questionSourceProvenance = pgTable('question_source_provenance', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionVersionId: uuid('question_version_id').references(() => questionVersions.id, { onDelete: 'cascade' }).notNull(),
  sourceChunkId: uuid('source_chunk_id').references(() => sourceChunks.id, { onDelete: 'restrict' }).notNull(),
  pageNumber: integer('page_number'),
  sectionReference: text('section_reference'),
  textStart: integer('text_start'),
  textEnd: integer('text_end'),
  sourceText: text('source_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  questionVersionIdx: index('question_source_provenance_question_version_idx').on(table.questionVersionId),
  sourceChunkIdx: index('question_source_provenance_source_chunk_idx').on(table.sourceChunkId),
}));

export const questionValidationResults = pgTable('question_validation_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionVersionId: uuid('question_version_id').references(() => questionVersions.id, { onDelete: 'cascade' }).notNull(),
  deterministicStatus: text('deterministic_status').default('PENDING').notNull(),
  groundingStatus: text('grounding_status').default('PENDING').notNull(),
  duplicateStatus: text('duplicate_status').default('PENDING').notNull(),
  errors: jsonb('errors').default([]).notNull(),
  reasons: jsonb('reasons').default([]).notNull(),
  validatorVersion: text('validator_version'),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
}, (table) => ({
  questionVersionIdx: index('question_validation_results_question_version_idx').on(table.questionVersionId),
}));

export const questionAiEvaluations = pgTable('question_ai_evaluations', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionVersionId: uuid('question_version_id').references(() => questionVersions.id, { onDelete: 'cascade' }).notNull(),
  provider: text('provider').notNull(),
  model: text('model'),
  promptVersion: text('prompt_version').notNull(),
  sourceIds: jsonb('source_ids').default([]).notNull(),
  result: jsonb('result').notNull(),
  failures: jsonb('failures').default([]).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({ questionVersionIdx: index('question_ai_evaluations_version_idx').on(table.questionVersionId) }));
