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

/**
 * Resilient fetch wrapper with exponential backoff for Neon serverless HTTP
 * Automatically handles transient TLS socket terminations (UND_ERR_SOCKET) and fetch drops.
 */
async function resilientNeonFetch(endpoint, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(endpoint, options);
    } catch (err) {
      const isTransient =
        err?.cause?.code === "UND_ERR_SOCKET" ||
        err?.message?.includes("fetch failed") ||
        err?.message?.includes("socket") ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT";

      if (isTransient && attempt < maxRetries - 1) {
        const backoffMs = 150 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
      throw err;
    }
  }
}

export async function connectDatabase() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }

  const isNeon = url.includes("neon.tech");

  if (isNeon) {
    const sql = neon(url, { fetchFunction: resilientNeonFetch });
    db = drizzleNeon(sql, { schema });
    console.log("[DB] Connected via Neon HTTP (with resilient auto-retry)");
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

