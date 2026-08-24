import { pgTable, text, timestamp, uuid, real, integer, jsonb } from 'drizzle-orm/pg-core';
import { officials } from './officials.js';
import { competencies } from './competencies.js';

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
