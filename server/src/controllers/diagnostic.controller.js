import { db } from '../db/index.js';
import { officials, roles, roleCompetencies, competencies, evidence } from '../db/schema/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Generate Diagnostic Blueprint for Official Role Profile
 */
export const generateDiagnosticBlueprint = asyncHandler(async (req, res) => {
  const { officialId } = req.body;

  if (!officialId) {
    return sendError(res, 'Official ID is required', 400);
  }

  const [official] = await db.select().from(officials).where(officials.id.equals(officialId));
  if (!official) {
    return sendError(res, 'Official profile not found', 404);
  }

  const [role] = official.roleId ? await db.select().from(roles).where(roles.id.equals(official.roleId)) : [];
  const reqs = role ? await db.select().from(roleCompetencies).where(roleCompetencies.roleId.equals(role.id)) : [];
  const allComps = await db.select().from(competencies);

  // Build Diagnostic Blueprint sampling competencies by priority
  const blueprintItems = allComps.map((comp) => {
    const roleReq = reqs.find((r) => r.competencyId === comp.id);
    const requiredLevel = roleReq ? roleReq.requiredLevel : 3.0;

    return {
      competencyId: comp.id,
      code: comp.code,
      name: comp.name,
      category: comp.category,
      targetLevel: requiredLevel,
      questionDistribution: {
        rememberCount: 1,
        understandCount: 2,
        applyCount: 4,
        analyzeCount: 3,
      },
      totalQuestions: 10,
    };
  });

  const blueprint = {
    officialId,
    officialName: official.designation,
    roleTitle: role?.title || 'Unassigned Role',
    generatedAt: new Date(),
    competencyCoverage: blueprintItems,
    totalAssessmentQuestions: blueprintItems.length * 10,
  };

  return sendSuccess(res, blueprint, 'Diagnostic assessment blueprint generated successfully');
});

/**
 * Submit Diagnostic Assessment Attempt & Record Evidence
 */
export const submitDiagnosticAttempt = asyncHandler(async (req, res) => {
  const { officialId, answers = [] } = req.body;

  if (!officialId || !answers.length) {
    return sendError(res, 'Official ID and answers are required', 400);
  }

  const [official] = await db.select().from(officials).where(officials.id.equals(officialId));
  if (!official) {
    return sendError(res, 'Official profile not found', 404);
  }

  // Calculate score per competency
  const competencyScores = {};
  answers.forEach((ans) => {
    if (!competencyScores[ans.competencyId]) {
      competencyScores[ans.competencyId] = { correct: 0, total: 0 };
    }
    competencyScores[ans.competencyId].total += 1;
    if (ans.isCorrect) {
      competencyScores[ans.competencyId].correct += 1;
    }
  });

  const recordedItems = [];
  for (const [compId, scores] of Object.entries(competencyScores)) {
    const scaledScore = Number(((scores.correct / scores.total) * 5.0).toFixed(1));

    const [newItem] = await db
      .insert(evidence)
      .values({
        officialId,
        competencyId: compId,
        evidenceType: 'KNOWLEDGE',
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
    'Diagnostic assessment attempt submitted and evidence recorded'
  );
});
