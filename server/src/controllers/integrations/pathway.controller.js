import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  officials,
  competencies,
  competencyRequirements,
  evidence,
  learningMaterials,
} from "../../db/schema/index.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { calculateWeightedEstimate } from "../../utils/evidenceFusion.js";
import { calculateSkillGaps } from "../../utils/skillGapCalculator.js";
import {
  getCourseRecommendations,
  mapTextToCompetencies,
} from "../../services/ml.service.js";

/**
 * Get Personalized iGOT & NSSTA Learning Pathway for Official
 * Courses are matched against the official's REAL, computed skill gaps via
 * the ML service's recommend-courses endpoint (ml/pipelines/recommendation_engine.py),
 * not a hardcoded list.
 */
export const getPersonalizedPathway = asyncHandler(async (req, res) => {
  const { officialId } = req.params;

  const [official] = await db
    .select()
    .from(officials)
    .where(eq(officials.id, officialId));
  if (!official) {
    return sendError(res, "Official profile not found", 404);
  }

  const allComps = await db.select().from(competencies);
  const reqs = official.roleId
    ? await db
        .select()
        .from(competencyRequirements)
        .where(eq(competencyRequirements.roleId, official.roleId))
    : [];
  const offEvidence = await db
    .select()
    .from(evidence)
    .where(eq(evidence.officialId, officialId));

  const estimates = allComps.map((comp) => {
    const compEv = offEvidence.filter((e) => e.competencyId === comp.id);
    return {
      competencyId: comp.id,
      proficiencyLevel:
        compEv.length > 0 ? calculateWeightedEstimate(compEv) : 1.0,
      evidenceSufficiency:
        compEv.length > 0 ? Math.min(1, compEv.length * 0.25) : 0,
    };
  });

  const requirements = reqs.map((r) => ({
    id: r.id,
    competencyId: r.competencyId,
    requiredLevel: r.requiredLevel,
    priority: r.priority,
    urgency: r.urgency,
    mandatory: r.mandatory,
  }));

  const gaps = calculateSkillGaps({ requirements, estimates })
    .map((g) => ({
      ...g,
      competency: allComps.find((c) => c.id === g.competencyId),
    }))
    .filter((g) => g.competency && g.gapSeverity > 0)
    .sort((a, b) => b.learningPriority - a.learningPriority);

  let pathwayModules = [];

  if (gaps.length > 0) {
    try {
      const skillGapPayload = gaps.map((g) => ({
        competency_code: g.competency.code,
        competency_name: g.competency.name,
        gap_delta: g.gapSeverity,
      }));

      const { recommendations } = await getCourseRecommendations({
        skillGaps: skillGapPayload,
      });

      pathwayModules = (recommendations || []).map((rec, idx) => ({
        step: idx + 1,
        courseCode: rec.course_id,
        title: rec.title,
        provider: rec.provider,
        durationHours: rec.duration_hours,
        targetCompetency: rec.target_competency,
        matchScore: rec.match_score,
        status: "RECOMMENDED",
        reason: rec.reason,
      }));
    } catch {
      // ML recommendation service unreachable — return no modules rather
      // than fabricated ones
      pathwayModules = [];
    }
  }

  const totalEstimatedHours = pathwayModules.reduce(
    (acc, m) => acc + (m.durationHours || 0),
    0,
  );

  const pathway = {
    officialId,
    officialName: official.designation,
    totalModules: pathwayModules.length,
    totalEstimatedHours,
    pathwayModules,
  };

  return sendSuccess(
    res,
    pathway,
    "Personalized learning pathway composed successfully",
  );
});

/**
 * Ingest New Learning Material & Trigger Semantic Competency Mapping
 * Calls the real ML mapping endpoint when rawTextContent is provided and no
 * competencyId was given explicitly.
 */
export const ingestLearningMaterial = asyncHandler(async (req, res) => {
  const {
    title,
    provider,
    materialCode,
    durationHours = 4,
    rawTextContent,
    competencyId,
  } = req.body;

  if (!title || !provider || !materialCode) {
    return sendError(
      res,
      "Title, Provider, and Material Code are required",
      400,
    );
  }

  let resolvedCompetencyId = competencyId || null;
  let mappingResult = null;
  const textForMapping = (rawTextContent && rawTextContent.trim().length > 0)
    ? rawTextContent
    : `${title}. ${provider || ''}`;

  if (!resolvedCompetencyId && textForMapping.trim()) {
    try {
      const matches = await mapTextToCompetencies({
        text: textForMapping,
        topK: 1,
      });
      const topMatch = matches?.[0];
      if (topMatch) {
        const [matchedComp] = await db
          .select()
          .from(competencies)
          .where(eq(competencies.code, topMatch.code));
        if (matchedComp) resolvedCompetencyId = matchedComp.id;
        mappingResult = topMatch;
      }
    } catch {
      mappingResult = null;
    }
  }

  const materialValues = {
    materialCode,
    title,
    provider,
    durationHours: Number(durationHours),
    competencyId: resolvedCompetencyId,
    mappedObjectives: null,
  };
  if (mappingResult && typeof mappingResult.match_score === "number") {
    materialValues.matchConfidence = mappingResult.match_score;
  }

  const [newMaterial] = await db
    .insert(learningMaterials)
    .values(materialValues)
    .returning();

  return sendSuccess(
    res,
    {
      material: newMaterial,
      semanticMappingResult: mappingResult
        ? {
            status: "MAPPED",
            confidenceScore: mappingResult.match_score,
            mappedCompetencyCode: mappingResult.code,
            mappedCompetencyName: mappingResult.name,
          }
        : { status: resolvedCompetencyId ? "MANUALLY_ASSIGNED" : "UNMAPPED" },
    },
    "Learning material ingested successfully",
    201,
  );
});

/**
 * Get Catalogue of Ingested Learning Materials
 */
export const getLearningMaterials = asyncHandler(async (req, res) => {
  const list = await db.select().from(learningMaterials);
  return sendSuccess(res, list, "Learning materials catalogue retrieved");
});
