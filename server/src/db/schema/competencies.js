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

