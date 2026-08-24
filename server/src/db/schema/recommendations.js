import { pgTable, text, timestamp, uuid, real } from 'drizzle-orm/pg-core';
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
