import { neon } from '@neondatabase/serverless';
import pg from 'pg';
import { seedDatabase } from './seed.js';

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
];

export async function ensureDatabaseTablesCreated(url) {
  try {
    const isNeon = url.includes('neon.tech');
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
    console.log('✅ Database tables verified/created');
    await seedDatabase();
  } catch (error) {
    console.warn('⚠️ Auto DB initialization warning:', error.message);
  }
}
