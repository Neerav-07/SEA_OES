ALTER TABLE "nssta_notice_competencies" ADD COLUMN IF NOT EXISTS "review_status" text DEFAULT 'PENDING' NOT NULL;
ALTER TABLE "nssta_notice_competencies" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid;
ALTER TABLE "nssta_notice_competencies" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp;
ALTER TABLE "nssta_notice_competencies" ADD COLUMN IF NOT EXISTS "review_rationale" text;
CREATE INDEX IF NOT EXISTS "nssta_notice_competencies_review_idx" ON "nssta_notice_competencies" ("notice_id", "review_status");
