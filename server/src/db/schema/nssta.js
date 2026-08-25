import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { competencies } from './competencies.js';

export const nsstaProgrammes = pgTable('nssta_programmes', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  durationDays: integer('duration_days').default(3),
  mode: text('mode').default('Online'),
  capacity: integer('capacity'),
  nominationUrl: text('nomination_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const nsstaCompetencyMap = pgTable('nssta_competency_map', {
  id: uuid('id').defaultRandom().primaryKey(),
  programmeId: uuid('programme_id').references(() => nsstaProgrammes.id, { onDelete: 'cascade' }).notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }).notNull(),
  relevanceLevel: text('relevance_level').default('PRIMARY').notNull(),
});
