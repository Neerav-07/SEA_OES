/**
 * Evidence Fusion Engine
 * Implements weighted evidence aggregation, recency decay, and confidence scoring
 */

export const DEFAULT_TYPE_WEIGHTS = {
  KNOWLEDGE: 0.40,    // MCQ / Diagnostic assessment
  APPLICATION: 0.35,  // Scenario / Case decision
  PERFORMANCE: 0.25,  // Practical exercise / Simulation
  EXTERNAL: 0.20,     // Accredited certification / External audit
  LEARNING: 0.10,     // Course completion (completion != competency)
};

/**
 * Calculates days elapsed between recordedAt date and now
 */
export function calculateDaysElapsed(recordedAt) {
  if (!recordedAt) return 0;
  const recorded = new Date(recordedAt);
  const now = new Date();
  const diffTime = Math.abs(now - recorded);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates recency factor (stale evidence decays confidence, not competency directly)
 */
export function calculateRecencyFactor(recordedAt, maxValidityDays = 365) {
  const daysElapsed = calculateDaysElapsed(recordedAt);
  if (daysElapsed <= 90) return 1.0;
  if (daysElapsed >= maxValidityDays) return 0.5;
  return Number((1.0 - (0.5 * (daysElapsed - 90)) / (maxValidityDays - 90)).toFixed(2));
}

/**
 * Weighted Evidence Fusion
 * Formula: sum(score * weight * recency) / sum(weight * recency)
 */
export function calculateWeightedEstimate(evidenceItems = []) {
  if (!evidenceItems || evidenceItems.length === 0) {
    return 1.0; // Baseline Level 1 (Awareness)
  }

  let weightedScoreSum = 0;
  let weightSum = 0;

  evidenceItems.forEach((item) => {
    const typeWeight = item.weight || DEFAULT_TYPE_WEIGHTS[item.evidenceType] || 0.2;
    const recency = calculateRecencyFactor(item.recordedAt);
    const effectiveWeight = typeWeight * recency;

    const normalizedScore = (item.score / (item.maxScore || 5.0)) * 5.0;
    weightedScoreSum += normalizedScore * effectiveWeight;
    weightSum += effectiveWeight;
  });

  if (weightSum === 0) return 1.0;

  const estimate = weightedScoreSum / weightSum;
  return Number(Math.min(5.0, Math.max(1.0, estimate)).toFixed(1));
}

/**
 * Confidence Score Calculation
 * Factors: Evidence count, type diversity, and recency
 */
export function calculateConfidenceScore(evidenceItems = []) {
  if (!evidenceItems || evidenceItems.length === 0) {
    return 30; // Default baseline confidence for unassessed
  }

  // 1. Evidence count factor (up to 40%)
  const countFactor = Math.min(40, evidenceItems.length * 10);

  // 2. Type diversity factor (up to 40%)
  const uniqueTypes = new Set(evidenceItems.map((e) => e.evidenceType));
  const diversityFactor = Math.min(40, uniqueTypes.size * 10);

  // 3. Average recency factor (up to 20%)
  const avgRecency =
    evidenceItems.reduce((acc, e) => acc + calculateRecencyFactor(e.recordedAt), 0) / evidenceItems.length;
  const recencyFactor = Math.round(avgRecency * 20);

  const totalConfidence = countFactor + diversityFactor + recencyFactor;
  return Math.min(98, Math.max(35, totalConfidence));
}
