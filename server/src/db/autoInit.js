import { neon } from "@neondatabase/serverless";
import pg from "pg";
import { seedDatabase } from "./seed.js";

const { Pool } = pg;

const TABLE_QUERIES = [
  `CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    refresh_token_hash text,
    plan text DEFAULT 'free' NOT NULL,
    last_login_at timestamp with time zone,
    notify_on_high_priority boolean DEFAULT true NOT NULL,
    notify_digest boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL UNIQUE,
    title text NOT NULL,
    department text NOT NULL,
    description text,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS officials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
    designation text NOT NULL,
    department text NOT NULL,
    cadre text,
    experience_years integer DEFAULT 0,
    education text,
    preferred_language text DEFAULT 'en',
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS competencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    category text NOT NULL,
    description text,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS sub_competencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS learning_objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    sub_competency_id uuid NOT NULL REFERENCES sub_competencies(id) ON DELETE CASCADE,
    code text NOT NULL,
    title text NOT NULL,
    taxonomy_level integer DEFAULT 1 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `ALTER TABLE sub_competencies ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL;`,
  `ALTER TABLE learning_objectives ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL;`,

  `CREATE TABLE IF NOT EXISTS competency_requirements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    required_level real NOT NULL,
    priority integer DEFAULT 3 NOT NULL,
    urgency integer DEFAULT 3 NOT NULL,
    mandatory boolean DEFAULT false NOT NULL,
    framework_version text DEFAULT 'v1' NOT NULL,
    effective_from timestamp DEFAULT now() NOT NULL,
    effective_to timestamp,
    source_reference text,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS competency_requirements_role_competency_idx
    ON competency_requirements (role_id, competency_id, framework_version);`,

  `CREATE TABLE IF NOT EXISTS competency_estimates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    official_id uuid NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    mastery_score real DEFAULT 0 NOT NULL,
    proficiency_level integer DEFAULT 1 NOT NULL,
    proficiency_label text DEFAULT 'AWARENESS' NOT NULL,
    evidence_sufficiency real DEFAULT 0 NOT NULL,
    sufficiency_breakdown jsonb,
    estimator_version text DEFAULT 'mvp-v1' NOT NULL,
    policy_version text DEFAULT 'v1' NOT NULL,
    evidence_snapshot jsonb,
    calculated_at timestamp DEFAULT now() NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS competency_estimates_official_competency_idx
    ON competency_estimates (official_id, competency_id);`,

  `CREATE TABLE IF NOT EXISTS sub_competency_estimates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    official_id uuid NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    sub_competency_id uuid NOT NULL REFERENCES sub_competencies(id) ON DELETE CASCADE,
    mastery_score real DEFAULT 0 NOT NULL,
    proficiency_level integer DEFAULT 1 NOT NULL,
    evidence_sufficiency real DEFAULT 0 NOT NULL,
    evidence_snapshot jsonb,
    calculated_at timestamp DEFAULT now() NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS sub_competency_estimates_official_sub_idx
    ON sub_competency_estimates (official_id, sub_competency_id);`,

  `CREATE TABLE IF NOT EXISTS skill_gaps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    official_id uuid NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    requirement_id uuid NOT NULL REFERENCES competency_requirements(id) ON DELETE RESTRICT,
    estimate_id uuid REFERENCES competency_estimates(id) ON DELETE RESTRICT,
    required_level real NOT NULL,
    estimated_level real NOT NULL,
    gap_severity real DEFAULT 0 NOT NULL,
    learning_priority real DEFAULT 0 NOT NULL,
    assessment_priority real DEFAULT 0 NOT NULL,
    category text NOT NULL,
    reasons jsonb DEFAULT '[]'::jsonb NOT NULL,
    calculated_at timestamp DEFAULT now() NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS skill_gaps_official_requirement_idx
    ON skill_gaps (official_id, requirement_id);`,

  `CREATE TABLE IF NOT EXISTS role_competencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    required_level real DEFAULT 3 NOT NULL,
    priority text DEFAULT 'HIGH' NOT NULL,
    is_mandatory boolean DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS evidence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    official_id uuid NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    evidence_type text NOT NULL,
    score real NOT NULL,
    max_score real DEFAULT 5 NOT NULL,
    weight real DEFAULT 1 NOT NULL,
    confidence real DEFAULT 1 NOT NULL,
    provenance text,
    recorded_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
    source_material_name text,
    blueprint jsonb,
    total_questions integer DEFAULT 10 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    stem text NOT NULL,
    options jsonb NOT NULL,
    explanation text,
    bloom_level text DEFAULT 'APPLY',
    intent_hash text,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    official_id uuid NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    course_id text NOT NULL,
    title text NOT NULL,
    provider text DEFAULT 'iGOT Karmayogi',
    match_score real DEFAULT 0.9,
    reason text,
    status text DEFAULT 'RECOMMENDED',
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS resource_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text DEFAULT 'active' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    actor_id text NOT NULL,
    action_type text NOT NULL,
    target_entity text NOT NULL,
    metadata jsonb,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS competency_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    official_id uuid NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    previous_score real NOT NULL,
    new_score real NOT NULL,
    reason text NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS learning_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
    material_code text NOT NULL UNIQUE,
    title text NOT NULL,
    provider text NOT NULL,
    duration_hours integer DEFAULT 4 NOT NULL,
    prerequisites jsonb,
    mapped_objectives jsonb,
    match_confidence real DEFAULT 0.88 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS competency_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    learning_objective_id uuid REFERENCES learning_objectives(id) ON DELETE SET NULL,
    code text NOT NULL,
    statement text NOT NULL,
    status text DEFAULT 'ACTIVE' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS assessment_blueprints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    target_proficiency real,
    cognitive_distribution jsonb DEFAULT '{}'::jsonb NOT NULL,
    question_count integer DEFAULT 10 NOT NULL,
    supported_question_types jsonb DEFAULT '[]'::jsonb NOT NULL,
    source_restrictions jsonb DEFAULT '{}'::jsonb NOT NULL,
    evidence_requirements jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'DRAFT' NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS assessment_blueprint_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    blueprint_id uuid NOT NULL REFERENCES assessment_blueprints(id) ON DELETE CASCADE,
    claim_id uuid NOT NULL REFERENCES competency_claims(id) ON DELETE CASCADE,
    question_count integer DEFAULT 1 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS assessment_blueprint_objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    blueprint_id uuid NOT NULL REFERENCES assessment_blueprints(id) ON DELETE CASCADE,
    learning_objective_id uuid NOT NULL REFERENCES learning_objectives(id) ON DELETE CASCADE,
    question_count integer DEFAULT 1 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS source_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    external_id text,
    name text NOT NULL,
    document_type text DEFAULT 'PDF' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS source_document_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
    version integer DEFAULT 1 NOT NULL,
    checksum text,
    status text DEFAULT 'PENDING' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS source_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    document_version_id uuid NOT NULL REFERENCES source_document_versions(id) ON DELETE CASCADE,
    chunk_reference text NOT NULL,
    page_number integer,
    section_reference text,
    text text NOT NULL,
    text_start integer,
    text_end integer,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS question_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    version integer DEFAULT 1 NOT NULL,
    question_type text DEFAULT 'MCQ' NOT NULL,
    stem text NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    correct_answer jsonb,
    rationale text,
    competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
    claim_id uuid REFERENCES competency_claims(id) ON DELETE SET NULL,
    learning_objective_id uuid REFERENCES learning_objectives(id) ON DELETE SET NULL,
    blueprint_id uuid REFERENCES assessment_blueprints(id) ON DELETE SET NULL,
    bloom_level text DEFAULT 'APPLY' NOT NULL,
    target_level real,
    intent_hash text,
    validation_status text DEFAULT 'PENDING' NOT NULL,
    review_status text DEFAULT 'DRAFT' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS question_intents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    question_version_id uuid NOT NULL REFERENCES question_versions(id) ON DELETE CASCADE,
    competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
    learning_objective_id uuid REFERENCES learning_objectives(id) ON DELETE SET NULL,
    claim_id uuid REFERENCES competency_claims(id) ON DELETE SET NULL,
    cognitive_process text NOT NULL,
    required_action text NOT NULL,
    core_concept text NOT NULL,
    scenario_type text,
    fingerprint jsonb NOT NULL,
    intent_hash text NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS question_source_provenance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    question_version_id uuid NOT NULL REFERENCES question_versions(id) ON DELETE CASCADE,
    source_chunk_id uuid NOT NULL REFERENCES source_chunks(id) ON DELETE CASCADE,
    page_number integer,
    section_reference text,
    text_start integer,
    text_end integer,
    source_text text,
    created_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS question_validation_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    question_version_id uuid NOT NULL REFERENCES question_versions(id) ON DELETE CASCADE,
    deterministic_status text DEFAULT 'PENDING' NOT NULL,
    grounding_status text DEFAULT 'PENDING' NOT NULL,
    duplicate_status text DEFAULT 'PENDING' NOT NULL,
    errors jsonb DEFAULT '[]'::jsonb NOT NULL,
    reasons jsonb DEFAULT '[]'::jsonb NOT NULL,
    validator_version text,
    checked_at timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS assessment_question_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    question_version_id uuid NOT NULL REFERENCES question_versions(id) ON DELETE CASCADE,
    position integer NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );`,
];

export async function ensureDatabaseTablesCreated(url) {
  try {
    const isNeon = url.includes("neon.tech");
    if (isNeon) {
      const sql = neon(url);
      for (const query of TABLE_QUERIES) {
        await sql(query);
      }
    } else {
      const pool = new Pool({ connectionString: url });
      for (const query of TABLE_QUERIES) {
        await pool.query(query);
      }
      await pool.end();
    }
    console.log("✅ Database tables verified/created");
    await seedDatabase();
  } catch (error) {
    console.warn("⚠️ Auto DB initialization warning:", error.message);
  }
}
