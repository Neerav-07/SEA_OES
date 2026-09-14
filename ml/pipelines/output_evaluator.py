"""Independent, conservative grounding evaluator for generated candidates."""
from pydantic import BaseModel, Field


class EvaluationResult(BaseModel):
    passed: bool
    answer_supported: bool
    claims_supported: bool
    citation_supported: bool
    ambiguous: bool
    issues: list[str] = Field(default_factory=list)
    evaluator_version: str = "grounding-evaluator-v1"


def evaluate_output(question: dict, source_text: str) -> EvaluationResult:
    """Reject a candidate unless its supplied excerpt is traceable to source."""
    source = (source_text or "").lower()
    quote = str(question.get("source_quote") or "").strip().lower()
    answer = str(question.get("correct_answer") or "").strip().lower()
    citation_supported = bool(quote and quote in source)
    answer_supported = bool(answer and answer in source) or citation_supported
    options = question.get("options") or []
    correct_count = sum(1 for option in options if option.get("is_correct") or option.get("isCorrect"))
    ambiguous = correct_count != 1
    issues = []
    if not citation_supported: issues.append("Citation is missing or not present in source material.")
    if not answer_supported: issues.append("Correct answer is not traceable to source material.")
    if ambiguous: issues.append("Question does not have exactly one marked correct option.")
    return EvaluationResult(passed=not issues, answer_supported=answer_supported, claims_supported=citation_supported, citation_supported=citation_supported, ambiguous=ambiguous, issues=issues)
