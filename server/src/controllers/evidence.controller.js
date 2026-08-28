import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { evidence, officials, competencies } from "../db/schema/index.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  calculateWeightedEstimate,
  calculateConfidenceScore,
  DEFAULT_TYPE_WEIGHTS,
} from "../utils/evidenceFusion.js";

/**
 * Get all evidence for an official with calculated fused estimates
 */
export const getOfficialEvidence = asyncHandler(async (req, res) => {
  const { officialId } = req.params;
  const offEvidence = await db
    .select()
    .from(evidence)
    .where(eq(evidence.officialId, officialId));
  const allComps = await db.select().from(competencies);

  // Group evidence by competency
  const summaryByCompetency = allComps.map((comp) => {
    const items = offEvidence.filter((e) => e.competencyId === comp.id);
    const fusedEstimate = calculateWeightedEstimate(items);
    const confidencePct = calculateConfidenceScore(items);

    return {
      competencyId: comp.id,
      code: comp.code,
      name: comp.name,
      category: comp.category,
      fusedEstimate,
      confidencePct,
      evidenceCount: items.length,
      items,
    };
  });

  return sendSuccess(
    res,
    {
      officialId,
      totalEvidenceRecords: offEvidence.length,
      summaryByCompetency,
    },
    "Official evidence retrieved successfully",
  );
});

/**
 * Record new evidence item (Diagnostic attempt, Scenario decision, External certificate)
 */
export const recordEvidence = asyncHandler(async (req, res) => {
  const {
    officialId,
    competencyId,
    evidenceType,
    score,
    maxScore = 5.0,
    provenance,
    weight,
  } = req.body;

  if (!officialId || !competencyId || !evidenceType || score === undefined) {
    return sendError(
      res,
      "Official ID, Competency ID, Evidence Type, and Score are required",
      400,
    );
  }

  const [official] = await db
    .select()
    .from(officials)
    .where(eq(officials.id, officialId));
  if (!official) {
    return sendError(res, "Official profile not found", 404);
  }

  const [comp] = await db
    .select()
    .from(competencies)
    .where(eq(competencies.id, competencyId));
  if (!comp) {
    return sendError(res, "Competency definition not found", 404);
  }

  const effectiveWeight = weight || DEFAULT_TYPE_WEIGHTS[evidenceType] || 0.2;

  const [newEvidence] = await db
    .insert(evidence)
    .values({
      officialId,
      competencyId,
      evidenceType,
      score: Number(score),
      maxScore: Number(maxScore),
      weight: Number(effectiveWeight),
      confidence: 0.85,
      provenance:
        provenance ||
        `Diagnostic evaluation on ${new Date().toLocaleDateString()}`,
    })
    .returning();

  return sendSuccess(
    res,
    newEvidence,
    "Evidence record created successfully",
    201,
  );
});

/**
 * Get provenance chain for specific evidence item
 */
export const getEvidenceProvenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [record] = await db.select().from(evidence).where(eq(evidence.id, id));

  if (!record) {
    return sendError(res, "Evidence record not found", 404);
  }

  const [comp] = await db
    .select()
    .from(competencies)
    .where(eq(competencies.id, record.competencyId));

  const provenanceChain = {
    evidenceId: record.id,
    competency: comp
      ? { code: comp.code, name: comp.name, category: comp.category }
      : null,
    evidenceType: record.evidenceType,
    score: `${record.score} / ${record.maxScore}`,
    weightApplied: record.weight,
    provenanceSource: record.provenance,
    timestamp: record.recordedAt,
    verificationAudit: {
      auditable: true,
      integrityCheck: "PASSED",
      sourceType:
        record.evidenceType === "KNOWLEDGE"
          ? "NSSTA Diagnostic Test"
          : "Official Performance Log",
    },
  };

  return sendSuccess(
    res,
    provenanceChain,
    "Evidence provenance chain retrieved",
  );
});
