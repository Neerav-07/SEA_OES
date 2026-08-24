const MAX_PRIORITY = 100;
const MIN_LEVEL = 0;
const MAX_LEVEL = 5;
const INSUFFICIENT_EVIDENCE_THRESHOLD = 0.5;

function clamp(value, min = MIN_LEVEL, max = MAX_LEVEL) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

function normalize(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getGapCategory(gapSeverity, evidenceSufficiency) {
  if (evidenceSufficiency < INSUFFICIENT_EVIDENCE_THRESHOLD) {
    return "insufficient evidence";
  }
  if (gapSeverity <= 0) return "no gap";
  if (gapSeverity >= 2) return "critical";
  if (gapSeverity >= 1) return "high";
  if (gapSeverity >= 0.5) return "medium";
  return "low";
}

function buildReasons({
  requiredLevel,
  estimatedLevel,
  gapSeverity,
  category,
  requirement,
  estimate,
}) {
  const reasons = [];
  const roleImportance = normalize(requirement.priority, 3);
  const urgency = normalize(requirement.urgency, 3);
  const evidenceSufficiency = normalize(estimate.evidenceSufficiency);

  if (requiredLevel > estimatedLevel) {
    reasons.push(
      `Required level is ${requiredLevel}; estimated level is ${estimatedLevel}.`,
    );
  } else {
    reasons.push("Estimated proficiency meets or exceeds the required level.");
  }
  if (requirement.mandatory)
    reasons.push("Competency is mandatory for the assigned role.");
  if (roleImportance >= 4) reasons.push("Competency has high role importance.");
  if (urgency >= 4) reasons.push("Competency has high organisational urgency.");
  if (evidenceSufficiency < INSUFFICIENT_EVIDENCE_THRESHOLD) {
    reasons.push(
      "Evidence is insufficient for a reliable competency inference.",
    );
  }
  if (category === "no gap")
    reasons.push("No learning gap is currently indicated.");
  if (
    gapSeverity > 0 &&
    evidenceSufficiency >= INSUFFICIENT_EVIDENCE_THRESHOLD
  ) {
    reasons.push("Evidence is sufficient to support a learning-gap decision.");
  }
  return reasons;
}

export function calculateSkillGap({ requirement = {}, estimate = {} } = {}) {
  const requiredLevel = clamp(requirement.requiredLevel);
  const estimatedLevel = clamp(
    estimate.proficiencyLevel ?? estimate.masteryScore,
  );
  const evidenceSufficiency = clamp(estimate.evidenceSufficiency, 0, 1);
  const gapSeverity = Number(
    Math.max(requiredLevel - estimatedLevel, 0).toFixed(2),
  );
  const category = getGapCategory(gapSeverity, evidenceSufficiency);
  const roleImportance = clamp(requirement.priority, 1, 5) / 5;
  const urgency = clamp(requirement.urgency, 1, 5) / 5;
  const evidenceAdjustment = evidenceSufficiency;
  const evidenceDeficit = 1 - evidenceSufficiency;
  const learningPriority = Number(
    (
      (gapSeverity / MAX_LEVEL) *
      roleImportance *
      urgency *
      evidenceAdjustment *
      MAX_PRIORITY
    ).toFixed(2),
  );
  const assessmentPriority = Number(
    (evidenceDeficit * roleImportance * urgency * MAX_PRIORITY).toFixed(2),
  );

  return {
    requiredLevel,
    estimatedLevel,
    gapSeverity,
    evidenceSufficiency,
    learningPriority,
    assessmentPriority,
    category,
    reasons: buildReasons({
      requiredLevel,
      estimatedLevel,
      gapSeverity,
      category,
      requirement,
      estimate,
    }),
  };
}

export function calculateSkillGaps({ requirements = [], estimates = [] } = {}) {
  const estimatesByCompetency = new Map(
    estimates.map((estimate) => [estimate.competencyId, estimate]),
  );

  return requirements.map((requirement) => {
    const estimate = estimatesByCompetency.get(requirement.competencyId) || {};
    const calculated = {
      ...requirement,
      ...estimate,
      ...calculateSkillGap({ requirement, estimate }),
    };
    return {
      ...calculated,
      requirementId: requirement.id,
      estimateId: estimate.id,
    };
  });
}
