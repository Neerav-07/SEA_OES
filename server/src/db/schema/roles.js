import { pgTable, text, timestamp, uuid, real, boolean } from 'drizzle-orm/pg-core';
import { competencies } from './competencies.js';

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').unique().notNull(), // e.g. STAT_OFFICER, DATA_ANALYST
  title: text('title').notNull(),
  department: text('department').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roleCompetencies = pgTable('role_competencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }).notNull(),
  requiredLevel: real('required_level').default(3.0).notNull(), // Level 1.0 to 5.0
  priority: text('priority').default('HIGH').notNull(), // HIGH, MEDIUM, LOW
  isMandatory: boolean('is_mandatory').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
