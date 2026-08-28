import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { competencies, subCompetencies, learningObjectives } from '../../db/schema/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

function deduplicateLOs(los) {
  if (!Array.isArray(los)) return [];
  const seen = new Set();
  return los.filter((lo) => {
    const key = (lo.title || lo.code || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Get all competencies with sub-competencies and learning objectives
 */
export const getCompetencies = asyncHandler(async (req, res) => {
  const allCompetencies = await db.select().from(competencies);
  const allSubComps = await db.select().from(subCompetencies);
  const allLOs = await db.select().from(learningObjectives);

  // Group into hierarchy
  const hierarchy = allCompetencies.map((comp) => {
    let subs = allSubComps.filter((s) => s.competencyId === comp.id);
    let compLOs = deduplicateLOs(allLOs.filter((lo) => lo.competencyId === comp.id));

    if (compLOs.length === 0) {
      compLOs = [
        {
          id: `lo-def-${comp.id}-1`,
          competencyId: comp.id,
          code: `${comp.code}_LO_01`,
          title: `Apply baseline concepts and operational procedures of ${comp.name} in statistical survey production.`,
          targetLevel: 3,
          status: 'ACTIVE',
        },
        {
          id: `lo-def-${comp.id}-2`,
          competencyId: comp.id,
          code: `${comp.code}_LO_02`,
          title: `Evaluate data quality and compliance with MoSPI framework guidelines for ${comp.name}.`,
          targetLevel: 4,
          status: 'ACTIVE',
        },
      ];
    }

    if (subs.length === 0) {
      subs = [
        {
          id: `sub-${comp.id}`,
          competencyId: comp.id,
          code: `SUB_${comp.code}`,
          name: `${comp.name} Application`,
          description: comp.description || `Operational application of ${comp.name}`,
          learningObjectives: compLOs,
        },
      ];
    } else {
      subs = subs.map((s) => {
        const subLOs = deduplicateLOs(allLOs.filter((lo) => lo.subCompetencyId === s.id));
        return {
          ...s,
          learningObjectives: subLOs.length > 0 ? subLOs : compLOs,
        };
      });
    }

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

  let subs = await db.select().from(subCompetencies).where(eq(subCompetencies.competencyId, comp.id));
  let compLOs = deduplicateLOs(await db.select().from(learningObjectives).where(eq(learningObjectives.competencyId, comp.id)));

  if (compLOs.length === 0) {
    compLOs = [
      {
        id: `lo-def-${comp.id}-1`,
        competencyId: comp.id,
        code: `${comp.code}_LO_01`,
        title: `Apply baseline concepts and operational procedures of ${comp.name} in statistical survey production.`,
        targetLevel: 3,
        status: 'ACTIVE',
      },
      {
        id: `lo-def-${comp.id}-2`,
        competencyId: comp.id,
        code: `${comp.code}_LO_02`,
        title: `Evaluate data quality and compliance with MoSPI framework guidelines for ${comp.name}.`,
        targetLevel: 4,
        status: 'ACTIVE',
      },
    ];
  }

  if (subs.length === 0) {
    subs = [
      {
        id: `sub-${comp.id}`,
        competencyId: comp.id,
        code: `SUB_${comp.code}`,
        name: `${comp.name} Application`,
        description: comp.description || `Operational application of ${comp.name}`,
        learningObjectives: compLOs,
      },
    ];
  } else {
    subs = subs.map((s) => ({
      ...s,
      learningObjectives: compLOs,
    }));
  }

  return sendSuccess(res, { ...comp, subCompetencies: subs }, 'Competency retrieved');
});
