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


def generate_recommendations(official_profile, skill_gaps):
    catalog = _load_catalog()
    recommendations = []

    for gap in skill_gaps:
        competency_code = gap.get("competency_code")

        if not competency_code:
            continue

        matching_courses = [
            course
            for course in catalog
            if competency_code in course.get("competency_codes", [])
        ]

        gap_delta = float(gap.get("gap_delta", 1.0))

        for course in matching_courses:
            required_level = float(course.get("level", 1))

            match_score = min(
                0.99,
                0.70
                + min(gap_delta / 5.0, 0.20)
                + min(required_level / 50.0, 0.09),
            )

            recommendations.append({
                "course_id": course["course_id"],
                "title": course["title"],
                "provider": course["provider"],
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