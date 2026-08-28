import { db } from "../../db/index.js";

import {
  officials,
  roles,
  roleCompetencies,
  competencies,
  evidence,
  assessments,
  questions,
} from "../../db/schema/index.js";

import { eq } from "drizzle-orm";

import { sendSuccess, sendError } from "../../utils/response.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import { generateAssessment } from "../../services/ml.service.js";

/**
 * Bloom distribution used by the diagnostic assessment.
 *
 * Total = 10 questions:
 * REMEMBER   = 1
 * UNDERSTAND = 2
 * APPLY      = 4
 * ANALYZE    = 3
 */
const BLOOM_DISTRIBUTION = {
  REMEMBER: 1,
  UNDERSTAND: 2,
  APPLY: 4,
  ANALYZE: 3,
};

/**
 * Generate Diagnostic Blueprint
 *
 * This endpoint ONLY plans the assessment.
 * It does not call the ML/LLM service.
 */
export const generateDiagnosticBlueprint = asyncHandler(async (req, res) => {
  const { officialId } = req.body;

  if (!officialId) {
    return sendError(res, "Official ID is required", 400);
  }

  // Find official
  const [official] = await db
    .select()
    .from(officials)
    .where(eq(officials.id, officialId));

  if (!official) {
    return sendError(res, "Official profile not found", 404);
  }

  // Find official's role
  const [role] = official.roleId
    ? await db.select().from(roles).where(eq(roles.id, official.roleId))
    : [];

  // Find role competency requirements
  const reqs = role
    ? await db
        .select()
        .from(roleCompetencies)
        .where(eq(roleCompetencies.roleId, role.id))
    : [];

  // Load complete competency taxonomy from DB
  const allComps = await db.select().from(competencies);

  /**
   * If the role has explicitly assigned competencies,
   * use those. Otherwise fall back to all competencies.
   */
  const selectedCompetencies = reqs.length
    ? allComps.filter((comp) =>
        reqs.some((req) => req.competencyId === comp.id),
      )
    : allComps;

  const blueprintItems = selectedCompetencies.map((comp) => {
    const requirement = reqs.find((req) => req.competencyId === comp.id);

    const requiredLevel =
      requirement?.requiredLevel ?? requirement?.targetLevel ?? 3;

    return {
      competencyId: comp.id,
      code: comp.code,
      name: comp.name,
      category: comp.category,
      targetLevel: requiredLevel,

      questionDistribution: {
        rememberCount: BLOOM_DISTRIBUTION.REMEMBER,
        understandCount: BLOOM_DISTRIBUTION.UNDERSTAND,
        applyCount: BLOOM_DISTRIBUTION.APPLY,
        analyzeCount: BLOOM_DISTRIBUTION.ANALYZE,
      },

      totalQuestions: 10,
    };
  });

  const blueprint = {
    officialId,
    officialName: official.designation,
    roleTitle: role?.title || "Unassigned Role",
    generatedAt: new Date(),

    competencyCoverage: blueprintItems,

    totalAssessmentQuestions: blueprintItems.length * 10,
  };

  return sendSuccess(
    res,
    blueprint,
    "Diagnostic assessment blueprint generated successfully",
  );
});

/**
 * Generate AI Diagnostic Assessment
 *
 * Input:
 * {
 *   officialId,
 *   competencyId,
 *   sourceText,
 *   sourceMaterialName?
 * }
 *
 * Flow:
 *
 * sourceText
 *    ↓
 * competency lookup
 *    ↓
 * existing intent hashes
 *    ↓
 * FastAPI / LLM
 *    ↓
 * assessment
 *    ↓
 * questions
 *    ↓
 * intentHash persisted
 */
