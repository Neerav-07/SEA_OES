import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "../db/schema/index.js";
import { bootstrapOesUsers } from "./oesBootstrap.js";

const { Pool } = pg;

let db = null;

export function getDb() {
  if (!db) {
    throw new Error("Database not initialised.");
  }
  return db;
}

import { resilientNeonFetch } from "../utils/resilientFetch.js";

export { resilientNeonFetch };

export async function connectDatabase() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }

  const isNeon = url.includes("neon.tech");

  if (isNeon) {
    neonConfig.fetchFunction = resilientNeonFetch;
    const sql = neon(url);
    db = drizzleNeon(sql, { schema });
    console.log("[DB] Connected via Neon HTTP (with resilient auto-retry)");
  } else {
    const pool = new Pool({ connectionString: url });
    await pool.query("SELECT 1");
    await bootstrapOesUsers(pool);
    db = drizzleNode(pool, { schema });
    console.log("[DB] Connected via pg Pool (local)");
  }
  return db;
}

