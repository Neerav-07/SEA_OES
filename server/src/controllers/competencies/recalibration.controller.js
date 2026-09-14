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
import { invalidateAnalyticsCache } from "../governance/analytics.controller.js";

/**
 * Pure in-memory recalibration computation for one official
 */
function computeRecalibration(officialId, allComps, offEvidence = []) {
  const results = [];
  const historyBatch = [];

  for (const comp of allComps) {
    const compEv = offEvidence.filter((e) => e.competencyId === comp.id);
    if (compEv.length === 0) continue;

    const previousEstimate = calculateWeightedEstimate(compEv);
    const confidencePct = calculateConfidenceScore(compEv);
    const recencyFactor =
      compEv.reduce((acc, e) => acc + calculateRecencyFactor(e.recordedAt), 0) /
      compEv.length;

    historyBatch.push({
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

  return { results, historyBatch };
}

/**
 * Run Automated Competency & Recency Recalibration Audit
 * With officialId in the body: recalibrates just that official.
 * Without officialId: organization-wide audit across all officials
 * (this is what the Analytics page's button calls).
 */
export const recalibrateOfficialCompetencies = asyncHandler(
  async (req, res) => {
    const { officialId } = req.body || {};

    if (officialId) {
      const [[official], allComps, offEvidence] = await Promise.all([
        db.select().from(officials).where(eq(officials.id, officialId)),
        db.select({ id: competencies.id, code: competencies.code, name: competencies.name }).from(competencies),
        db
          .select({
            id: evidence.id,
            competencyId: evidence.competencyId,
            score: evidence.score,
            confidence: evidence.confidence,
            recordedAt: evidence.recordedAt,
            evidenceType: evidence.evidenceType,
          })
          .from(evidence)
          .where(eq(evidence.officialId, officialId)),
      ]);

      if (!official) {
        return sendError(res, "Official profile not found", 404);
      }

      const { results: recalibratedResults, historyBatch } = computeRecalibration(
        officialId,
        allComps,
        offEvidence,
      );

      if (historyBatch.length > 0) {
        await db.insert(competencyHistory).values(historyBatch).catch((err) => {
          console.warn("[Recalibration] Failed to insert competency history:", err?.message);
        });
      }

      // Invalidate analytics cache so fresh scores are calculated on next request
      invalidateAnalyticsCache();

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

    // ── Organization-Wide Recalibration Audit ──
    // Parallel projected queries fetch all necessary records in a single round-trip
    const [allOfficials, allComps, allEvidence] = await Promise.all([
      db.select({ id: officials.id, designation: officials.designation }).from(officials),
      db.select({ id: competencies.id, code: competencies.code, name: competencies.name }).from(competencies),
      db
        .select({
          id: evidence.id,
          officialId: evidence.officialId,
          competencyId: evidence.competencyId,
          score: evidence.score,
          confidence: evidence.confidence,
          recordedAt: evidence.recordedAt,
          evidenceType: evidence.evidenceType,
        })
        .from(evidence),
    ]);

    // Group evidence by officialId for instant in-memory lookup
    const evidenceByOfficial = new Map();
    for (const ev of allEvidence) {
      if (!evidenceByOfficial.has(ev.officialId)) {
        evidenceByOfficial.set(ev.officialId, []);
      }
      evidenceByOfficial.get(ev.officialId).push(ev);
    }

    let totalRecalibrated = 0;
    const perOfficialSummary = [];
    const allHistoryBatch = [];

    for (const official of allOfficials) {
      const offEvidence = evidenceByOfficial.get(official.id) || [];
      const { results, historyBatch } = computeRecalibration(official.id, allComps, offEvidence);

      if (historyBatch.length > 0) {
        allHistoryBatch.push(...historyBatch);
      }

      totalRecalibrated += results.length;
      if (results.length > 0) {
        perOfficialSummary.push({
          officialId: official.id,
          officialName: official.designation,
          recalibratedCompetenciesCount: results.length,
        });
      }
    }

    // Single batch insert for all updated history records
    if (allHistoryBatch.length > 0) {
      await db.insert(competencyHistory).values(allHistoryBatch).catch((err) => {
        console.warn("[Recalibration] Failed to batch insert competency history:", err?.message);
      });
    }

    // Invalidate analytics cache so fresh organization-wide scores are computed
    invalidateAnalyticsCache();

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
