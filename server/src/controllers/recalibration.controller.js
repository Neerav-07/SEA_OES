import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import {
  officials,
  evidence,
  competencies,
  competencyHistory,
} from "../db/schema/index.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  calculateWeightedEstimate,
  calculateConfidenceScore,
  calculateRecencyFactor,
} from "../utils/evidenceFusion.js";

/**
 * Run Automated Competency & Recency Recalibration Audit
 */
export const recalibrateOfficialCompetencies = asyncHandler(
  async (req, res) => {
    const { officialId } = req.body;

    if (!officialId) {
      return sendError(res, "Official ID is required for recalibration", 400);
    }

    const [official] = await db
      .select()
      .from(officials)
      .where(eq(officials.id, officialId));
    if (!official) {
      return sendError(res, "Official profile not found", 404);
    }

    const offEvidence = await db
      .select()
      .from(evidence)
      .where(eq(evidence.officialId, officialId));
    const allComps = await db.select().from(competencies);

    const recalibratedResults = [];

    for (const comp of allComps) {
      const compEv = offEvidence.filter((e) => e.competencyId === comp.id);
      if (compEv.length === 0) continue;

      const previousEstimate = calculateWeightedEstimate(compEv);
      const confidencePct = calculateConfidenceScore(compEv);
      const recencyFactor =
        compEv.reduce(
          (acc, e) => acc + calculateRecencyFactor(e.recordedAt),
          0,
        ) / compEv.length;

      // Record audit entry
      await db.insert(competencyHistory).values({
        officialId,
        competencyId: comp.id,
        previousScore: previousEstimate,
        newScore: previousEstimate, // Recency affects confidence, score remains unless re-evaluated
        reason: "AUTOMATED_RECENCY_RECALIBRATION",
      });

      recalibratedResults.push({
        competencyCode: comp.code,
        competencyName: comp.name,
        recalibratedConfidencePct: confidencePct,
        recencyFactor: Number(recencyFactor.toFixed(2)),
        needsRevalidation: confidencePct < 60,
      });
    }

    return sendSuccess(
      res,
      {
        officialId,
        recalibratedCompetenciesCount: recalibratedResults.length,
        recalibrationResults: recalibratedResults,
        auditTimestamp: new Date(),
      },
      "Competency recalibration audit completed",
    );
  },
);
