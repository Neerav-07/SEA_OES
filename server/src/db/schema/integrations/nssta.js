import { boolean, integer, jsonb, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { competencies } from '../core/competencies.js';

// Existing NSSTA Programmes
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

// Real-time Scraped NSSTA Training Notices & Office Memorandums (OMs)
export const nsstaNotices = pgTable('nssta_notices', {
  id: uuid('id').defaultRandom().primaryKey(),
  omNumber: text('om_number').notNull(), // e.g. 'NSSTA-OM-2026-04'
  title: text('title').notNull(),
  description: text('description'),
  documentUrl: text('document_url'), // Direct official PDF or announcement link
  sourceUrl: text('source_url').default('https://mospi.gov.in'),
  checksum: text('checksum').notNull().unique(), // SHA-256 for deduplication
  publishedDate: timestamp('published_date'),
  nominationDeadline: timestamp('nomination_deadline'),
  durationDays: integer('duration_days').default(3),
  mode: text('mode').default('Online'), // Online, Offline, Hybrid
  targetAudience: jsonb('target_audience').$type().default([]), // ['ISS Officer', 'SSS Analyst']
  status: text('status').default('ACTIVE').notNull(), // ACTIVE, EXPIRED, ARCHIVED
  isMandatory: boolean('is_mandatory').default(true).notNull(),
  urgencyLevel: text('urgency_level').default('HIGH').notNull(), // CRITICAL, HIGH, NORMAL
  scrapedAt: timestamp('scraped_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Semantic Competency Mapping for Ingested Notices
export const nsstaNoticeCompetencies = pgTable('nssta_notice_competencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  noticeId: uuid('notice_id').references(() => nsstaNotices.id, { onDelete: 'cascade' }).notNull(),
  competencyId: uuid('competency_id').references(() => competencies.id, { onDelete: 'cascade' }).notNull(),
  relevanceScore: real('relevance_score').default(0.85).notNull(),
  extractionMethod: text('extraction_method').default('ML_SEMANTIC_MATCH').notNull(), // ML_SEMANTIC_MATCH, RULE_EXTRACT
  reviewStatus: text('review_status').default('PENDING').notNull(), // PENDING, APPROVED, REJECTED
  reviewedBy: uuid('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  reviewRationale: text('review_rationale'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audit and Sync Run Log for Ingestion Crawler
export const nsstaSyncLogs = pgTable('nssta_sync_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  status: text('status').default('IN_PROGRESS').notNull(), // IN_PROGRESS, SUCCESS, PARTIAL, FAILED
  noticesFound: integer('notices_found').default(0).notNull(),
  noticesCreated: integer('notices_created').default(0).notNull(),
  noticesUpdated: integer('notices_updated').default(0).notNull(),
  syncSource: text('sync_source').default('MOSPI_LIVE_SCRAPE').notNull(), // MOSPI_LIVE_SCRAPE, OFFICIAL_MIRROR_FEED
  errors: jsonb('errors').$type().default([]),
});

// Admin Policy & Algorithm Weights Configuration
export const nsstaScoringConfigs = pgTable('nssta_scoring_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  presetName: text('preset_name').default('BALANCED').notNull(),
  weights: jsonb('weights').$type().notNull(), // { gapSeverity, noticeUrgency, roleCriticality, semanticRelevance, deadlineProximity }
  isActive: boolean('is_active').default(true).notNull(),
  updatedBy: uuid('updated_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
