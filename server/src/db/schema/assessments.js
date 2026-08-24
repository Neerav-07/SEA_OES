import { pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';
import { competencies } from './competencies.js';

export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }),
  sourceMaterialName: text('source_material_name'),
  blueprint: jsonb('blueprint'),
  totalQuestions: integer('total_questions').default(10).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }).notNull(),
  stem: text('stem').notNull(),
  options: jsonb('options').notNull(), // array of option objects with text and correctness
  explanation: text('explanation'),
  bloomLevel: text('bloom_level').default('APPLY'),
  intentHash: text('intent_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
