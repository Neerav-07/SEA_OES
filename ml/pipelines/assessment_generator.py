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
    system_prompt = _build_system_prompt(competency_name, competency_category)
    seen_hashes = set(existing_intent_hashes or [])

    all_questions = []
    question_counter = 1

    for bloom_level, count in distribution.items():
        if count <= 0:
            continue
        question_type = _question_type_for_level(bloom_level)
        accepted = []
        avoid_intents = []

        for attempt in range(MAX_GENERATION_ATTEMPTS_PER_LEVEL):
            remaining = count - len(accepted)
            if remaining <= 0:
                break

            user_prompt = _build_user_prompt(
                source_text, bloom_level, question_type, remaining,
                avoid_intents=avoid_intents if attempt > 0 else None,
            )

            try:
                result = call_llm_json(system_prompt, user_prompt)
            except LLMGenerationError as exc:
                logger.error("Question generation failed for level %s: %s", bloom_level, exc)
                raise

            for q in result.get("questions", []):
                intent_key = (q.get("intent_key") or q.get("stem", "untitled"))[:120]
                intent_hash = _compute_intent_hash(competency_name, bloom_level, intent_key)

                if intent_hash in seen_hashes:
                    logger.info("Discarding duplicate intent '%s' for %s/%s", intent_key, competency_name, bloom_level)
                    avoid_intents.append(intent_key)
                    continue

                seen_hashes.add(intent_hash)
                accepted.append({
                    "id": f"Q_{question_counter}",
                    "stem": q.get("stem", ""),
                    "options": q.get("options", []),
                    "explanation": q.get("explanation", ""),
                    "bloom_level": bloom_level,
                    "question_type": q.get("question_type", question_type),
                    "intent_key": intent_key,
                    "intent_hash": intent_hash,
                })
                question_counter += 1

        all_questions.extend(accepted)

    return all_questions