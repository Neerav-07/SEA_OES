"""
Grounded MCQ & Scenario Assessment Generation Pipeline
Generates Bloom's Taxonomy-aligned questions grounded in source document text,
via a hybrid OpenAI/Gemini LLM call with automatic fallback, and rejects
near-duplicate questions using an intent hash (matches the `intentHash`
column already present in server/src/db/schema/assessments.js).
"""
import hashlib
import logging

from pipelines.llm_client import call_llm_json, LLMGenerationError

logger = logging.getLogger("assessment_generator")

SCENARIO_BLOOM_LEVELS = {"APPLY", "ANALYZE", "EVALUATE"}

DEFAULT_BLOOM_DISTRIBUTION = {
    "REMEMBER": 1,
    "UNDERSTAND": 2,
    "APPLY": 4,
    "ANALYZE": 3,
}

MAX_GENERATION_ATTEMPTS_PER_LEVEL = 2


def _question_type_for_level(bloom_level: str) -> str:
    return "SCENARIO_JUDGMENT" if bloom_level.upper() in SCENARIO_BLOOM_LEVELS else "KNOWLEDGE_MCQ"


def _compute_intent_hash(competency_name: str, bloom_level: str, intent_key: str) -> str:
    """
    intentHash groups questions that test the SAME underlying decision/fact,
    even if worded differently — scoped to competency + bloom level so a
    Remember-level and an Apply-level question about the same topic are not
    treated as duplicates of each other.
    """
    normalized = (
    f"{competency_name.strip().lower()}|"
    f"{intent_key.strip().lower()}"
)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:32]


def _build_system_prompt(competency_name: str, competency_category: str) -> str:
    return f"""You are an expert assessment designer for the Indian Official Statistical
System, writing questions for the competency "{competency_name}" (category:
{competency_category}) as part of a diagnostic and capacity-building assessment
for government officials (e.g. under MoSPI / NSSTA / iGOT Karmayogi training).

Rules:
1. Every question must be grounded in the SOURCE MATERIAL provided by the user
   — do not invent facts that are not supported by it, and do not write
   generic filler questions.
2. For Remember/Understand level questions, test recall or comprehension of a
   specific fact, definition, or procedure from the source material.
3. For Apply/Analyze/Evaluate level questions, write a rigorous, technical LEETCODE-STYLE WORKPLACE CASE STUDY structured into three clean blocks:
   BACKGROUND & OPERATIONAL CONTEXT:
   2-4 realistic sentences describing an Indian government statistical, survey, national accounts, or ETL pipeline dilemma (e.g. NSS survey non-response, CPI deflation divergence, PLFS CAPI data cleaning, ASI fixed asset imputation).
   
   SYSTEM & SAMPLE PARAMETERS:
   3-4 bullet points detailing exact sample sizes, parameters, design effects, or constraints:
   • Total Master Frame Sample (N): ...
   • Empirical Divergence / Error Rate (Δ or η): ...
   • Design Effect (DEFF) or Target Margin of Error: ...
   • Hardware or Operational Constraint: ...

   METHODOLOGICAL PROBLEM STATEMENT:
   1-2 sentences explaining why naive or default approaches fail, concluding with the exact directive question asking what statistical estimator, algorithm, or adjustment procedure must be executed.
4. Always produce exactly 4 options with exactly one marked correct.
5. Always include an explanation naming WHY the correct option is right and,
   where relevant, which competency/behavioural indicator it reflects.
6. Every question must include "intent_key": a short snake_case slug (3-6
   words) naming the SPECIFIC underlying fact or decision being tested (e.g.
   "non_response_weight_adjustment", "handling_technically_strong_but_arrogant_report").
   Two questions worded differently but testing the same underlying judgment
   must get the SAME intent_key.
7. Return ONLY valid JSON matching the schema in the user message. No
   markdown, no commentary outside the JSON.
"""


