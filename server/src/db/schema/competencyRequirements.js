import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { competencies } from "./competencies.js";
import { roles } from "./roles.js";

export const competencyRequirements = pgTable(
  "competency_requirements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    competencyId: uuid("competency_id")
      .references(() => competencies.id, { onDelete: "cascade" })
      .notNull(),
    requiredLevel: real("required_level").notNull(),
    priority: integer("priority").default(3).notNull(),
    urgency: integer("urgency").default(3).notNull(),
    mandatory: boolean("mandatory").default(false).notNull(),
    frameworkVersion: text("framework_version").default("v1").notNull(),
    effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
    effectiveTo: timestamp("effective_to"),
    sourceReference: text("source_reference"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("competency_requirements_role_competency_idx").on(
      table.roleId,
      table.competencyId,
      table.frameworkVersion,
    ),
  ],
);
