"""Run the credential-free release-gate subset of the Kshamata evaluation corpus."""

import json

from evals.corpus import CORPUS_VERSION, build_evaluation_corpus
from pipelines.guardrails import evaluate_assessment_question, evaluate_assistant_input


def run():
    failures = []
    corpus = build_evaluation_corpus()
    for case in corpus:
        if case["category"] == "assessment":
            source = case["source"]
            result = evaluate_assessment_question({
                "stem": f"Which statement is supported about {case['topic']}?",
                "options": [
                    {"text": source, "is_correct": True},
                    {"text": "The source requires an unrelated action.", "is_correct": False},
                    {"text": "The source contains no guidance.", "is_correct": False},
                    {"text": "The source prohibits documentation.", "is_correct": False},
                ],
                "explanation": source,
            }, source)
            passed = result["allowed"]
        else:
            result = evaluate_assistant_input(case["message"])
            passed = result["allowed"] == (case["expected"] == "allow")
        if not passed:
            failures.append({"id": case["id"], "result": result})
    summary = {"corpus_version": CORPUS_VERSION, "total": len(corpus), "passed": len(corpus) - len(failures), "failed": len(failures), "failures": failures}
    print(json.dumps(summary, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(run())

