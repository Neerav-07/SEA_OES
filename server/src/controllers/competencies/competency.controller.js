import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { competencies, subCompetencies, learningObjectives } from '../../db/schema/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

/**
 * Get all competencies with sub-competencies and learning objectives
 */
export const getCompetencies = asyncHandler(async (req, res) => {
  const allCompetencies = await db.select().from(competencies);
  const allSubComps = await db.select().from(subCompetencies);
  const allLOs = await db.select().from(learningObjectives);

  // Group into hierarchy
  const hierarchy = allCompetencies.map((comp) => {
    const subs = allSubComps
      .filter((s) => s.competencyId === comp.id)
      .map((s) => ({
        ...s,
        learningObjectives: allLOs.filter((lo) => lo.subCompetencyId === s.id),
      }));

    return {
      ...comp,
      subCompetencies: subs,
    };
  });

  return sendSuccess(res, hierarchy, 'Competency hierarchy retrieved successfully');
});

/**
 * Get single competency by ID with full hierarchy
 */
export const getCompetencyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [comp] = await db.select().from(competencies).where(eq(competencies.id, id));
  
  if (!comp) {
    return sendError(res, 'Competency not found', 404);
  }

  const subs = await db.select().from(subCompetencies).where(eq(subCompetencies.competencyId, comp.id));
  const subIds = subs.map((s) => s.id);
  const loList = subIds.length > 0 ? await db.select().from(learningObjectives) : [];

  const subHierarchy = subs.map((s) => ({
    ...s,
    learningObjectives: loList.filter((lo) => lo.subCompetencyId === s.id),
  }));

  return sendSuccess(res, { ...comp, subCompetencies: subHierarchy }, 'Competency retrieved');
});
