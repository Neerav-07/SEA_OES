import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { officials } from "../core/officials.js";

export const igotCourses = pgTable("igot_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  igotIdentifier: text("igot_identifier").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  contentType: text("content_type").default("Course"),
  organisation: text("organisation"),
  appIconUrl: text("app_icon_url"),
  status: text("status").default("Live"),
  pkgVersion: integer("pkg_version").default(1),
  durationSeconds: integer("duration_seconds"),
  level: text("level"),
  learningOutcomes: jsonb("learning_outcomes"),
  tags: jsonb("tags"),
  competencyArea: text("competency_area"),
  sourceMode: text("source_mode"),
  bannerUrl: text("banner_url"),
  rating: text("rating"),
  lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const igotEnrolments = pgTable("igot_enrolments", {
  id: uuid("id").defaultRandom().primaryKey(),
  officialId: uuid("official_id")
    .references(() => officials.id, { onDelete: "cascade" })
    .notNull(),
  igotCourseId: uuid("igot_course_id")
    .references(() => igotCourses.id, { onDelete: "cascade" })
    .notNull(),
  igotBatchId: text("igot_batch_id"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completionPercentage: integer("completion_percentage").default(0),
  status: text("status").default("ENROLLED"),
  completedAt: timestamp("completed_at"),
  lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  evidenceCreated: boolean("evidence_created").default(false).notNull(),
});
