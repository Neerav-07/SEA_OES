import 'dotenv/config';
import { connectDatabase } from '../config/database.js';
import { syncNSSTANotices } from '../services/nsstaScraper.service.js';

/**
 * CLI Runner for automated NSSTA circulars sync (invoked by GitHub Actions or cron).
 */
async function main() {
  const startTime = Date.now();
  console.log(`[NSSTA Cron] Initializing automated sync at ${new Date().toISOString()}`);

  try {
    await connectDatabase();
    console.log('[NSSTA Cron] Connected to database. Executing notice crawler and ingestion...');

    const result = await syncNSSTANotices();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('[NSSTA Cron] ✅ Sync completed successfully!');
    console.log(`  Source Mode:     ${result.sourceMode}`);
    console.log(`  Notices Found:   ${result.noticesFound}`);
    console.log(`  Notices Created: ${result.noticesCreated}`);
    console.log(`  Notices Updated: ${result.noticesUpdated}`);
    console.log(`  Execution Time:  ${duration}s`);

    if (result.errors && result.errors.length > 0) {
      console.warn('[NSSTA Cron] ⚠️ Non-fatal warnings encountered:');
      console.warn(JSON.stringify(result.errors, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('[NSSTA Cron] ❌ Fatal error executing sync:');
    console.error(err);
    process.exit(1);
  }
}

main();
