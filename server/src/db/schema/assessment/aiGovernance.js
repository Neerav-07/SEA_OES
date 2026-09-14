import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { questionVersions } from './questionIntelligence.js';

export const aiRuns = pgTable('ai_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestId: text('request_id').notNull(),
  useCase: text('use_case').notNull(),
  provider: text('provider'),
  model: text('model'),
  promptVersion: text('prompt_version'),
  policyVersion: text('policy_version').notNull(),
  status: text('status').notNull(),
  fallbackFrom: text('fallback_from'),
  latencyMs: integer('latency_ms'),
  generationParameters: jsonb('generation_parameters').default({}).notNull(),
  guardrailSummary: jsonb('guardrail_summary').default({}).notNull(),
  questionVersionId: uuid('question_version_id').references(() => questionVersions.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  requestIdUnique: uniqueIndex('ai_runs_request_id_uidx').on(table.requestId),
  useCaseCreatedIdx: index('ai_runs_use_case_created_idx').on(table.useCase, table.createdAt),
  questionVersionIdx: index('ai_runs_question_version_idx').on(table.questionVersionId),
}));

export const aiGuardrailResults = pgTable('ai_guardrail_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  aiRunId: uuid('ai_run_id').references(() => aiRuns.id, { onDelete: 'cascade' }),
  questionVersionId: uuid('question_version_id').references(() => questionVersions.id, { onDelete: 'cascade' }),
  stage: text('stage').notNull(),
  allowed: boolean('allowed').notNull(),
  violations: jsonb('violations').default([]).notNull(),
  scores: jsonb('scores').default({}).notNull(),
  policyVersion: text('policy_version').notNull(),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
}, (table) => ({
  aiRunIdx: index('ai_guardrail_results_ai_run_idx').on(table.aiRunId),
  questionVersionIdx: index('ai_guardrail_results_question_version_idx').on(table.questionVersionId),
}));

