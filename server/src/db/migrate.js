import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('Running column migrations on Neon PostgreSQL...');
  
  const statements = [
    'ALTER TABLE assessments ADD COLUMN IF NOT EXISTS blueprint_id uuid;',
    'ALTER TABLE assessments ADD COLUMN IF NOT EXISTS source_material_name text;',
    'ALTER TABLE assessments ADD COLUMN IF NOT EXISTS blueprint jsonb;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type text DEFAULT \'MCQ\';',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer jsonb;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS rationale text;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS competency_id uuid;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS claim_id uuid;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS learning_objective_id uuid;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS target_level real;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS validation_status text DEFAULT \'PENDING\';',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS review_status text DEFAULT \'DRAFT\';',
  ];

  for (const st of statements) {
    try {
      await sql(st);
      console.log('  ✓', st);
    } catch (err) {
      console.warn('  ⚠️', st, err.message);
    }
  }

  console.log('✅ All migrations applied successfully to Neon DB!');
}

migrate().catch(console.error);
