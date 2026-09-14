"""
Skill Gap & Evidence Fusion Calculator Pipeline (MoSPI FRAC Standards)
Calculates audit-compliant, Bayesian-weighted competency estimates (Levels 1.0 - 5.0)
and multi-factor confidence metrics from multi-source evidence.

Matches the deterministic formula in server/src/utils/evidenceFusion.js:
Formula: sum(normalized_score * weight * recency) / sum(weight * recency)
"""

from typing import List, Dict, Any

DEFAULT_TYPE_WEIGHTS = {
    "KNOWLEDGE": 0.40,    # MCQ / Diagnostic assessment
    "APPLICATION": 0.35,  # Scenario / Case decision
    "PERFORMANCE": 0.25,  # Practical exercise / Simulation
    "EXTERNAL": 0.20,     # Accredited certification / External audit
    "LEARNING": 0.10,     # Course completion (completion != competency)
}


def calculate_recency_factor(days_elapsed: int = 0, max_validity_days: int = 365) -> float:
    """Stale evidence decays confidence/weight, preserving audit integrity."""
    if days_elapsed <= 90:
        return 1.0
    if days_elapsed >= max_validity_days:
        return 0.5
    return round(1.0 - (0.5 * (days_elapsed - 90)) / (max_validity_days - 90), 2)


def calculate_competency_estimate(evidence_items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Weighted Evidence Fusion:
    - Normalizes scores to 1.0 - 5.0 scale
    - Applies type-specific weights and temporal decay
    - Computes confidence across count, diversity, and recency
    """
    if not evidence_items:
        return {
            "estimated_level": 1.0,
            "confidence": 30.0,
            "status": "UNASSESSED",
            "evidence_count": 0,
        }

    weighted_score_sum = 0.0
    weight_sum = 0.0
    evidence_types = set()
    recency_factors = []

    for item in evidence_items:
        evidence_type = item.get("evidence_type", item.get("evidenceType", "KNOWLEDGE")).upper()
        evidence_types.add(evidence_type)
        
        type_weight = float(item.get("weight") or DEFAULT_TYPE_WEIGHTS.get(evidence_type, 0.20))
        days_elapsed = int(item.get("days_elapsed", item.get("daysElapsed", 0)))
        recency = calculate_recency_factor(days_elapsed)
        recency_factors.append(recency)

        effective_weight = type_weight * recency

        raw_score = float(item.get("score", 0.0))
        max_score = float(item.get("max_score", item.get("maxScore", 5.0))) or 5.0
        normalized_score = (raw_score / max_score) * 5.0

        weighted_score_sum += (normalized_score * effective_weight)
        weight_sum += effective_weight

    estimated_level = (weighted_score_sum / weight_sum) if weight_sum > 0 else 1.0
    bounded_level = round(min(5.0, max(1.0, estimated_level)), 1)

    # Multi-factor confidence scoring (Count + Diversity + Recency)
    count_factor = min(40, len(evidence_items) * 10)
    diversity_factor = min(40, len(evidence_types) * 10)
    avg_recency = sum(recency_factors) / len(recency_factors) if recency_factors else 1.0
    recency_factor_score = round(avg_recency * 20)
    confidence = min(98, max(35, count_factor + diversity_factor + recency_factor_score))

    return {
        "estimated_level": bounded_level,
        "confidence": confidence,
        "status": "ASSESSED",
        "evidence_count": len(evidence_items),
        "type_diversity": len(evidence_types),
    }
