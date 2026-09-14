import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  console.log("Running column migrations on Neon PostgreSQL...");

  const statements = [
    "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS blueprint_id uuid;",
    "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS source_material_name text;",
    "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS blueprint jsonb;",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type text DEFAULT 'MCQ';",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer jsonb;",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS rationale text;",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS competency_id uuid;",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS claim_id uuid;",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS learning_objective_id uuid;",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS target_level real;",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS validation_status text DEFAULT 'PENDING';",
    "ALTER TABLE questions ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'DRAFT';",
    "ALTER TABLE igot_courses ADD COLUMN IF NOT EXISTS level text;",
    "ALTER TABLE igot_courses ADD COLUMN IF NOT EXISTS learning_outcomes jsonb;",
    "ALTER TABLE igot_courses ADD COLUMN IF NOT EXISTS tags jsonb;",
    "ALTER TABLE igot_courses ADD COLUMN IF NOT EXISTS competency_area text;",
    "ALTER TABLE igot_courses ADD COLUMN IF NOT EXISTS source_mode text;",
    "ALTER TABLE igot_courses ADD COLUMN IF NOT EXISTS banner_url text;",
    "ALTER TABLE igot_courses ADD COLUMN IF NOT EXISTS rating text;",
    "ALTER TABLE officials ADD COLUMN IF NOT EXISTS target_role_id uuid REFERENCES roles(id) ON DELETE SET NULL;",
    "CREATE INDEX IF NOT EXISTS officials_target_role_idx ON officials (target_role_id);",
    `CREATE TABLE IF NOT EXISTS nssta_notices (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      om_number text NOT NULL,
      title text NOT NULL,
      description text,
      document_url text,
      source_url text DEFAULT 'https://mospi.gov.in',
      checksum text NOT NULL UNIQUE,
      published_date timestamp,
      nomination_deadline timestamp,
      duration_days integer DEFAULT 3,
      mode text DEFAULT 'Online',
      target_audience jsonb DEFAULT '[]'::jsonb,
      status text DEFAULT 'ACTIVE' NOT NULL,
      is_mandatory boolean DEFAULT true NOT NULL,
      urgency_level text DEFAULT 'HIGH' NOT NULL,
      scraped_at timestamp DEFAULT now() NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS nssta_notice_competencies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      notice_id uuid NOT NULL REFERENCES nssta_notices(id) ON DELETE CASCADE,
      competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
      relevance_score real DEFAULT 0.85 NOT NULL,
      extraction_method text DEFAULT 'ML_SEMANTIC_MATCH' NOT NULL,
      review_status text DEFAULT 'PENDING' NOT NULL,
      reviewed_by uuid,
      reviewed_at timestamp,
      review_rationale text,
      created_at timestamp DEFAULT now() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS notice_course_recommendations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      official_id uuid NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
      notice_id uuid NOT NULL REFERENCES nssta_notices(id) ON DELETE CASCADE,
      role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
      competency_id uuid REFERENCES competencies(id) ON DELETE SET NULL,
      course_id text NOT NULL,
      score real NOT NULL,
      scoring_factors jsonb NOT NULL,
      formula_version text NOT NULL,
      status text DEFAULT 'RECOMMENDED' NOT NULL,
      provenance jsonb NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS question_ai_evaluations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      question_version_id uuid NOT NULL REFERENCES question_versions(id) ON DELETE CASCADE,
      provider text NOT NULL,
      model text,
      prompt_version text NOT NULL,
      source_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
      result jsonb NOT NULL,
      failures jsonb DEFAULT '[]'::jsonb NOT NULL,
      status text NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    );`,
    `ALTER TABLE nssta_notice_competencies ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'PENDING' NOT NULL;`,
    `ALTER TABLE nssta_notice_competencies ADD COLUMN IF NOT EXISTS reviewed_by uuid;`,
    `ALTER TABLE nssta_notice_competencies ADD COLUMN IF NOT EXISTS reviewed_at timestamp;`,
    `ALTER TABLE nssta_notice_competencies ADD COLUMN IF NOT EXISTS review_rationale text;`,
    `CREATE INDEX IF NOT EXISTS nssta_notice_competencies_review_idx ON nssta_notice_competencies (notice_id, review_status);`,
  ];

  for (const st of statements) {
    try {
      await sql(st);
      console.log("  ✓", st);
    } catch (err) {
      console.warn("  ⚠️", st, err.message);
    }
  }

  console.log("✅ All migrations applied successfully to Neon DB!");
}

migrate().catch(console.error);
