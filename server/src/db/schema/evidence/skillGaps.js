import {
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { competencies } from "../core/competencies.js";
import { competencyEstimates } from "./competencyEstimates.js";
import { competencyRequirements } from "../core/competencyRequirements.js";
import { officials } from "../core/officials.js";

export const skillGaps = pgTable(
  "skill_gaps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    officialId: uuid("official_id")
      .references(() => officials.id, { onDelete: "cascade" })
      .notNull(),
    competencyId: uuid("competency_id")
      .references(() => competencies.id, { onDelete: "cascade" })
      .notNull(),
    requirementId: uuid("requirement_id")
      .references(() => competencyRequirements.id, { onDelete: "restrict" })
      .notNull(),
    estimateId: uuid("estimate_id").references(() => competencyEstimates.id, {
      onDelete: "restrict",
    }),
    requiredLevel: real("required_level").notNull(),
    estimatedLevel: real("estimated_level").notNull(),
    gapSeverity: real("gap_severity").default(0).notNull(),
    learningPriority: real("learning_priority").default(0).notNull(),
    assessmentPriority: real("assessment_priority").default(0).notNull(),
    category: text("category").notNull(),
    reasons: jsonb("reasons").default([]).notNull(),
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("skill_gaps_official_requirement_idx").on(
      table.officialId,
      table.requirementId,
    ),
  ],
);
