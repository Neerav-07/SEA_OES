import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { competencies } from "../core/competencies.js";
import { officials } from "../core/officials.js";

export const competencyEstimates = pgTable(
  "competency_estimates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    officialId: uuid("official_id")
      .references(() => officials.id, { onDelete: "cascade" })
      .notNull(),
    competencyId: uuid("competency_id")
      .references(() => competencies.id, { onDelete: "cascade" })
      .notNull(),
    masteryScore: real("mastery_score").default(0).notNull(),
    proficiencyLevel: integer("proficiency_level").default(1).notNull(),
    proficiencyLabel: text("proficiency_label").default("AWARENESS").notNull(),
    evidenceSufficiency: real("evidence_sufficiency").default(0).notNull(),
    sufficiencyBreakdown: jsonb("sufficiency_breakdown"),
    estimatorVersion: text("estimator_version").default("mvp-v1").notNull(),
    policyVersion: text("policy_version").default("v1").notNull(),
    evidenceSnapshot: jsonb("evidence_snapshot"),
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("competency_estimates_official_competency_idx").on(
      table.officialId,
      table.competencyId,
    ),
  ],
);
