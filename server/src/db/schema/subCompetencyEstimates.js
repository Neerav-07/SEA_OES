import {
  integer,
  jsonb,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { officials } from "./officials.js";
import { subCompetencies } from "./competencies.js";

export const subCompetencyEstimates = pgTable(
  "sub_competency_estimates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    officialId: uuid("official_id")
      .references(() => officials.id, { onDelete: "cascade" })
      .notNull(),
    subCompetencyId: uuid("sub_competency_id")
      .references(() => subCompetencies.id, { onDelete: "cascade" })
      .notNull(),
    masteryScore: real("mastery_score").default(0).notNull(),
    proficiencyLevel: integer("proficiency_level").default(1).notNull(),
    evidenceSufficiency: real("evidence_sufficiency").default(0).notNull(),
    evidenceSnapshot: jsonb("evidence_snapshot"),
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sub_competency_estimates_official_sub_idx").on(
      table.officialId,
      table.subCompetencyId,
    ),
  ],
);
