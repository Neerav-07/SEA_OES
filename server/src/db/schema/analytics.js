import { pgTable, text, timestamp, uuid, real, jsonb } from 'drizzle-orm/pg-core';
import { officials } from './officials.js';
import { competencies } from './competencies.js';

export const competencyHistory = pgTable('competency_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  officialId: uuid('official_id').references(() => officials.id, { onDelete: 'cascade' }).notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }).notNull(),
  previousScore: real('previous_score').notNull(),
  newScore: real('new_score').notNull(),
  reason: text('reason').notNull(), // e.g. "DIAGNOSTIC_ASSESSMENT", "COURSE_COMPLETION", "RECENCY_DECAY"
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: text('actor_id').notNull(),
  actionType: text('action_type').notNull(), // e.g. "ROLE_CHANGE", "EVIDENCE_FUSION", "HUMAN_OVERRIDE"
  targetEntity: text('target_entity').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
