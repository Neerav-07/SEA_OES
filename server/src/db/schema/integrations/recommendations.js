import { pgTable, text, timestamp, uuid, real, integer, jsonb } from 'drizzle-orm/pg-core';
import { officials } from '../core/officials.js';
import { competencies } from '../core/competencies.js';
import { roles } from '../core/roles.js';
import { nsstaNotices } from './nssta.js';

export const recommendations = pgTable('recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  officialId: uuid('official_id').references(() => officials.id, { onDelete: 'cascade' }).notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }).notNull(),
  courseId: text('course_id').notNull(), // iGOT Karmayogi module / NSSTA TPAC ID
  title: text('title').notNull(),
  provider: text('provider').default('iGOT Karmayogi'),
  matchScore: real('match_score').default(0.9),
  reason: text('reason'),
  status: text('status').default('RECOMMENDED'), // RECOMMENDED, ENROLLED, COMPLETED
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const learningMaterials = pgTable('learning_materials', {
  id: uuid('id').defaultRandom().primaryKey(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }),
  materialCode: text('material_code').unique().notNull(), // e.g. IGOT-STAT-401, NSSTA-TPAC-102
  title: text('title').notNull(),
  provider: text('provider').notNull(), // iGOT Karmayogi, NSSTA Academy, NITI Aayog NDAP
  durationHours: integer('duration_hours').default(4).notNull(),
  prerequisites: jsonb('prerequisites'), // Array of prerequisite material codes
  mappedObjectives: jsonb('mapped_objectives'),
  matchConfidence: real('match_confidence').default(0.88).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Persisted, explainable output of approved-notice course ranking.
export const noticeCourseRecommendations = pgTable('notice_course_recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  officialId: uuid('official_id').references(() => officials.id, { onDelete: 'cascade' }).notNull(),
  noticeId: uuid('notice_id').references(() => nsstaNotices.id, { onDelete: 'cascade' }).notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'set null' }),
  courseId: text('course_id').notNull(),
  score: real('score').notNull(),
  scoringFactors: jsonb('scoring_factors').notNull(),
  formulaVersion: text('formula_version').notNull(),
  status: text('status').default('RECOMMENDED').notNull(),
  provenance: jsonb('provenance').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
