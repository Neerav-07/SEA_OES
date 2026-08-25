import { boolean, index, pgTable, real, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { competencies } from './competencies.js';

export const learningObjectives = pgTable('learning_objectives', {
  id: uuid('id').defaultRandom().primaryKey(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  targetLevel: real('target_level'),
  status: text('status').default('ACTIVE').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  competencyCodeUnique: uniqueIndex('learning_objectives_competency_code_uidx').on(table.competencyId, table.code),
  competencyStatusIdx: index('learning_objectives_competency_status_idx').on(table.competencyId, table.status, table.isActive),
}));

export const competencyClaims = pgTable('competency_claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }).notNull(),
  learningObjectiveId: uuid('learning_objective_id').references(() => learningObjectives.id, { onDelete: 'set null' }),
  code: text('code').notNull(),
  statement: text('statement').notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  competencyCodeUnique: uniqueIndex('competency_claims_competency_code_uidx').on(table.competencyId, table.code),
  competencyIdx: index('competency_claims_competency_idx').on(table.competencyId),
  learningObjectiveIdx: index('competency_claims_learning_objective_idx').on(table.learningObjectiveId),
  statusIdx: index('competency_claims_status_idx').on(table.status),
}));