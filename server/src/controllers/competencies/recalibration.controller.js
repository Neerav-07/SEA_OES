import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import {
  officials,
  evidence,
  competencies,
  competencyHistory,
} from "../../db/schema/index.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  calculateWeightedEstimate,
  calculateConfidenceScore,
  calculateRecencyFactor,
} from "../../utils/evidenceFusion.js";

async function recalibrateOne(officialId, allComps) {
  const offEvidence = await db
    .select()
    .from(evidence)
    .where(eq(evidence.officialId, officialId));
  const results = [];

  for (const comp of allComps) {
    const compEv = offEvidence.filter((e) => e.competencyId === comp.id);
    if (compEv.length === 0) continue;

    const previousEstimate = calculateWeightedEstimate(compEv);
    const confidencePct = calculateConfidenceScore(compEv);
    const recencyFactor =
      compEv.reduce((acc, e) => acc + calculateRecencyFactor(e.recordedAt), 0) /
      compEv.length;

    await db.insert(competencyHistory).values({
      officialId,
      competencyId: comp.id,
      previousScore: previousEstimate,
      newScore: previousEstimate,
      reason: "AUTOMATED_RECENCY_RECALIBRATION",
    });

    results.push({
      competencyCode: comp.code,
      competencyName: comp.name,
      recalibratedConfidencePct: confidencePct,
      recencyFactor: Number(recencyFactor.toFixed(2)),
      needsRevalidation: confidencePct < 60,
    });
  }

  return results;
}

/**
 * Run Automated Competency & Recency Recalibration Audit
 * With officialId in the body: recalibrates just that official.
 * Without officialId: organization-wide audit across all officials
 * (this is what the Analytics page's button calls).
 */
export const recalibrateOfficialCompetencies = asyncHandler(
  async (req, res) => {
    const { officialId } = req.body;
    const allComps = await db.select().from(competencies);

    if (officialId) {
      const [official] = await db
        .select()
        .from(officials)
        .where(eq(officials.id, officialId));
      if (!official) {
        return sendError(res, "Official profile not found", 404);
      }

      const recalibratedResults = await recalibrateOne(officialId, allComps);

      return sendSuccess(
        res,
        {
          scope: "SINGLE_OFFICIAL",
          officialId,
          recalibratedCompetenciesCount: recalibratedResults.length,
          recalibrationResults: recalibratedResults,
          auditTimestamp: new Date(),
        },
        "Competency recalibration audit completed",
      );
    }

    const allOfficials = await db.select().from(officials);
    let totalRecalibrated = 0;
    const perOfficialSummary = [];

    for (const official of allOfficials) {
      const results = await recalibrateOne(official.id, allComps);
      totalRecalibrated += results.length;
      if (results.length > 0) {
        perOfficialSummary.push({
          officialId: official.id,
          officialName: official.designation,
          recalibratedCompetenciesCount: results.length,
        });
      }
    }

    return sendSuccess(
      res,
      {
        scope: "ORGANIZATION_WIDE",
        officialsProcessed: allOfficials.length,
        totalCompetenciesRecalibrated: totalRecalibrated,
        perOfficialSummary,
        auditTimestamp: new Date(),
      },
      "Organization-wide competency recalibration audit completed",
    );
  },
);
