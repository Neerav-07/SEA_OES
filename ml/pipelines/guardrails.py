"""Deterministic runtime guardrails shared by Kshamata LLM use cases."""

from __future__ import annotations

import hashlib
import re
from dataclasses import asdict, dataclass
from typing import Any


POLICY_VERSION = "2026-09-05.1"
MAX_ASSISTANT_INPUT_CHARS = 4_000
MAX_ASSISTANT_OUTPUT_CHARS = 8_000

_INJECTION_PATTERNS = (
    r"ignore\s+(all\s+)?previous\s+instructions?",
    r"reveal\s+(the\s+)?(system|developer)\s+prompt",
    r"print\s+(the\s+)?hidden\s+instructions?",
    r"act\s+as\s+(an?\s+)?unrestricted",
    r"jailbreak",
    r"do\s+not\s+follow\s+(the\s+)?system",
)

_SENSITIVE_PATTERNS = (
    ("API_KEY", r"\b(?:sk-[A-Za-z0-9_-]{16,}|AIza[A-Za-z0-9_-]{20,})\b"),
    ("PASSWORD", r"(?i)\b(?:password|passwd|secret)\s*[:=]\s*\S+"),
    ("AADHAAR", r"\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b"),
)

_STOPWORDS = {
    "about", "according", "after", "also", "among", "and", "are", "because",
    "been", "before", "being", "best", "between", "does", "each", "from",
    "have", "into", "must", "only", "other", "should", "source", "that", "the",
    "their", "these", "this", "those", "under", "using", "what", "when", "where",
    "which", "with", "would",
}


@dataclass(frozen=True)
class Violation:
    code: str
    severity: str
    message: str
    blocking: bool = True


def _result(violations: list[Violation], scores: dict[str, float] | None = None) -> dict[str, Any]:
    return {
        "allowed": not any(item.blocking for item in violations),
        "policy_version": POLICY_VERSION,
        "violations": [asdict(item) for item in violations],
        "scores": scores or {},
    }


def _tokens(value: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-z0-9]+", value.lower())
        if len(token) > 2 and token not in _STOPWORDS
    }


def _support_score(claim: str, source: str) -> float:
    claim_tokens = _tokens(claim)
    if not claim_tokens:
        return 1.0
    return len(claim_tokens & _tokens(source)) / len(claim_tokens)


def scan_text(text: str, *, source_material: bool = False, max_chars: int | None = None) -> dict[str, Any]:
    violations: list[Violation] = []
    if max_chars is not None and len(text) > max_chars:
        violations.append(Violation("INPUT_TOO_LONG", "HIGH", f"Input exceeds {max_chars} characters."))
    for pattern in _INJECTION_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            violations.append(Violation(
                "INDIRECT_PROMPT_INJECTION" if source_material else "PROMPT_INJECTION",
                "CRITICAL",
                "Instruction-like content attempted to override the application policy.",
            ))
            break
    for code, pattern in _SENSITIVE_PATTERNS:
        if re.search(pattern, text):
            violations.append(Violation(f"SENSITIVE_{code}", "CRITICAL", "Sensitive data pattern detected."))
    return _result(violations)


