import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "../core/users.js";

export const predictionSnapshots = pgTable("prediction_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  department: text("department").notNull(),
  forecastMonths: integer("forecast_months").notNull().default(6),
  predictions: jsonb("predictions").notNull().default([]),
  readinessScore: real("readiness_score").notNull().default(0),
  modelConfidence: real("model_confidence").notNull().default(0),
  validationStatus: text("validation_status").notNull().default("PENDING"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewComment: text("review_comment"),
  modelType: text("model_type").notNull().default("Evidence-gated signal"),
  trainingSamples: integer("training_samples").notNull().default(0),
  dataSource: text("data_source")
    .notNull()
    .default("official skill gaps and competency history"),
  dataWindowStart: timestamp("data_window_start", { withTimezone: true }),
  dataWindowEnd: timestamp("data_window_end", { withTimezone: true }),
  recordCount: integer("record_count").notNull().default(0),
  missingDataRate: real("missing_data_rate").notNull().default(0),
  modelVersion: text("model_version").notNull().default("skill-risk-v1"),
  evidenceStatus: text("evidence_status")
    .notNull()
    .default("INSUFFICIENT_HISTORY"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
