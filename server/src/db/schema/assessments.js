import { index, integer, jsonb, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { competencies } from './competencies.js';
import { assessmentBlueprints } from './assessmentBlueprints.js';
import { competencyClaims, learningObjectives } from './learningObjectives.js';

export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }),
  blueprintId: uuid('blueprint_id').references(() => assessmentBlueprints.id, { onDelete: 'set null' }),
  sourceMaterialName: text('source_material_name'),
  blueprint: jsonb('blueprint'),
  totalQuestions: integer('total_questions').default(10).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  blueprintIdx: index('assessments_blueprint_idx').on(table.blueprintId),
  competencyIdx: index('assessments_competency_idx').on(table.competencyId),
}));

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }).notNull(),
  stem: text('stem').notNull(),
  options: jsonb('options').notNull(), // array of option objects with text and correctness
  questionType: text('question_type').default('MCQ').notNull(),
  correctAnswer: jsonb('correct_answer'),
  explanation: text('explanation'),
  rationale: text('rationale'),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'set null' }),
  claimId: uuid('claim_id').references(() => competencyClaims.id, { onDelete: 'set null' }),
  learningObjectiveId: uuid('learning_objective_id').references(() => learningObjectives.id, { onDelete: 'set null' }),
  bloomLevel: text('bloom_level').default('APPLY'),
  targetLevel: real('target_level'),
  intentHash: text('intent_hash'),
  validationStatus: text('validation_status').default('PENDING').notNull(),
  reviewStatus: text('review_status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  assessmentIdx: index('questions_assessment_idx').on(table.assessmentId),
  competencyIdx: index('questions_competency_idx').on(table.competencyId),
  claimIdx: index('questions_claim_idx').on(table.claimId),
  learningObjectiveIdx: index('questions_learning_objective_idx').on(table.learningObjectiveId),
  intentHashIdx: index('questions_intent_hash_idx').on(table.intentHash),
}));