def evaluate_assessment_question(question: dict[str, Any], source_text: str) -> dict[str, Any]:
    violations: list[Violation] = []
    options = question.get("options") if isinstance(question.get("options"), list) else []
    option_texts = [str(item.get("text", "")).strip() if isinstance(item, dict) else str(item).strip() for item in options]
    correct = [item for item in options if isinstance(item, dict) and bool(item.get("is_correct") or item.get("isCorrect"))]

    if not str(question.get("stem", "")).strip():
        violations.append(Violation("QUESTION_TEXT_REQUIRED", "HIGH", "Question text is required."))
    if len(options) != 4:
        violations.append(Violation("FOUR_OPTIONS_REQUIRED", "HIGH", "Exactly four options are required."))
    if len(correct) != 1:
        violations.append(Violation("ONE_CORRECT_ANSWER_REQUIRED", "HIGH", "Exactly one correct answer is required."))
    normalized = [re.sub(r"\W+", " ", item.lower()).strip() for item in option_texts]
    if len(set(normalized)) != len(normalized) or any(not item for item in normalized):
        violations.append(Violation("OPTIONS_INVALID", "HIGH", "Options must be non-empty and unique."))

    source_scan = scan_text(source_text, source_material=True)
    violations.extend(Violation(**item) for item in source_scan["violations"])

    correct_text = str(correct[0].get("text", "")) if correct else ""
    rationale = str(question.get("explanation", ""))
    answer_support = _support_score(correct_text, source_text)
    rationale_support = _support_score(rationale, source_text)
    stem_support = _support_score(str(question.get("stem", "")), source_text)

    generated_numbers = set(re.findall(r"(?<![A-Za-z])\d+(?:\.\d+)?%?", " ".join([str(question.get("stem", "")), correct_text, rationale])))
    source_numbers = set(re.findall(r"(?<![A-Za-z])\d+(?:\.\d+)?%?", source_text))
    unsupported_numbers = sorted(generated_numbers - source_numbers)
    if unsupported_numbers:
        violations.append(Violation("UNSUPPORTED_NUMERIC_CLAIM", "CRITICAL", "Generated numeric claims are absent from the source evidence."))
    if answer_support < 0.35:
        violations.append(Violation("ANSWER_NOT_GROUNDED", "CRITICAL", "The correct answer is insufficiently supported by source evidence."))
    if rationale and rationale_support < 0.25:
        violations.append(Violation("RATIONALE_NOT_GROUNDED", "HIGH", "The rationale is insufficiently supported by source evidence."))

    safety_scan = scan_text("\n".join([str(question.get("stem", "")), *option_texts, rationale]))
    violations.extend(Violation(**item) for item in safety_scan["violations"])
    scores = {
        "grounding": round((answer_support * 0.55) + (rationale_support * 0.30) + (stem_support * 0.15), 4),
        "answer_support": round(answer_support, 4),
        "rationale_support": round(rationale_support, 4),
    }
    return _result(violations, scores)


def evaluate_assistant_input(message: str) -> dict[str, Any]:
    result = scan_text(message, max_chars=MAX_ASSISTANT_INPUT_CHARS)
    boundary_patterns = (
        r"another (?:employee|official|user)'?s?",
        r"(?:show|list|give|reveal).*(?:credentials?|api keys?|database|private records?)",
        r"(?:approve|publish|enrol|enroll|delete|change).*(?:assessment|record|user|course)",
    )
    violations = [Violation(**item) for item in result["violations"]]
    if any(re.search(pattern, message, flags=re.IGNORECASE) for pattern in boundary_patterns):
        violations.append(Violation("AUTHORIZATION_BOUNDARY", "CRITICAL", "The request exceeds the assistant's advisory authority."))
    return _result(violations)


def evaluate_assistant_output(output: str) -> dict[str, Any]:
    result = scan_text(output, max_chars=MAX_ASSISTANT_OUTPUT_CHARS)
    violations = [Violation(**item) for item in result["violations"]]
    if re.search(r"(?i)(system|developer) (?:prompt|instructions?)\s*[:=]", output):
        violations.append(Violation("SYSTEM_PROMPT_LEAKAGE", "CRITICAL", "Hidden application instructions may have leaked."))
    if re.search(r"(?i)\b(?:javascript|data|file):", output):
        violations.append(Violation("UNSAFE_LINK_SCHEME", "HIGH", "Unsafe link scheme detected."))
    return _result(violations)


def redact_sensitive_text(value: str) -> str:
    redacted = value
    for code, pattern in _SENSITIVE_PATTERNS:
        redacted = re.sub(pattern, f"[REDACTED_{code}]", redacted)
    return redacted


def content_fingerprint(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()

