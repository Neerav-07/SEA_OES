import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { competencyHistory, predictionSnapshots } from "../schema/index.js";

const DEMO_REASON = "AUTOMATED_RECENCY_RECALIBRATION";

const DIID_OBSERVATIONS = {
  PYTHON_ANALYTICS: [
    [330, 1.4], [300, 1.5], [270, 1.6], [240, 1.7], [210, 1.8], [180, 1.9],
    [150, 2.0], [120, 2.1], [90, 2.2], [60, 2.3], [30, 2.4], [7, 2.5],
  ],
  AGRI_STATISTICS: [
    [330, 3.4], [300, 3.3], [270, 3.2], [240, 3.1], [210, 3.0], [180, 2.9],
    [150, 2.8], [120, 2.7], [90, 2.6], [60, 2.5], [30, 2.4], [7, 2.3],
  ],
  PROJECT_MANAGEMENT: [
    [330, 2.2], [300, 2.2], [270, 2.3], [240, 2.3], [210, 2.4], [180, 2.4],
    [150, 2.5], [120, 2.5], [90, 2.4], [60, 2.4], [30, 2.5], [7, 2.5],
  ],
  LEADERSHIP: [
    [330, 2.0], [300, 2.1], [270, 2.2], [240, 2.3], [210, 2.4], [180, 2.5],
    [150, 2.6], [120, 2.7], [90, 2.8], [60, 2.9], [30, 3.0], [7, 3.1],
  ],
  STATA_SPSS: [
    [330, 3.0], [300, 2.9], [270, 2.8], [240, 2.7], [210, 2.6], [180, 2.5],
    [150, 2.4], [120, 2.3], [90, 2.2], [60, 2.1], [30, 2.0], [7, 1.9],
  ],
  SURVEY_DESIGN: [
    [330, 2.7], [300, 2.7], [270, 2.8], [240, 2.8], [210, 2.9], [180, 2.9],
    [150, 3.0], [120, 3.0], [90, 3.1], [60, 3.1], [30, 3.2], [7, 3.2],
  ],
};

const NSSO_OBSERVATIONS = {
  SAMPLING_METHODS: [
    [330, 3.2], [300, 3.3], [270, 3.4], [240, 3.6], [210, 3.7], [180, 3.8],
    [150, 3.9], [120, 4.0], [90, 4.0], [60, 4.1], [30, 4.2], [7, 4.2],
  ],
  LABOUR_STATISTICS: [
    [330, 2.8], [300, 2.9], [270, 3.0], [240, 3.1], [210, 3.3], [180, 3.4],
    [150, 3.5], [120, 3.6], [90, 3.7], [60, 3.7], [30, 3.8], [7, 3.8],
  ],
  PYTHON_ANALYTICS: [
    [330, 1.0], [300, 1.0], [270, 1.0], [240, 1.1], [210, 1.1], [180, 1.2],
    [150, 1.2], [120, 1.3], [90, 1.4], [60, 1.4], [30, 1.5], [7, 1.6],
  ],
};

const NAD_OBSERVATIONS = {
  NATIONAL_ACCOUNTS: [
    [330, 2.0], [300, 2.1], [270, 2.1], [240, 2.2], [210, 2.3], [180, 2.4],
    [150, 2.5], [120, 2.6], [90, 2.6], [60, 2.7], [30, 2.8], [7, 2.9],
  ],
  PRICE_STATISTICS: [
    [330, 1.8], [300, 1.9], [270, 2.0], [240, 2.0], [210, 2.1], [180, 2.2],
    [150, 2.3], [120, 2.3], [90, 2.4], [60, 2.5], [30, 2.6], [7, 2.7],
  ],
};

// Seeds longitudinal time-series data for analytics and prediction forecasting graphs
export async function seedCompetencyHistory(officialsList = [], competencyRows = []) {
  console.log("🌱 Seeding longitudinal competency history for analytics & predictions...");
  const findComp = (code) => competencyRows.find((row) => row.code === code);

  let totalSeeded = 0;

  for (const official of officialsList) {
    if (!official) continue;

    let obsMap = DIID_OBSERVATIONS;
    if (official.department?.includes("NSSO")) {
      obsMap = NSSO_OBSERVATIONS;
    } else if (official.department?.includes("National Accounts")) {
      obsMap = NAD_OBSERVATIONS;
    }

    for (const [code, observations] of Object.entries(obsMap)) {
      const competency = findComp(code);
      if (!competency) continue;

      const existing = await db
        .select({ createdAt: competencyHistory.createdAt })
        .from(competencyHistory)
        .where(
          and(
            eq(competencyHistory.officialId, official.id),
            eq(competencyHistory.competencyId, competency.id),
            eq(competencyHistory.reason, DEMO_REASON),
          ),
        );
      const existingDates = new Set(
        existing.map((row) => new Date(row.createdAt).toISOString().slice(0, 10)),
      );

      const rows = observations
        .filter(([daysAgo]) => {
          const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
          return !existingDates.has(date.toISOString().slice(0, 10));
        })
        .map(([daysAgo, score]) => ({
          officialId: official.id,
          competencyId: competency.id,
          previousScore: Number((score - 0.1).toFixed(1)),
          newScore: score,
          reason: DEMO_REASON,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        }));

      if (rows.length) {
        await db.insert(competencyHistory).values(rows);
        totalSeeded += rows.length;
      }
    }

    if (official.department) {
      await db
        .delete(predictionSnapshots)
        .where(eq(predictionSnapshots.department, official.department))
        .catch(() => {});
    }
  }

  console.log(`✅ Seeded ${totalSeeded} historical competency trend observations across departments`);
}
