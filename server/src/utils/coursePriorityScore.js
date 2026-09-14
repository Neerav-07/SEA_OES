/**
 * Course Priority Score Calculator
 *
 * Implements deterministic multi-factor ranking for learning pathways & official notices:
 * Score = (0.35 * GapSeverity) + (0.25 * NoticeUrgency) + (0.20 * RoleCriticality) + (0.15 * SemanticRelevance) + (0.05 * DeadlineProximity)
 *
 * Normalizes all sub-factors to [0.0, 1.0] and returns a transparent breakdown.
 */

export const DEFAULT_PRIORITY_WEIGHTS = {
  GAP_SEVERITY: 0.35,
  NOTICE_URGENCY: 0.25,
  ROLE_CRITICALITY: 0.20,
  SEMANTIC_RELEVANCE: 0.15,
  DEADLINE_PROXIMITY: 0.05,
};

export const PRIORITY_WEIGHTS = { ...DEFAULT_PRIORITY_WEIGHTS };

let activePriorityWeights = { ...DEFAULT_PRIORITY_WEIGHTS };

export function getPriorityWeights() {
  return { ...activePriorityWeights };
}

export function setPriorityWeights(newWeights) {
  if (!newWeights || typeof newWeights !== 'object') return getPriorityWeights();

  activePriorityWeights = {
    GAP_SEVERITY: Number(newWeights.GAP_SEVERITY ?? activePriorityWeights.GAP_SEVERITY),
    NOTICE_URGENCY: Number(newWeights.NOTICE_URGENCY ?? activePriorityWeights.NOTICE_URGENCY),
    ROLE_CRITICALITY: Number(newWeights.ROLE_CRITICALITY ?? activePriorityWeights.ROLE_CRITICALITY),
    SEMANTIC_RELEVANCE: Number(newWeights.SEMANTIC_RELEVANCE ?? activePriorityWeights.SEMANTIC_RELEVANCE),
    DEADLINE_PROXIMITY: Number(newWeights.DEADLINE_PROXIMITY ?? activePriorityWeights.DEADLINE_PROXIMITY),
  };

  return getPriorityWeights();
}

export const FORMULA_VERSION = 'v2.0-nssta-priority';

/**
 * Calculate the urgency score of a notice based on its status and deadline.
 * @param {string|Date} deadline - Notice deadline
 * @param {Date|string} [currentDate] - Reference date (defaults to now)
 * @returns {number} Score between 0.0 and 1.0
 */
export function calculateDeadlineScore(deadline, currentDate = new Date()) {
  if (!deadline) return 0.5; // Neutral score if no explicit deadline

  const deadlineDate = new Date(deadline);
  const now = new Date(currentDate);
  const diffDays = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays <= 0) return 1.0; // Expired / Closing today -> Highest urgency
  if (diffDays <= 3) return 0.95;
  if (diffDays <= 7) return 0.85;
  if (diffDays <= 14) return 0.70;
  if (diffDays <= 30) return 0.50;
  return 0.30; // Far in the future
}

/**
 * Calculate role criticality based on whether the notice targets the officer's exact cadre.
 * @param {string} officerCadre - e.g. 'ISS Officer', 'Subordinate Statistical Officer (SSS)'
 * @param {string[]} targetAudience - e.g. ['ISS Officer', 'SSS Analyst']
 * @returns {number} Score between 0.0 and 1.0
 */
export function calculateRoleCriticality(officerCadre, targetAudience = []) {
  if (!officerCadre || !targetAudience?.length) return 0.6;

  const normalizedCadre = officerCadre.toLowerCase();
  const directMatch = targetAudience.some((cadre) => {
    const norm = cadre.toLowerCase();
    return normalizedCadre.includes(norm) || norm.includes(normalizedCadre);
  });

  if (directMatch) return 1.0;

  // General statistical officer match
  const isGeneralTarget = targetAudience.some((cadre) =>
    ['all', 'all officers', 'statistical officer', 'statistical officers'].includes(cadre.toLowerCase())
  );
  if (isGeneralTarget) return 0.8;

  return 0.4;
}