export const generateDiagnosticAssessment = asyncHandler(async (req, res) => {
  const {
    officialId,
    competencyId,
    sourceText,
    sourceMaterialName = "Learning Material",
  } = req.body;

  if (!officialId) {
    return sendError(res, "Official ID is required", 400);
  }

  if (!competencyId) {
    return sendError(res, "Competency ID is required", 400);
  }

  if (!sourceText || typeof sourceText !== "string") {
    return sendError(res, "Source learning material is required", 400);
  }

  const trimmedSourceText = sourceText.trim();

  if (!trimmedSourceText) {
    return sendError(res, "Source learning material is required", 400);
  }

  // ---------------------------------------------------------
  // 1. Verify official
  // ---------------------------------------------------------

  const [official] = await db
    .select()
    .from(officials)
    .where(eq(officials.id, officialId));

  if (!official) {
    return sendError(res, "Official profile not found", 404);
  }

  // ---------------------------------------------------------
  // 2. Verify competency
  // ---------------------------------------------------------

  const [competency] = await db
    .select()
    .from(competencies)
    .where(eq(competencies.id, competencyId));

  if (!competency) {
    return sendError(res, "Competency not found", 404);
  }

  // ---------------------------------------------------------
  // 3. Get previously generated intent hashes
  // ---------------------------------------------------------
  //
  // IMPORTANT:
  // Do NOT send [] every time.
  //
  // The ML generator uses these hashes to avoid generating
  // the same assessment intent again.
  //

  const existingQuestions = await db
    .select({
      intentHash: questions.intentHash,
    })
    .from(questions)
    .innerJoin(assessments, eq(questions.assessmentId, assessments.id))
    .where(eq(assessments.competencyId, competencyId));

  const existingIntentHashes = existingQuestions
    .map((question) => question.intentHash)
    .filter(Boolean);

  // ---------------------------------------------------------
  // 4. Call ML service
  // ---------------------------------------------------------

  const result = await generateAssessment({
    sourceText: trimmedSourceText,

    competencyName: competency.name,

    competencyCategory: competency.category,

    bloomDistribution: BLOOM_DISTRIBUTION,

    existingIntentHashes,
  });

  const generatedQuestions = result?.questions || [];

  if (!generatedQuestions.length) {
    return sendError(res, "ML service generated no questions", 502);
  }

  // ---------------------------------------------------------
  // 5. Create assessment record
  // ---------------------------------------------------------

  const [assessment] = await db
    .insert(assessments)
    .values({
      title: `Diagnostic Assessment - ${competency.name}`,

      competencyId,

      sourceMaterialName,

      blueprint: {
        bloomDistribution: BLOOM_DISTRIBUTION,

        totalQuestions: generatedQuestions.length,

        generatedBy: "ML/LLM",
      },

      totalQuestions: generatedQuestions.length,
    })
    .returning();

  // ---------------------------------------------------------
  // 6. Persist generated questions
  // ---------------------------------------------------------

  const questionValues = generatedQuestions
    .map((question) => ({
      assessmentId: assessment.id,

      stem: question.stem,

      options: question.options,

      explanation: question.explanation || null,

      bloomLevel: question.bloom_level || question.bloomLevel || "APPLY",

      intentHash: question.intent_hash || question.intentHash || null,
    }))
    .filter((question) => question.stem);

  let savedQuestions = [];

  if (questionValues.length) {
    savedQuestions = await db
      .insert(questions)
      .values(questionValues)
      .returning();
  }

  // ---------------------------------------------------------
  // 7. Return generated assessment
  // ---------------------------------------------------------

  return sendSuccess(
    res,
    {
      assessmentId: assessment.id,

      officialId,

      competencyId,

      competency: {
        id: competency.id,
        code: competency.code,
        name: competency.name,
        category: competency.category,
      },

      bloomDistribution: BLOOM_DISTRIBUTION,

      totalQuestions: savedQuestions.length,

      questions: savedQuestions,
    },

    "Diagnostic assessment generated successfully",
  );
});

/**
 * Submit Diagnostic Assessment Attempt
 *
 * Answers are converted into competency evidence.
 */
export const submitDiagnosticAttempt = asyncHandler(async (req, res) => {
  const { officialId, answers = [] } = req.body;

  if (!officialId || !answers.length) {
    return sendError(res, "Official ID and answers are required", 400);
  }

  // Verify official
  const [official] = await db
    .select()
    .from(officials)
    .where(eq(officials.id, officialId));

  if (!official) {
    return sendError(res, "Official profile not found", 404);
  }

  // ---------------------------------------------------------
  // Calculate score per competency
  // ---------------------------------------------------------

  const competencyScores = {};

  for (const answer of answers) {
    if (!answer.competencyId) {
      continue;
    }

    if (!competencyScores[answer.competencyId]) {
      competencyScores[answer.competencyId] = {
        correct: 0,
        total: 0,
      };
    }

    competencyScores[answer.competencyId].total += 1;

    if (answer.isCorrect) {
      competencyScores[answer.competencyId].correct += 1;
    }
  }

  const recordedItems = [];

  // ---------------------------------------------------------
  // Convert scores into evidence
  // ---------------------------------------------------------

  for (const [compId, scores] of Object.entries(competencyScores)) {
    if (!scores.total) {
      continue;
    }

    const scaledScore = Number(
      ((scores.correct / scores.total) * 5.0).toFixed(1),
    );

    const [newItem] = await db
      .insert(evidence)
      .values({
        officialId,

        competencyId: compId,

        evidenceType: "KNOWLEDGE",

        score: scaledScore,

        maxScore: 5.0,

        weight: 0.4,

        confidence: 0.85,

        provenance: `Diagnostic Assessment Session (${scores.correct}/${scores.total} correct)`,
      })
      .returning();

    recordedItems.push(newItem);
  }

  return sendSuccess(
    res,
    {
      officialId,

      processedCompetencies: Object.keys(competencyScores).length,

      recordedEvidence: recordedItems,
    },

    "Diagnostic assessment attempt submitted and evidence recorded",
  );
});
