/**
 * Sync ML data files from igot.service.js MOCK_COURSES + mospi-competencies DB.
 * Run: node --env-file=.env src/scripts/sync-ml-data.js
 */
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { connectDatabase } from '../config/database.js';
import { competencies } from '../db/schema/index.js';
import { getAllMockCourses } from '../services/igot.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ML_DATA_DIR = path.resolve(__dirname, '../../../ml/data');

async function syncMLData() {
  const db = await connectDatabase();

  // 1. Sync competencies_taxonomy.json from DB
  const allComps = await db.select().from(competencies);
  const taxonomy = allComps.map(c => ({
    code: c.code,
    name: c.name,
    category: c.fracDomain || c.category
  }));

  fs.writeFileSync(
    path.join(ML_DATA_DIR, 'competencies_taxonomy.json'),
    JSON.stringify(taxonomy, null, 2) + '\n'
  );
  console.log(`✅ Synced competencies_taxonomy.json (${taxonomy.length} competencies)`);

  // 2. Sync course_catalogue.json from MOCK_COURSES
  const courses = getAllMockCourses();
  const catalogue = courses.map(c => ({
    course_id: c.identifier,
    title: c.name,
    description: c.description,
    competency_codes: c.competencyCodes,
    provider: c.organisation,
    level: c.level || 'Professional',
    duration_hours: Math.round(parseInt(c.duration) / 3600),
    url: null
  }));

  fs.writeFileSync(
    path.join(ML_DATA_DIR, 'course_catalogue.json'),
    JSON.stringify(catalogue, null, 2) + '\n'
  );
  console.log(`✅ Synced course_catalogue.json (${catalogue.length} courses)`);

  process.exit(0);
}

syncMLData().catch(err => {
  console.error('❌ Sync failed:', err.message);
  process.exit(1);
});
