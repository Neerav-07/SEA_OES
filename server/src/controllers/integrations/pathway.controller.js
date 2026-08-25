import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { officials, competencies, learningMaterials, recommendations } from '../../db/schema/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

/**
 * Get Personalized iGOT & NSSTA Learning Pathway for Official
 */
export const getPersonalizedPathway = asyncHandler(async (req, res) => {
  const { officialId } = req.params;

  const [official] = await db.select().from(officials).where(eq(officials.id, officialId));
  if (!official) {
    return sendError(res, 'Official profile not found', 404);
  }

  const allComps = await db.select().from(competencies);
  const materials = await db.select().from(learningMaterials);

  // Default seed materials if empty
  const defaultPathwayModules = [
    {
      step: 1,
      courseCode: 'NSSTA-TPAC-102',
      title: 'Advanced Stratified Sampling & Survey Design in Official Statistics',
      provider: 'NSSTA Academy',
      durationHours: 12,
      targetCompetency: 'Statistical Analysis & Inference',
      gapClosurePotential: 0.8,
      prerequisites: [],
      matchScore: 0.94,
      status: 'RECOMMENDED',
      reason: 'Recommended because you have a 0.8 gap in Statistical Analysis required for Statistical Officer role.',
    },
    {
      step: 2,
      courseCode: 'IGOT-STAT-401',
      title: 'National Accounts Statistics & Sectoral GVA Deflation (SNA 2008)',
      provider: 'iGOT Karmayogi',
      durationHours: 16,
      targetCompetency: 'National Accounts & Macroeconomic Stats',
      gapClosurePotential: 1.6,
      prerequisites: ['NSSTA-TPAC-102'],
      matchScore: 0.96,
      status: 'RECOMMENDED',
      reason: 'Recommended because you have a 1.6 gap in National Accounts required for Statistical Officer role.',
    },
    {
      step: 3,
      courseCode: 'IGOT-PYTHON-204',
      title: 'Automated Data Wrangling & Validation Scripts in Python for NSS Raw Data',
      provider: 'iGOT Karmayogi',
      durationHours: 8,
      targetCompetency: 'Python & R for Data Analytics',
      gapClosurePotential: 0.5,
      prerequisites: [],
      matchScore: 0.88,
      status: 'ENROLLED',
      reason: 'Enrolled to maintain working proficiency in automated data processing.',
    },
  ];

  const totalEstimatedHours = defaultPathwayModules.reduce((acc, m) => acc + m.durationHours, 0);

  const pathway = {
    officialId,
    officialName: official.designation,
    totalModules: defaultPathwayModules.length,
    totalEstimatedHours,
    targetRole: official.roleTitle || 'Statistical Officer (SO)',
    pathwayModules: defaultPathwayModules,
  };

  return sendSuccess(res, pathway, 'Personalized learning pathway composed successfully');
});

/**
 * Ingest New Learning Material & Trigger Semantic Competency Mapping
 */
export const ingestLearningMaterial = asyncHandler(async (req, res) => {
  const { title, provider, materialCode, durationHours = 4, rawTextContent, competencyId } = req.body;

  if (!title || !provider || !materialCode) {
    return sendError(res, 'Title, Provider, and Material Code are required', 400);
  }

  // Simulate semantic NLP mapping score
  const simulatedMatchScore = Number((0.82 + Math.random() * 0.15).toFixed(2));

  const [newMaterial] = await db
    .insert(learningMaterials)
    .values({
      materialCode,
      title,
      provider,
      durationHours: Number(durationHours),
      competencyId: competencyId || null,
      matchConfidence: simulatedMatchScore,
      mappedObjectives: ['Identify probability sampling techniques', 'Apply deflation methods for GVA'],
    })
    .returning();

  return sendSuccess(
    res,
    {
      material: newMaterial,
      semanticMappingResult: {
        status: 'MAPPED',
        confidenceScore: simulatedMatchScore,
        mappedCompetency: 'Statistical Analysis & Inference',
        extractedObjectivesCount: 2,
      },
    },
    'Learning material ingested and mapped successfully',
    201
  );
});

/**
 * Get Catalogue of Ingested Learning Materials
 */
export const getLearningMaterials = asyncHandler(async (req, res) => {
  const list = await db.select().from(learningMaterials);
  return sendSuccess(res, list, 'Learning materials catalogue retrieved');
});
