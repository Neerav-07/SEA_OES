CREATE TABLE IF NOT EXISTS "notice_course_recommendations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "official_id" uuid NOT NULL REFERENCES "officials"("id") ON DELETE CASCADE,
  "notice_id" uuid NOT NULL REFERENCES "nssta_notices"("id") ON DELETE CASCADE,
  "role_id" uuid REFERENCES "roles"("id") ON DELETE SET NULL,
  "competency_id" uuid REFERENCES "competencies"("id") ON DELETE SET NULL,
  "course_id" text NOT NULL,
  "score" real NOT NULL,
  "scoring_factors" jsonb NOT NULL,
  "formula_version" text NOT NULL,
  "status" text DEFAULT 'RECOMMENDED' NOT NULL,
  "provenance" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "notice_course_recommendations_official_idx" ON "notice_course_recommendations" ("official_id", "score");
