import { pgTable, text, timestamp, uuid, real } from 'drizzle-orm/pg-core';
import { officials } from '../core/officials.js';
import { competencies } from '../core/competencies.js';

export const evidence = pgTable('evidence', {
  id: uuid('id').defaultRandom().primaryKey(),
  officialId: uuid('official_id').references(() => officials.id, { onDelete: 'cascade' }).notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }).notNull(),
  evidenceType: text('evidence_type').notNull(), // KNOWLEDGE, APPLICATION, PERFORMANCE, EXTERNAL, LEARNING
  score: real('score').notNull(),
  maxScore: real('max_score').default(5.0).notNull(),
  weight: real('weight').default(1.0).notNull(),
  confidence: real('confidence').default(1.0).notNull(),
  provenance: text('provenance'), // Source description / assessment ID
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});
