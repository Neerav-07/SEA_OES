import { index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { competencies } from '../core/competencies.js';
import { competencyClaims, learningObjectives } from '../core/learningObjectives.js';

export const assessmentBlueprints = pgTable('assessment_blueprints', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'restrict' }).notNull(),
  targetProficiency: real('target_proficiency'),
  cognitiveDistribution: jsonb('cognitive_distribution').default({}).notNull(),
  questionCount: integer('question_count').default(10).notNull(),
  supportedQuestionTypes: jsonb('supported_question_types').default([]).notNull(),
  sourceRestrictions: jsonb('source_restrictions').default({}).notNull(),
  evidenceRequirements: jsonb('evidence_requirements').default({}).notNull(),
  status: text('status').default('DRAFT').notNull(),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  competencyStatusIdx: index('assessment_blueprints_competency_status_idx').on(table.competencyId, table.status),
}));

export const assessmentBlueprintClaims = pgTable('assessment_blueprint_claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  blueprintId: uuid('blueprint_id').references(() => assessmentBlueprints.id, { onDelete: 'cascade' }).notNull(),
  claimId: uuid('claim_id').references(() => competencyClaims.id, { onDelete: 'cascade' }).notNull(),
  questionCount: integer('question_count').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  blueprintClaimUnique: uniqueIndex('assessment_blueprint_claims_blueprint_claim_uidx').on(table.blueprintId, table.claimId),
  claimIdx: index('assessment_blueprint_claims_claim_idx').on(table.claimId),
}));

export const assessmentBlueprintObjectives = pgTable('assessment_blueprint_objectives', {
  id: uuid('id').defaultRandom().primaryKey(),
  blueprintId: uuid('blueprint_id').references(() => assessmentBlueprints.id, { onDelete: 'cascade' }).notNull(),
  learningObjectiveId: uuid('learning_objective_id').references(() => learningObjectives.id, { onDelete: 'cascade' }).notNull(),
  questionCount: integer('question_count').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  blueprintObjectiveUnique: uniqueIndex('assessment_blueprint_objectives_blueprint_objective_uidx').on(table.blueprintId, table.learningObjectiveId),
  learningObjectiveIdx: index('assessment_blueprint_objectives_learning_objective_idx').on(table.learningObjectiveId),
}));