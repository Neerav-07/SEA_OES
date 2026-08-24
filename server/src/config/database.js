import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "../db/schema/index.js";
import { ensureDatabaseTablesCreated } from "../db/autoInit.js";

const { Pool } = pg;

let db;

export function getDb() {
  if (!db) {
    throw new Error("Database not initialised.");
  }
  return db;
}

export async function connectDatabase() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }

  const isNeon = url.includes("neon.tech");

  if (isNeon) {
    const sql = neon(url);
    db = drizzleNeon(sql, { schema });
    console.log("[DB] Connected via Neon HTTP");
  } else {
    const pool = new Pool({ connectionString: url });
    await pool.query("SELECT 1");
    db = drizzleNode(pool, { schema });
    console.log("[DB] Connected via pg Pool (local)");
  }

  // Ensure tables and baseline seeds exist in database
  await ensureDatabaseTablesCreated(url);

  return db;
}
