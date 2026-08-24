import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const competencies = pgTable("competencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").unique().notNull(), // e.g. SAMPLING_DESIGN, PRICE_STATS
  name: text("name").notNull(),
  category: text("category").notNull(), // Statistical, Technical, Digital Governance, Managerial
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subCompetencies = pgTable(
  "sub_competencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competencyId: uuid("competency_id")
      .references(() => competencies.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sub_competencies_competency_code_idx").on(
      table.competencyId,
      table.code,
    ),
  ],
);

export const learningObjectives = pgTable(
  "learning_objectives",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subCompetencyId: uuid("sub_competency_id")
      .references(() => subCompetencies.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(),
    title: text("title").notNull(),
    taxonomyLevel: integer("taxonomy_level").default(1).notNull(), // 1: Remember, 2: Understand, 3: Apply, 4: Analyze, 5: Evaluate/Create
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("learning_objectives_sub_competency_code_idx").on(
      table.subCompetencyId,
      table.code,
    ),
  ],
);
