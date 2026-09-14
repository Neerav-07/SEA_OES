CREATE TABLE IF NOT EXISTS "question_ai_evaluations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "question_version_id" uuid NOT NULL REFERENCES "question_versions"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "model" text,
  "prompt_version" text NOT NULL,
  "source_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "result" jsonb NOT NULL,
  "failures" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "question_ai_evaluations_version_idx" ON "question_ai_evaluations" ("question_version_id");
