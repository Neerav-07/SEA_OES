"""
Skill Gap & Evidence Fusion Calculator Pipeline
Calculates weighted competency estimates and confidence metrics from multi-source evidence.
"""

def calculate_competency_estimate(evidence_items):
    """
    Evidence fusion logic:
    - Calculates weighted score sum / max score sum
    - Computes confidence based on evidence count, recency, and source weights
    """
    if not evidence_items:
        return {"estimated_level": 0.0, "confidence": 0.0, "status": "UNASSESSED"}

    total_weighted_score = 0.0
    total_weight = 0.0

    for item in evidence_items:
        score = item.get("score", 0.0)
        weight = item.get("weight", 1.0)
        total_weighted_score += (score * weight)
        total_weight += weight

    estimated_level = (total_weighted_score / total_weight) if total_weight > 0 else 0.0
    
    # Confidence heuristic based on evidence diversity & count
    count = len(evidence_items)
    confidence = min(1.0, 0.4 + (count * 0.15))

    return {
        "estimated_level": round(estimated_level, 2),
        "confidence": round(confidence, 2),
        "status": "ASSESSED"
    }
