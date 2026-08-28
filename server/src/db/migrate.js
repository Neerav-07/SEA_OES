import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const { Client } = pg;

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: './src/db/migrations' });
  } finally {
    await client.end();
  }
}

runMigrations().catch((error) => {
  const detail = error.message || error.code || 'Unknown database error.';
  console.error(`Database migration failed: ${detail}`);
  process.exitCode = 1;
});
