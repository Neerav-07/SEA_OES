import bcrypt from 'bcrypt';

// The exam preview currently uses the existing authentication API only.
// Initialize just its user table instead of running the old MoSPI seed.
export async function bootstrapOesUsers(pool) {
  await pool.query(`DO $$ BEGIN
    CREATE TYPE plan AS ENUM ('free', 'pro');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    refresh_token_hash text,
    plan plan NOT NULL DEFAULT 'free',
    platform_role text NOT NULL DEFAULT 'EMPLOYEE',
    designation text,
    department text,
    cadre text,
    last_login_at timestamptz,
    notify_on_high_priority boolean NOT NULL DEFAULT true,
    notify_digest boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  const accounts = [
    ['Examiner Demo', 'examiner@oes.local', process.env.OES_DEMO_EXAMINER_PASSWORD || 'Examiner@123!', 'ADMIN'],
    ['Student Demo', 'student@oes.local', process.env.OES_DEMO_STUDENT_PASSWORD || 'Student@123!', 'EMPLOYEE'],
  ];
  for (const [name, email, password, role] of accounts) {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, platform_role)
       VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
      [name, email, hash, role],
    );
  }
}