/**
 * Calculate composite priority score.
 *
 * @param {Object} params
 * @param {number} params.gapSeverity - Skill gap delta (0.0 to 5.0)
 * @param {string} [params.urgencyLevel] - 'CRITICAL', 'HIGH', 'NORMAL'
 * @param {string} [params.officerCadre] - Officer's cadre/role designation
 * @param {string[]} [params.targetAudience] - Notice's target cadre
 * @param {Date|string} [params.nominationDeadline] - Notice deadline
 * @param {number} [params.semanticRelevance] - NLP similarity score (0.0 to 1.0)
 * @param {boolean} [params.isMandatory] - True if mandatory notice/training
 * @param {Date|string} [params.currentDate] - Reference date
 * @returns {Object} { score: number, normalizedScore: number, factorBreakdown: Object, formulaVersion: string }
 */
export function computeCoursePriorityScore({
  gapSeverity = 0,
  urgencyLevel = 'NORMAL',
  officerCadre = '',
  targetAudience = [],
  nominationDeadline = null,
  semanticRelevance = 0.8,
  isMandatory = false,
  currentDate = new Date(),
  weights = null,
} = {}) {
  // 1. Normalized Gap Severity (0 to 5 mapped to 0 to 1)
  const normGap = Math.min(1.0, Math.max(0.0, Number(gapSeverity) / 4.0));

  // 2. Notice Urgency
  let urgencyWeight = 0.5;
  if (isMandatory || urgencyLevel === 'CRITICAL') urgencyWeight = 1.0;
  else if (urgencyLevel === 'HIGH') urgencyWeight = 0.8;
  else if (urgencyLevel === 'NORMAL') urgencyWeight = 0.6;

  // 3. Role Criticality
  const roleCriticality = calculateRoleCriticality(officerCadre, targetAudience);

  // 4. Semantic Relevance
  const normRelevance = Math.min(1.0, Math.max(0.0, Number(semanticRelevance) || 0.7));

  // 5. Deadline Proximity
  const deadlineScore = calculateDeadlineScore(nominationDeadline, currentDate);

  // Active Policy Weights
  const currentWeights = weights || getPriorityWeights();

  // Weighted Sum
  const rawScore =
    (currentWeights.GAP_SEVERITY ?? DEFAULT_PRIORITY_WEIGHTS.GAP_SEVERITY) * normGap +
    (currentWeights.NOTICE_URGENCY ?? DEFAULT_PRIORITY_WEIGHTS.NOTICE_URGENCY) * urgencyWeight +
    (currentWeights.ROLE_CRITICALITY ?? DEFAULT_PRIORITY_WEIGHTS.ROLE_CRITICALITY) * roleCriticality +
    (currentWeights.SEMANTIC_RELEVANCE ?? DEFAULT_PRIORITY_WEIGHTS.SEMANTIC_RELEVANCE) * normRelevance +
    (currentWeights.DEADLINE_PROXIMITY ?? DEFAULT_PRIORITY_WEIGHTS.DEADLINE_PROXIMITY) * deadlineScore;

  const finalScore = Math.min(1.0, Math.max(0.0, Number(rawScore.toFixed(3))));

  return {
    score: finalScore,
    priorityLevel: finalScore >= 0.8 ? 'CRITICAL' : finalScore >= 0.65 ? 'HIGH' : finalScore >= 0.45 ? 'MEDIUM' : 'LOW',
    factors: {
      gapSeverity: normGap,
      noticeUrgency: urgencyWeight,
      roleCriticality,
      semanticRelevance: normRelevance,
      deadlineProximity: deadlineScore,
    },
    activeWeights: currentWeights,
    formulaVersion: FORMULA_VERSION,
  };
}
