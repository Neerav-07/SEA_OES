import { and, desc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  competencies,
  competencyEstimates,
  competencyRequirements,
  officials,
  skillGaps,
  learningObjectives,
  subCompetencies,
  subCompetencyEstimates,
} from "../db/schema/index.js";
import {
  calculateSkillGap,
  calculateSkillGaps,
} from "../utils/skillGapCalculator.js";

export { calculateSkillGap, calculateSkillGaps };

function notFound() {
  const error = new Error("Skill gap not found.");
  error.statusCode = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export async function listSkillGaps({
  userId,
  officialId,
  category,
  priority = "learning",
} = {}) {
  const db = getDb();
  const conditions = [eq(officials.userId, userId)];
  if (officialId) conditions.push(eq(skillGaps.officialId, officialId));
  if (category) conditions.push(eq(skillGaps.category, category));

  const priorityColumn =
    priority === "assessment"
      ? skillGaps.assessmentPriority
      : skillGaps.learningPriority;

  return db
    .select({
      id: skillGaps.id,
      officialId: skillGaps.officialId,
      competencyId: skillGaps.competencyId,
      competencyCode: competencies.code,
      competencyName: competencies.name,
      category: skillGaps.category,
      requiredLevel: skillGaps.requiredLevel,
      estimatedLevel: skillGaps.estimatedLevel,
      gapSeverity: skillGaps.gapSeverity,
      learningPriority: skillGaps.learningPriority,
      assessmentPriority: skillGaps.assessmentPriority,
      reasons: skillGaps.reasons,
      evidenceSufficiency: competencyEstimates.evidenceSufficiency,
      sufficiencyBreakdown: competencyEstimates.sufficiencyBreakdown,
      evidenceSnapshot: competencyEstimates.evidenceSnapshot,
      calculatedAt: skillGaps.calculatedAt,
    })
    .from(skillGaps)
    .innerJoin(officials, eq(skillGaps.officialId, officials.id))
    .innerJoin(competencies, eq(skillGaps.competencyId, competencies.id))
    .leftJoin(
      competencyEstimates,
      eq(skillGaps.estimateId, competencyEstimates.id),
    )
    .where(and(...conditions))
    .orderBy(
      desc(priorityColumn),
      desc(skillGaps.gapSeverity),
      desc(skillGaps.assessmentPriority),
    );
}

export async function getSkillGapById({ userId, gapId }) {
  const db = getDb();
  const [gap] = await db
    .select({
      id: skillGaps.id,
      officialId: skillGaps.officialId,
      competencyId: skillGaps.competencyId,
      competencyCode: competencies.code,
      competencyName: competencies.name,
      category: skillGaps.category,
      requiredLevel: skillGaps.requiredLevel,
      estimatedLevel: skillGaps.estimatedLevel,
      gapSeverity: skillGaps.gapSeverity,
      learningPriority: skillGaps.learningPriority,
      assessmentPriority: skillGaps.assessmentPriority,
      reasons: skillGaps.reasons,
      evidenceSufficiency: competencyEstimates.evidenceSufficiency,
      sufficiencyBreakdown: competencyEstimates.sufficiencyBreakdown,
      evidenceSnapshot: competencyEstimates.evidenceSnapshot,
      calculatedAt: skillGaps.calculatedAt,
    })
    .from(skillGaps)
    .innerJoin(officials, eq(skillGaps.officialId, officials.id))
    .innerJoin(competencies, eq(skillGaps.competencyId, competencies.id))
    .leftJoin(
      competencyEstimates,
      eq(skillGaps.estimateId, competencyEstimates.id),
    )
    .where(and(eq(skillGaps.id, gapId), eq(officials.userId, userId)));
  if (!gap) throw notFound();

  const hierarchyRows = await db
    .select({
      subCompetencyId: subCompetencies.id,
      subCompetencyCode: subCompetencies.code,
      subCompetencyName: subCompetencies.name,
      learningObjectiveId: learningObjectives.id,
      learningObjectiveCode: learningObjectives.code,
      learningObjectiveTitle: learningObjectives.title,
      subEstimatedLevel: subCompetencyEstimates.proficiencyLevel,
      subEvidenceSufficiency: subCompetencyEstimates.evidenceSufficiency,
    })
    .from(subCompetencies)
    .leftJoin(
      learningObjectives,
      eq(learningObjectives.subCompetencyId, subCompetencies.id),
    )
    .leftJoin(
      subCompetencyEstimates,
      and(
        eq(subCompetencyEstimates.subCompetencyId, subCompetencies.id),
        eq(subCompetencyEstimates.officialId, gap.officialId),
      ),
    )
    .where(eq(subCompetencies.competencyId, gap.competencyId));

  const subCompetencyMap = new Map();
  for (const row of hierarchyRows) {
    if (!subCompetencyMap.has(row.subCompetencyId)) {
      subCompetencyMap.set(row.subCompetencyId, {
        id: row.subCompetencyId,
        code: row.subCompetencyCode,
        name: row.subCompetencyName,
        estimatedLevel: row.subEstimatedLevel,
        evidenceSufficiency: row.subEvidenceSufficiency,
        learningObjectives: [],
      });
    }
    if (row.learningObjectiveId) {
      subCompetencyMap.get(row.subCompetencyId).learningObjectives.push({
        id: row.learningObjectiveId,
        code: row.learningObjectiveCode,
        title: row.learningObjectiveTitle,
      });
    }
  }

  return { ...gap, subCompetencies: [...subCompetencyMap.values()] };
}

export async function recalculateSkillGaps({ userId, officialId, roleId }) {
  if (!officialId || !roleId) {
    throw badRequest("officialId and roleId are required.");
  }

  const db = getDb();
  const [official] = await db
    .select({ id: officials.id })
    .from(officials)
    .where(and(eq(officials.id, officialId), eq(officials.userId, userId)));
  if (!official) throw notFound();

  const now = new Date();
  const requirements = await db
    .select()
    .from(competencyRequirements)
    .where(
      and(
        eq(competencyRequirements.roleId, roleId),
        lte(competencyRequirements.effectiveFrom, now),
        or(
          isNull(competencyRequirements.effectiveTo),
          gt(competencyRequirements.effectiveTo, now),
        ),
      ),
    );
  if (requirements.length === 0) {
    throw badRequest("No active competency requirements found for this role.");
  }

  const estimates = await db
    .select()
    .from(competencyEstimates)
    .where(eq(competencyEstimates.officialId, officialId));
  const calculatedGaps = calculateSkillGaps({ requirements, estimates });

  const persistedGaps = [];
  for (const [index, gap] of calculatedGaps.entries()) {
    const requirement = requirements[index];
    const estimate = estimates.find(
      (item) => item.competencyId === gap.competencyId,
    );
    const values = {
      officialId,
      competencyId: gap.competencyId,
      requirementId: requirement.id,
      estimateId: estimate?.id,
      requiredLevel: gap.requiredLevel,
      estimatedLevel: gap.estimatedLevel,
      gapSeverity: gap.gapSeverity,
      learningPriority: gap.learningPriority,
      assessmentPriority: gap.assessmentPriority,
      category: gap.category,
      reasons: gap.reasons,
      calculatedAt: now,
      updatedAt: now,
    };
    const [persisted] = await db
      .insert(skillGaps)
      .values(values)
      .onConflictDoUpdate({
        target: [skillGaps.officialId, skillGaps.requirementId],
        set: values,
      })
      .returning();
    persistedGaps.push(persisted);
  }

  return persistedGaps;
}