def _build_user_prompt(source_text: str, bloom_level: str, question_type: str, count: int, avoid_intents=None) -> str:
    schema_hint = """{
  "questions": [
    {
      "stem": "string - the question text (include scenario text inline for SCENARIO_JUDGMENT)",
      "options": [
        {"text": "string", "is_correct": true},
        {"text": "string", "is_correct": false},
        {"text": "string", "is_correct": false},
        {"text": "string", "is_correct": false}
      ],
      "explanation": "string",
      "bloom_level": "<REMEMBER|UNDERSTAND|APPLY|ANALYZE|EVALUATE>",
      "question_type": "<KNOWLEDGE_MCQ|SCENARIO_JUDGMENT>",
      "intent_key": "short_snake_case_slug"
    }
  ]
}"""
    avoid_block = ""
    if avoid_intents:
        avoid_list = "\n".join(f"- {slug}" for slug in avoid_intents)
        avoid_block = f"""
The following intent_key slugs have ALREADY been used for this official's
assessment. Do not generate a question testing the same underlying fact or
decision as any of these — pick a different fact/decision from the source
material entirely:
{avoid_list}
"""

    return f"""SOURCE MATERIAL:
\"\"\"
{source_text.strip()[:6000]}
\"\"\"
{avoid_block}
Generate exactly {count} question(s) at Bloom level {bloom_level}, question_type
{question_type}. Respond with JSON only, matching this schema exactly:

{schema_hint}
"""


def generate_grounded_mcqs(
    source_text: str,
    competency_name: str = "General Competency",
    competency_category: str = "Statistical",
    bloom_distribution: dict | None = None,
    existing_intent_hashes: list | None = None,
):
    """
    Generates grounded, Bloom-aligned questions (including scenario/case-study
    judgment questions) from uploaded learning material via a hybrid LLM call.
    Rejects questions whose intent_hash collides with existing_intent_hashes
    (previously asked questions for this official) or with another question
    generated in this same call, retrying that Bloom level up to
    MAX_GENERATION_ATTEMPTS_PER_LEVEL times before accepting the batch as-is.

    bloom_distribution example: {"REMEMBER": 1, "UNDERSTAND": 2, "APPLY": 4, "ANALYZE": 3}
    """
    if not source_text or not source_text.strip():
        raise ValueError("source_text is required to generate grounded questions")

    distribution = bloom_distribution or DEFAULT_BLOOM_DISTRIBUTION
    total_requested = sum(count for count in distribution.values() if count > 0)
    if total_requested <= 0:
        total_requested = 5

    system_prompt = _build_system_prompt(competency_name, competency_category)
    seen_hashes = set(existing_intent_hashes or [])

    dist_summary = ", ".join(f"{lvl}: {cnt}" for lvl, cnt in distribution.items() if cnt > 0)
    user_prompt = f"""SOURCE MATERIAL:
\"\"\"
{source_text.strip()[:6000]}
\"\"\"

Generate exactly {total_requested} questions grounded in the source material above, distributed across these Bloom levels: {dist_summary}.
For APPLY, ANALYZE, and EVALUATE levels, structure questions as technical LeetCode case studies with clear scenarios, system parameters, and directives.
Respond with JSON only, matching this schema exactly:
{{
  "questions": [
    {{
      "stem": "string - full case study or question statement",
      "options": [
        {{"text": "string", "is_correct": true}},
        {{"text": "string", "is_correct": false}},
        {{"text": "string", "is_correct": false}},
        {{"text": "string", "is_correct": false}}
      ],
      "explanation": "string - rationale citing source guidelines",
      "bloom_level": "APPLY|ANALYZE|EVALUATE|REMEMBER|UNDERSTAND",
      "question_type": "SCENARIO_JUDGMENT",
      "intent_key": "short_snake_case_slug"
    }}
  ]
}}
"""
    try:
        result = call_llm_json(system_prompt, user_prompt)
        raw_qs = result.get("questions", [])
        all_questions = []
        for idx, q in enumerate(raw_qs):
            b_level = q.get("bloom_level", "APPLY").upper()
            intent_key = (q.get("intent_key") or q.get("stem", f"q_{idx}"))[:120]
            intent_hash = _compute_intent_hash(competency_name, b_level, intent_key)
            all_questions.append({
                "id": f"Q_{idx + 1}",
                "stem": q.get("stem", ""),
                "options": q.get("options", []),
                "explanation": q.get("explanation", ""),
                "bloom_level": b_level,
                "question_type": q.get("question_type", "SCENARIO_JUDGMENT"),
                "intent_key": intent_key,
                "intent_hash": intent_hash,
            })
        if len(all_questions) > 0:
            return all_questions
    except Exception as exc:
        logger.error("Unified question generation failed: %s", exc)
        raise

    return []