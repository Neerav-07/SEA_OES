import { and, desc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  competencies,
  competencyEstimates,
  competencyRequirements,
  evidence,
  officials,
  roles,
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
import { isEligibleTargetRole } from '../utils/roleEligibility.js';

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

async function attachEstimatesToGaps(db, officialId, gaps) {
  if (!gaps || gaps.length === 0) return [];
  const estimates = await db
    .select()
    .from(competencyEstimates)
    .where(eq(competencyEstimates.officialId, officialId));
  const estMap = new Map(estimates.map((e) => [e.competencyId, e]));

  return gaps.map((g) => {
    const est = estMap.get(g.competencyId);
    return {
      ...g,
      evidenceSufficiency: est?.evidenceSufficiency ?? 0,
      sufficiencyBreakdown: est?.sufficiencyBreakdown ?? null,
      evidenceSnapshot: est?.evidenceSnapshot ?? null,
    };
  });
}

export async function listSkillGaps({
  userId,
  officialId,
  category,
  priority = "learning",
} = {}) {
  const db = getDb();
  
  let [official] = await db
    .select({ id: officials.id, roleId: officials.roleId, targetRoleId: officials.targetRoleId })
    .from(officials)
    .where(eq(officials.userId, userId));

  if (!official) return [];

  const targetOfficialId = officialId || official.id;
  const conditions = [eq(skillGaps.officialId, targetOfficialId)];
  if (category && category !== 'all') conditions.push(eq(skillGaps.category, category));
  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const priorityColumn =
    priority === "assessment"
      ? skillGaps.assessmentPriority
      : skillGaps.learningPriority;

  let rawGaps = await db
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
      calculatedAt: skillGaps.calculatedAt,
    })
    .from(skillGaps)
    .innerJoin(officials, eq(skillGaps.officialId, officials.id))
    .innerJoin(competencies, eq(skillGaps.competencyId, competencies.id))
    .where(whereClause)
    .orderBy(
      desc(priorityColumn),
      desc(skillGaps.gapSeverity),
      desc(skillGaps.assessmentPriority),
    );

  if (rawGaps.length === 0 && official) {
    try {
      await recalculateSkillGaps({ userId, officialId: official.id, roleId: official.targetRoleId || official.roleId });
    } catch (err) {
      console.warn('Auto-calculation fallback warning:', err.message);
    }

    rawGaps = await db
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
        calculatedAt: skillGaps.calculatedAt,
      })
      .from(skillGaps)
      .innerJoin(officials, eq(skillGaps.officialId, officials.id))
      .innerJoin(competencies, eq(skillGaps.competencyId, competencies.id))
      .where(whereClause)
      .orderBy(
        desc(priorityColumn),
        desc(skillGaps.gapSeverity),
        desc(skillGaps.assessmentPriority),
      );
  }

  return attachEstimatesToGaps(db, targetOfficialId, rawGaps);
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
      calculatedAt: skillGaps.calculatedAt,
    })
    .from(skillGaps)
    .innerJoin(officials, eq(skillGaps.officialId, officials.id))
    .innerJoin(competencies, eq(skillGaps.competencyId, competencies.id))
    .where(and(eq(skillGaps.id, gapId), eq(officials.userId, userId)));

  if (!gap) throw notFound();

  const [estimate] = await db
    .select()
    .from(competencyEstimates)
    .where(
      and(
        eq(competencyEstimates.officialId, gap.officialId),
        eq(competencyEstimates.competencyId, gap.competencyId),
      ),
    );

  const subCompRows = await db
    .select()
    .from(subCompetencies)
    .where(eq(subCompetencies.competencyId, gap.competencyId));

  const objectRows = await db
    .select()
    .from(learningObjectives)
    .where(eq(learningObjectives.competencyId, gap.competencyId));

  const subEstimates = await db
    .select()
    .from(subCompetencyEstimates)
    .where(eq(subCompetencyEstimates.officialId, gap.officialId));

  const subEstimateMap = new Map(subEstimates.map((s) => [s.subCompetencyId, s]));

  const subCompetenciesList = subCompRows.map((sub) => {
    const subEst = subEstimateMap.get(sub.id);
    return {
      id: sub.id,
      code: sub.code,
      name: sub.name,
      estimatedLevel: subEst?.proficiencyLevel ?? null,
      evidenceSufficiency: subEst?.evidenceSufficiency ?? null,
      learningObjectives: objectRows.map((lo) => ({
        id: lo.id,
        code: lo.code,
        title: lo.title,
      })),
    };
  });

  return {
    ...gap,
    evidenceSufficiency: estimate?.evidenceSufficiency ?? 0,
    sufficiencyBreakdown: estimate?.sufficiencyBreakdown ?? null,
    evidenceSnapshot: estimate?.evidenceSnapshot ?? null,
    subCompetencies: subCompetenciesList,
  };
}

export async function recalculateSkillGaps({ userId, officialId, roleId }) {
  if (!officialId) throw badRequest("officialId is required.");

  const db = getDb();
  const [official] = await db
    .select({ id: officials.id, userId: officials.userId, roleId: officials.roleId, targetRoleId: officials.targetRoleId, department: officials.department })
    .from(officials)
    .where(eq(officials.id, officialId));
  if (!official) throw notFound();
  if (official.userId !== userId) throw badRequest('Official does not belong to the authenticated user.');
  const resolvedRoleId = roleId || official.targetRoleId || official.roleId;
  if (!resolvedRoleId)
    throw badRequest("A role is required for recalculation.");
  const allRoles = await db.select().from(roles);
  if (!isEligibleTargetRole({ official, roles: allRoles, targetRoleId: resolvedRoleId })) {
    throw badRequest('Selected role is not eligible for this official context.');
  }

  const now = new Date();
  let requirements = await db
    .select()
    .from(competencyRequirements)
    .where(eq(competencyRequirements.roleId, resolvedRoleId));
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
  if (requirements.length === 0) throw badRequest('No database-backed competency requirements exist for the selected target role.');

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

  return persistedGaps.map((gap) => ({ ...gap, frameworkVersion: requirements.find((item) => item.id === gap.requirementId)?.frameworkVersion || null }));
}
