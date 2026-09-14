# AI Guardrails and LLM Output Evaluation

## Purpose

Kshamata uses LLMs for grounded assessment generation and a personalized capacity-building assistant. These controls keep those outputs safe, evidence-backed, reproducible, and auditable.

## Risk model

The implementation follows a risk-tiered policy:

- Assessment items fail closed when evidence is unavailable or any blocking validation fails.
- Human approval remains mandatory before an assessment item can be published.
- Unsafe or sensitive assistant output is replaced with a safe refusal.
- Models remain advisory and cannot enroll users, change competency records, approve questions, or perform governance actions.
- Prompts, outputs, employee context, evaluations, and traces remain on project-controlled infrastructure.

Primary risks are indirect prompt injection through uploaded sources, unsupported claims, fabricated citations, sensitive employee data leakage, unsafe output handling, silent provider changes, semantic duplicates, and unbounded use.

## Architecture

All model calls pass through the ML service's audited LLM client. Each invocation records a request ID, use case, provider, model, prompt version, policy version, parameters, latency, fallback event, and outcome. Raw secrets and unrestricted employee identifiers are never trace fields.

### Assessment generation

1. Retrieve only approved, checksum-addressable source versions.
2. Stop with `INSUFFICIENT_EVIDENCE` when relevant evidence is unavailable.
3. Treat source text as untrusted data and detect embedded instructions.
4. Require strict structured output with four unique options and one correct answer.
5. Validate citation membership, claim support, unsupported numbers, ambiguity, duplication, and sensitive content.
6. Persist generation lineage, provenance, and validation results.
7. Expose all evidence and results to an administrator for mandatory review.

### Assistant

1. Validate and bound the user message.
2. Minimize and pseudonymize employee context sent to the model.
3. Refuse prompt extraction, cross-user data requests, credentials, and administrative actions.
4. Scan generated output for sensitive data, prompt leakage, unsafe links, and unsupported claims.
5. Replace rejected output with a deterministic refusal and record the policy decision.
6. Store only redacted conversation content with an explicit retention deadline.

## Local prototype scope

The current prototype includes application-owned deterministic checks, a credential-free 150-case local evaluation corpus, a Promptfoo-compatible local red-team configuration, PostgreSQL audit records, and an evidence-aware administrator review screen.

Implemented components:

| Area | Implementation |
| --- | --- |
| Runtime policy | `ml/pipelines/guardrails.py` and `server/src/utils/aiGuardrails.js` |
| Model metadata | `ml/pipelines/llm_client.py` |
| Assessment enforcement | `ml/pipelines/assessment_generator.py`, `server/src/services/questionGeneration.service.js`, and `server/src/services/questionValidation.service.js` |
| Assistant enforcement | `ml/main.py` and `server/src/controllers/integrations/assistant.controller.js` |
| Audit storage | `server/src/db/schema/assessment/aiGovernance.js` and local database auto-initialization |
| Human review | `client/src/pages/dashboard/admin/ReviewQueuePage.jsx` |
| Local evaluations | `ml/evals/corpus.py`, `ml/evals/run_evals.py`, and `ml/evals/promptfooconfig.yaml` |

Run the local checks with:

```bash
cd ml
python -m unittest discover -s tests -v
python -m evals.run_evals

cd ../server
npm test
```

No CI/CD workflow, hosted evaluator, or separate observability service is required for this prototype.

## Approach tradeoffs

| Approach | Advantages | Limitations | Prototype decision |
| --- | --- | --- | --- |
| Deterministic application checks | Fast, explainable, repeatable, credential-free, and suitable for hard blocking | Cannot judge every subtle semantic error | Implemented as the enforcement layer |
| Model-based evaluation | Better at nuanced correctness, relevance, and faithfulness | Variable, slower, costs tokens, and must not be the only safety gate | Deferred until a fixed provider credential is available |
| Human administrator review | Strongest accountability for publishable assessment content | Slower and depends on reviewer consistency | Implemented as mandatory before publication |
| Managed evaluation SaaS | Quick dashboards and experiment comparison | External data handling, recurring cost, and provider coupling | Not needed for the local prototype |
| Self-hosted observability | Better data control and customizable traces | Adds operational components and maintenance | Future option after local usage justifies it |

## Future evaluation options

The recommended self-hosted toolchain is composable:

- Application-owned deterministic checks enforce production decisions.
- Ragas-compatible metrics measure groundedness, response relevance, context precision, and context recall.
- Promptfoo runs repeatable model/prompt comparisons and adversarial red-team cases.
- Self-hosted Phoenix can later receive redacted OpenTelemetry traces, datasets, experiment results, and human labels.

This approach has stronger provider independence and data control than a managed SaaS. Its main costs are operating several components and controlling the variability and token cost of model-based judges. A self-hosted Langfuse deployment is a viable integrated alternative, but it brings heavier storage and platform coupling and still requires application-owned runtime enforcement.

## Evaluation corpus and release gates

The initial versioned corpus should contain at least 150 cases:

- 60 assessment cases spanning competencies, Bloom levels, sparse or contradictory evidence, and numerical claims.
- 50 assistant cases spanning normal advice, unknown questions, and authorization boundaries.
- 40 adversarial cases spanning direct and indirect injection, document exfiltration, prompt extraction, PII requests, encoded attacks, and oversized input.

Initial promotion gates are:

- 100 percent schema-valid assessment output.
- Zero critical privacy, injection, authorization, or source-fabrication failures.
- At least 0.90 average assessment faithfulness.
- At least 0.90 expert-rated answer correctness.
- At least 0.85 assistant relevance and groundedness where grounding applies.
- No approved metric regresses by more than two percentage points.

Production failures, reviewer rejections, and user feedback become regression cases. Lowering a threshold requires a documented governance decision.

## Operational controls

- Pin provider model names and prompt/policy versions.
- Bound retries, timeouts, input/output tokens, concurrency, and per-user request rates.
- Record provider fallback and reevaluate the fallback output under the same policy.
- Run deterministic evaluation locally before demonstrating a prompt or model change.
- Run the fixed-model evaluation subset locally when provider credentials are available.
- Run the full corpus and red team before using a changed prompt or model in a demonstration.
- Sample redacted production traces for delayed evaluation and human review.
- Preserve immutable question versions, reviewer identity, reasons, evaluation results, and source versions.

## Acceptance scenarios

- Empty retrieval cannot create synthetic evidence or a publishable question.
- Instructions embedded in source material are ignored and reported.
- Unsupported dates, percentages, and formulas block an assessment item.
- Semantically equivalent questions are detected despite wording changes.
- Provider fallback is visible and carries complete evaluation metadata.
- Assistant attempts to obtain prompts, credentials, other users' records, or source documents are refused.
- PII is redacted from traces while authorized personalization remains usable.
- Failed assessment items cannot be approved through the review API.
