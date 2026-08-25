import { and, desc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  competencies,
  competencyEstimates,
  competencyRequirements,
  evidence,
  officials,
  roleCompetencies,
  skillGaps,
  learningObjectives,
  subCompetencies,
  subCompetencyEstimates,
} from "../db/schema/index.js";
import {
  calculateSkillGap,
  calculateSkillGaps,
} from "../utils/skillGapCalculator.js";
import {
  calculateConfidenceScore,
  calculateRecencyFactor,
  calculateWeightedEstimate,
} from "../utils/evidenceFusion.js";

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
  
  const [official] = await db
    .select({ id: officials.id, roleId: officials.roleId })
    .from(officials)
    .where(eq(officials.userId, userId));

  if (!official) return [];

  const targetOfficialId = officialId || official.id;
  const conditions = [eq(skillGaps.officialId, targetOfficialId)];
  if (category) conditions.push(eq(skillGaps.category, category));

  const priorityColumn =
    priority === "assessment"
      ? skillGaps.assessmentPriority
      : skillGaps.learningPriority;

  let gaps = await db
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

  // If no skill gaps exist yet, auto-recalculate them on the fly for this official
  if (gaps.length === 0 && official.roleId) {
    try {
      await recalculateSkillGaps({ userId, officialId: official.id, roleId: official.roleId });
      gaps = await db
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
    } catch (err) {
      console.warn('Auto-calculation fallback warning:', err.message);
    }
  }

  return gaps;
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
  if (!officialId) throw badRequest("officialId is required.");

  const db = getDb();
  const [official] = await db
    .select({ id: officials.id, roleId: officials.roleId })
    .from(officials)
    .where(and(eq(officials.id, officialId), eq(officials.userId, userId)));
  if (!official) throw notFound();
  const resolvedRoleId = roleId || official.roleId;
  if (!resolvedRoleId)
    throw badRequest("A role is required for recalculation.");

  const now = new Date();
  let requirements = await db
    .select()
    .from(competencyRequirements)
    .where(
      and(
        eq(competencyRequirements.roleId, resolvedRoleId),
        lte(competencyRequirements.effectiveFrom, now),
        or(
          isNull(competencyRequirements.effectiveTo),
          gt(competencyRequirements.effectiveTo, now),
        ),
      ),
    );
  if (requirements.length === 0) {
    const roleRequirements = await db
      .select()
      .from(roleCompetencies)
      .where(eq(roleCompetencies.roleId, resolvedRoleId));
    requirements = await Promise.all(
      roleRequirements.map(async (roleRequirement) => {
        const priority =
          { HIGH: 5, MEDIUM: 3, LOW: 1 }[roleRequirement.priority] || 3;
        const [created] = await db
          .insert(competencyRequirements)
          .values({
            roleId: resolvedRoleId,
            competencyId: roleRequirement.competencyId,
            requiredLevel: roleRequirement.requiredLevel,
            priority,
            urgency: priority,
            mandatory: roleRequirement.isMandatory,
            frameworkVersion: "role-competencies-v1",
            sourceReference: "Module 1 role_competencies",
          })
          .returning();
        return created;
      }),
    );
  }
  if (requirements.length === 0) {
    throw badRequest("No competency requirements found for this role.");
  }

  const evidenceItems = await db
    .select()
    .from(evidence)
    .where(eq(evidence.officialId, officialId));
  const existingEstimates = await db
    .select()
    .from(competencyEstimates)
    .where(eq(competencyEstimates.officialId, officialId));
  const evidenceByCompetency = new Map();
  for (const item of evidenceItems) {
    const items = evidenceByCompetency.get(item.competencyId) || [];
    items.push(item);
    evidenceByCompetency.set(item.competencyId, items);
  }

  const estimates = [];
  for (const requirement of requirements) {
    const items = evidenceByCompetency.get(requirement.competencyId) || [];
    const existingEstimate = existingEstimates.find(
      (item) => item.competencyId === requirement.competencyId,
    );
    if (items.length === 0 && existingEstimate) {
      estimates.push(existingEstimate);
      continue;
    }
    const fusedEstimate = calculateWeightedEstimate(items);
    const confidence = calculateConfidenceScore(items) / 100;
    const coverage = Math.min(1, items.length / 4);
    const diversity = Math.min(
      1,
      new Set(items.map((item) => item.evidenceType)).size / 3,
    );
    const recency = items.length
      ? items.reduce(
          (sum, item) => sum + calculateRecencyFactor(item.recordedAt),
          0,
        ) / items.length
      : 0;
    const evidenceSufficiency = Number(
      Math.pow(
        Math.max(coverage, 0.01) *
          Math.max(diversity, 0.01) *
          Math.max(recency, 0.01) *
          Math.max(confidence, 0.01),
        0.25,
      ).toFixed(4),
    );
    const estimateValues = {
      officialId,
      competencyId: requirement.competencyId,
      masteryScore: fusedEstimate / 5,
      proficiencyLevel: Math.round(fusedEstimate),
      proficiencyLabel:
        fusedEstimate >= 4
          ? "ADVANCED"
          : fusedEstimate >= 3
            ? "WORKING"
            : "BASIC",
      evidenceSufficiency,
      sufficiencyBreakdown: {
        coverage,
        volume: coverage,
        diversity,
        recency,
        consistency: confidence,
        assessmentQuality: confidence,
      },
      evidenceSnapshot: { evidenceIds: items.map((item) => item.id) },
      calculatedAt: now,
      updatedAt: now,
    };
    const [estimate] = await db
      .insert(competencyEstimates)
      .values(estimateValues)
      .onConflictDoUpdate({
        target: [
          competencyEstimates.officialId,
          competencyEstimates.competencyId,
        ],
        set: estimateValues,
      })
      .returning();
    estimates.push(estimate);
  }

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
