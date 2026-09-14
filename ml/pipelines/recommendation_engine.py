import json
from pathlib import Path

CATALOG_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "course_catalogue.json"
)


def _load_catalog():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


LEVEL_MAP = {
    "beginner": 1.0,
    "foundational": 1.0,
    "intermediate": 2.5,
    "advanced": 4.0,
    "expert": 5.0,
}

# Alias dictionary connecting MoSPI competency standard codes to course catalogue competency codes
COMPETENCY_ALIASES = {
    "SAMPLING_METHODS": ["SURVEY_SAMPLING", "STATISTICAL_ANALYSIS"],
    "SURVEY_DESIGN": ["SURVEY_SAMPLING", "STATISTICAL_ANALYSIS"],
    "NATIONAL_ACCOUNTS": ["STATISTICAL_ANALYSIS"],
    "PRICE_STATISTICS": ["STATISTICAL_ANALYSIS"],
    "LABOUR_STATISTICS": ["STATISTICAL_ANALYSIS", "SURVEY_SAMPLING"],
    "AGRI_STATISTICS": ["STATISTICAL_ANALYSIS", "SURVEY_SAMPLING"],
    "INDUSTRIAL_STATISTICS": ["STATISTICAL_ANALYSIS"],
    "OFFICIAL_STATISTICS": ["STATISTICAL_ANALYSIS", "SURVEY_SAMPLING"],
    "PYTHON_ANALYTICS": ["PYTHON_DATA", "STATISTICAL_ANALYSIS"],
    "R_PROGRAMMING": ["STATISTICAL_ANALYSIS", "PYTHON_DATA"],
    "SQL_DATABASE": ["SQL_DATA"],
    "DATA_PRIVACY_DPDP": ["DATA_PRIVACY"],
    "GIS_SPATIAL": ["GIS_VISUALIZATION"],
    "DASHBOARD_BI": ["GIS_VISUALIZATION", "PYTHON_DATA"],
    "BIG_DATA": ["CLOUD_APIS", "PYTHON_DATA", "SQL_DATA"],
    "TIME_SERIES": ["STATISTICAL_ANALYSIS", "PYTHON_DATA"],
    "DATA_QUALITY": ["STATISTICAL_ANALYSIS", "DATA_PRIVACY"],
    "CLOUD_COMPUTING": ["CLOUD_APIS"],
}


def _normalize_level(level_val) -> float:
    """Safely normalizes numeric or text course difficulty levels to a float 1.0 - 5.0."""
    if isinstance(level_val, (int, float)):
        return float(level_val)
    if isinstance(level_val, str):
        cleaned = level_val.strip().lower()
        if cleaned in LEVEL_MAP:
            return LEVEL_MAP[cleaned]
        try:
            return float(cleaned)
        except ValueError:
            return 1.0
    return 1.0


def generate_recommendations(official_profile, skill_gaps):
    catalog = _load_catalog()
    recommendations = []
    seen_course_ids = set()

    for gap in skill_gaps:
        competency_code = gap.get("competency_code")
        competency_name = gap.get("competency_name", competency_code or "")

        if not competency_code:
            continue

        target_codes = set(COMPETENCY_ALIASES.get(competency_code, []))
        target_codes.add(competency_code)

        matching_courses = [
            course
            for course in catalog
            if any(code in target_codes for code in course.get("competency_codes", []))
        ]

        # Fallback to name/keyword matching if no exact or alias code matched
        if not matching_courses and competency_name:
            name_words = [w.lower() for w in competency_name.split() if len(w) > 3]
            for course in catalog:
                text = f"{course.get('title', '')} {course.get('description', '')}".lower()
                if any(w in text for w in name_words):
                    matching_courses.append(course)

        gap_delta = float(gap.get("gap_delta", 1.0))

        for course in matching_courses:
            course_id = course.get("course_id")
            if course_id in seen_course_ids:
                continue

            required_level = float(course.get("level_numeric") or _normalize_level(course.get("level", 1)))

            match_score = min(
                0.99,
                0.70
                + min(gap_delta / 5.0, 0.20)
                + min(required_level / 50.0, 0.09),
            )

            seen_course_ids.add(course_id)
            recommendations.append({
                "course_id": course_id,
                "title": course.get("title", "Course"),
                "provider": course.get("provider", "iGOT Karmayogi"),
                "duration_hours": course.get("duration_hours", 0),
                "match_score": round(match_score, 2),
                "target_competency": competency_code,
                "reason": (
                    f"Recommended to address the identified "
                    f"{gap_delta:.1f}-level competency gap in "
                    f"{gap.get('competency_name', competency_code)}."
                ),
            })

    recommendations.sort(
        key=lambda x: x["match_score"],
        reverse=True,
    )

    return recommendations