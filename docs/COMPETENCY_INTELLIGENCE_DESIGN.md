# Course mapping, assessment evaluation, and competency intelligence

Status: proposed architecture, not implemented. Repository reviewed on 2026-09-09. This document and its [schema companion](COMPETENCY_INTELLIGENCE_SCHEMA.md) describe future changes only.

## Recommendation

Use **self-hosted Langfuse for LLM observability and evaluation**, with application-owned evaluators and decision rules. Build one connected learning cycle:

**Course content -> course outcomes -> internal competency dimensions -> validated questions -> graded responses -> evidence -> competency gaps -> targeted learning -> reassessment.**

The underlying problem is missing measurement lineage: today, the system cannot consistently explain which piece of course content supports a question, which aspect of competence a response measures, and why a particular course should address the resulting gap. Adding a tracing dashboard alone cannot establish those relationships.

| Requested capability | Proposed solution |
| --- | --- |
| Evaluate generated problems | Separate checks for factual correctness, source support, course relevance, answerability, ambiguity, cognitive alignment, and duplication; require publication approval |
| Map courses and optional COs | Versioned course ingestion with manual outcomes or automatic extraction; evidence-backed, many-to-many mappings to the governed taxonomy |
| Update the database design | Extend existing provenance, question, evidence, and gap tables; introduce course outcomes, rubric criteria, response evaluations, and dimension-level records |
| Evaluate learner answers | Server-side objective grading plus rubric-based evaluation for constructed responses; record criterion-level evidence and review uncertain grades |
| Improve gaps and recommendations | Dimension-specific estimates with evidence sufficiency, role-specific targets, separate assessment and learning priorities, prerequisite-aware ranking, and learning paths |

Here, **CO means Course Outcome**: a measurable ability expected after a particular course. Internal competencies and learning objectives remain institution-owned concepts. An LLM may propose a mapping or a missing CO; it does not silently redefine the competency framework.

This proposal changes the future tool recommendation in [AI_GUARDRAILS_AND_EVALUATION.md](AI_GUARDRAILS_AND_EVALUATION.md): prefer Langfuse as the integrated observability/evaluation platform rather than starting with several overlapping platforms. Preserve that document's application enforcement, review, and data-control principles. Its prototype claims and thresholds should not be interpreted as measured semantic-evaluation results.

## What the repository actually does

These findings come from static inspection of the working tree, including existing uncommitted work. No running database or end-to-end behavior was verified for this documentation task.

| Area | Existing implementation | Design implication |
| --- | --- | --- |
| Python gap calculator | [skill_gap_calculator.py](../ml/pipelines/skill_gap_calculator.py) averages scores using weights and sets confidence from item count | It has no competency grouping, score-scale normalization, role target, item quality, recency, or dimension model |
| Server evidence fusion | [evidenceFusion.js](../server/src/utils/evidenceFusion.js) includes type weights, normalized scores, recency, and count/diversity heuristics | Reuse the concepts, but distinguish measured proficiency from heuristic evidence sufficiency; missing evidence currently receives a baseline estimate |
| Server gap pipeline | [skillGap.service.js](../server/src/services/skillGap.service.js) and [skillGapCalculator.js](../server/src/utils/skillGapCalculator.js) use role requirements and separate learning/assessment priorities | The server is more developed than the Python function. Unify calculation ownership; preserve useful existing behavior |
| Multiple calculation paths | [pathway.controller.js](../server/src/controllers/integrations/pathway.controller.js) recomputes estimates with its own sufficiency heuristic | Two screens can derive different decisions from the same learner evidence |
| Python recommendations | [recommendation_engine.py](../ml/pipelines/recommendation_engine.py) matches competency codes in a JSON catalogue; ignores its profile argument; gives higher scores partly for higher course levels | No prerequisite or learner-level fit, dimensional coverage, deduplication across gaps, or outcome measurement |
| Server recommendations | [autoAutomation.service.js](../server/src/services/autoAutomation.service.js) also creates recommendations using fixed provider scores | Competing recommendation paths and incompatible score semantics need one authoritative ranker |
| Course mapping | Material ingestion in [pathway.controller.js](../server/src/controllers/integrations/pathway.controller.js) accepts one competency or picks the top embedding match; writes `mappedObjectives: null` | This is a useful starting point, but does not extract measurable COs or verify coverage against course content |
| Taxonomy | [competency_mapping.py](../ml/pipelines/competency_mapping.py) reads a local taxonomy file; PostgreSQL already has competencies, sub-competencies, learning objectives, and claims | Use the database taxonomy as the authority and export versioned search snapshots to ML |
| Retrieval | [retrieval.service.js](../server/src/services/retrieval.service.js) ranks READY source chunks using lexical overlap and optional document/version filters | Introduce mandatory course-version scope, content approval, hybrid retrieval, and retrieval evaluation |
| Question checks | [guardrails.py](../ml/pipelines/guardrails.py) and [questionValidation.service.js](../server/src/services/questionValidation.service.js) use structural checks, token overlap, numeric checks, and duplicate heuristics | Word overlap can miss a contradiction and reject a correct paraphrase; it cannot establish semantic correctness |
| Question lifecycle | Existing source versions, chunks, question versions, provenance, validation records, blueprints, and review states | Extend these instead of inventing another question bank |
| Objective grading | [attempt.controller.js](../server/src/controllers/assessments/attempt.controller.js) grades against mutable question rows, generally aggregates to one competency, and has a fallback using response-provided correctness | Pin delivered versions and score only trusted server-owned answer keys; remove grading fallbacks from the proposed production flow |
| Diagnostic grading | [diagnostic.controller.js](../server/src/controllers/assessments/diagnostic.controller.js) accepts submitted competency IDs and `isCorrect` flags | Learner input cannot be authoritative evidence of correctness or competency attribution |
| Evals | [run_evals.py](../ml/evals/run_evals.py) constructs supported questions from fixtures and exercises guardrails | Keep as deterministic regression coverage; add actual generator, retriever, mapper, and grader evaluations |
| Schema ownership | [schema/index.js](../server/src/db/schema/index.js) exports modular schemas, while [autoInit.js](../server/src/db/autoInit.js) also creates attempts, review, and mapping tables | Reconcile the actual deployed schema before migrations; old schema files and architecture slides are not authoritative evidence of implemented behavior |

The architecture slides describe Bayesian fusion, but the inspected fusion implementations are weighted averages and heuristics. Treat a Bayesian estimator as a future design decision, not an existing capability.

## Langfuse's role and viable alternatives

Langfuse supports LLM tracing, including model calls, retrieval steps, latency, token usage, and associated metadata. It also supports datasets, experiments, judge evaluations, and custom scores. This fits the existing Python and JavaScript services without requiring a move to LangChain. [Observability documentation](https://langfuse.com/docs/observability/overview), [evaluation overview](https://langfuse.com/docs/evaluation/overview).

| Option | Fit for this project | Decision |
| --- | --- | --- |
| Self-hosted Langfuse + application evaluators | One place for traces, experiments, prompt history, and evaluation results; project-controlled storage | Recommended target |
| Langfuse Cloud + the same application evaluators | Managed deployment; requires an explicit decision about which source and employee data may leave project infrastructure | Viable if the data-hosting requirement changes |
| Phoenix + application evaluators | Alternative platform with tracing and evaluation capabilities | Viable substitute if the team prefers its workflows; no need to operate it alongside Langfuse initially |
| Local evaluation runner only | Useful deterministic checks and offline baselines, but no shared production investigation workflow | Retain as a test layer, not the complete target |

Phoenix provides tracing, evaluation, datasets, and experiments. The choice here is an architectural preference for an integrated Langfuse workflow, not a claim that Phoenix is incapable or inherently more provider-independent. [Phoenix documentation](https://arize.com/docs/phoenix).

Use Ragas selectively for retrieval and grounding metrics, and keep Promptfoo where its existing regression/red-team workflow is useful. Neither is required to calculate learner competency, and neither needs to become another system of record. Ragas distinguishes metrics such as context precision, context recall, and faithfulness; Promptfoo supports evaluation and red-teaming. [Ragas metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/), [Promptfoo introduction](https://www.promptfoo.dev/docs/intro/).

### Ownership boundary

| Responsibility | Owner |
| --- | --- |
| Courses, approved CO mappings, source versions, questions, rubrics, responses | Application PostgreSQL and controlled source storage |
| Evaluator definitions, publication policies, grade finalization, evidence validity | Application services and governed versioned configuration |
| LLM calls, embeddings, semantic evaluators, estimate computation, ranking | Python ML modules behind the existing service boundary |
| Traces, experiment comparisons, mirrored evaluation scores, prompt investigation | Langfuse |
| Question approval, disputed grades, taxonomy changes | Authorized domain reviewers through the application |
| Queue health, API failures, database saturation | Existing application/infrastructure monitoring; Langfuse does not replace all operational monitoring |

Use one authoritative estimator and one authoritative ranker in Python. Express authenticates requests, loads immutable input snapshots, schedules work, validates results, and commits domain state. Retire calculation logic in alternate routes only after parity and shadow comparisons. The browser never calculates authoritative grades or gaps.

### Tracing design

Create separate traces for course ingestion, question generation, submission grading, estimate recalculation, and recommendation runs. Link asynchronous workflows with application run IDs and causal trace links; do not keep a single trace open for the duration of a course.

Record spans/observations for extraction, retrieval, mapping, generation, validation, grading, evidence aggregation, candidate filtering, and ranking. Include identifiers for course/source/question/rubric versions, taxonomy and policy versions, model/provider, prompt version, retrieval configuration, retries, fallback, token usage, and latency. Use pseudonymous learner references.

Send explicit metric names such as `question.answer_key_correctness`, `question.course_relevance`, `mapping.coverage`, `grading.expert_agreement`, and `recommendation.prerequisite_valid`. A judge's score of a grading explanation and a student's earned marks are different measurements.

For managed online judges, target the relevant observation. Current Langfuse documentation says these evaluators do not automatically load sibling or child observations. Include the necessary redacted source context, expected criteria, and candidate output on the evaluated observation, or run the evaluator in the application where that context is available. Pin the SDK/server versions at implementation time. [LLM-as-a-judge documentation](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge).

Persist decision-driving results in PostgreSQL first, then export scores to Langfuse using stable evaluation IDs and trace/observation links. Langfuse supports scores from application-owned evaluation pipelines through its API/SDK. [Custom score ingestion](https://langfuse.com/docs/evaluation/evaluation-methods/scores-via-sdk).

### Availability and data handling

Langfuse telemetry failure must not corrupt or stop already valid grading. Queue exports with bounded retries and expose export failures. In contrast, a missing required correctness evaluation keeps a question unpublished; a missing required semantic grade stays pending. An observability outage and an evaluator outage have different consequences.

Self-hosting currently includes web and worker containers, PostgreSQL, ClickHouse, Redis/Valkey, and object storage. Keep Langfuse's database/schema lifecycle separate from the application's. Docker Compose is suitable for a local pilot; production needs backups, capacity planning, access controls, and recovery procedures. Some add-on features require licensing. [Self-hosting documentation](https://langfuse.com/self-hosting).

Redact before export, limit raw response/source retention, and restrict answer keys to authorized reviewers. Masking is available in Langfuse SDK workflows. Self-hosting telemetry does not keep prompts local if the generator or judge calls an external model provider; configure those routes separately under the project's data policy. [Masking documentation](https://langfuse.com/docs/observability/features/masking).

## Course ingestion and CO mapping

### Concepts that must remain distinct

| Concept | Example | Ownership |
| --- | --- | --- |
| Competency | Sampling design | Institution taxonomy |
| Sub-competency | Non-response adjustment | Institution taxonomy |
| Learning objective / claim | Select and justify a suitable adjustment method | Reusable internal standard |
| Course outcome | CO2: calculate and justify adjustment weights from a survey response table | Specific course version |
| Dimension | Non-response adjustment / application | Measurable aspect of competence |
| Bloom level | Apply or analyze | Cognitive demand of an outcome or question |
| Proficiency level | Institution-defined level with performance descriptors | Role/competency standard, not a Bloom label |

A course can cover several competencies. A CO can map to several objectives or dimensions. A competency can be addressed by many courses. Mapping weights represent attribution or coverage, with explicit semantics; they are not proof that a learner has mastered the mapped skill.

### Proposed course-author flow

1. **Add course metadata and content.** Capture provider ID, title, description, language, duration, delivery mode, availability, prerequisites, and source files or permitted source references.
2. **Choose outcome entry mode.** Offer “Select existing learning objectives”, “Write course outcomes”, and “Generate outcomes from content”. Leaving COs empty automatically starts extraction. If only some COs are supplied, preserve them and suggest additions separately.
3. **Process a fixed source version.** Extract text/OCR, preserve headings, tables, page locations and checksums, and assess extraction completeness. Store/index chunks linked to the course version.
4. **Generate measurable outcomes where needed.** Require an action, subject, conditions, and expected performance. “Understand statistics” is too broad; “Choose a sampling approach given frame coverage and cost constraints” is assessable.
5. **Retrieve taxonomy candidates.** Search approved competency definitions, sub-competencies, objectives, claims, and performance descriptors. Use embeddings and lexical matching for candidate retrieval; do not treat cosine similarity as calibrated probability.
6. **Evaluate the mappings.** Give the LLM the candidate IDs, CO, relevant course excerpts, and level descriptors. Require selected existing IDs, supporting chunk references, coverage (`INTRODUCES`, `PRACTISES`, `ASSESSES`), proposed depth, rationale, and uncertainty. Allow `NO_MATCH` and `INSUFFICIENT_CONTENT`.
7. **Validate and review.** Check referenced IDs and hierarchy, citation membership, semantic support, duplicate outcomes, and whether stated depth is actually taught. Show proposed COs and mappings with source excerpts, editable selections, and unresolved issues.
8. **Publish a mapping revision.** Course authors/reviewers approve the outcome set and mapping revision. Automatic generation completes the missing authoring work without making unverified suggestions authoritative.

Default policy: auto-create draft COs and mappings; require review before mappings affect scored assessments or official recommendations. A later auto-approval policy for low-impact course discovery may be introduced only after measured mapping precision supports it. This is a proposed product policy, not a request for permission to write this document.

Use the states `DRAFT -> PROCESSING -> NEEDS_REVIEW -> PUBLISHED`, with `FAILED`, `INSUFFICIENT_CONTENT`, and `SUPERSEDED` outcomes. The author sees progress and actionable reasons rather than a permanently empty mapping screen.

### Course RAG and version changes

Retrieval for course assessment must filter by authorized course version and approved source versions before ranking. Use PostgreSQL full-text search plus an embedding index, followed by a reranker if evaluated gains justify it. Start with PostgreSQL and pgvector rather than introducing a separate vector service without scale evidence. pgvector documents combining vector retrieval with PostgreSQL full-text search. [pgvector hybrid search](https://github.com/pgvector/pgvector#hybrid-search).

Chunk by instructional structure, preserving formula/table context. Search for the CO and claim, not just the broad competency name. Store the exact retrieved chunk set and the subset actually supplied to the model. Replace the current fixed 6,000-character truncation with a token-budgeted context selection step that reports insufficient coverage.

An externally sourced course with only a title and description can receive a provisional discovery mapping. It cannot support course-grounded assessment questions until adequate permitted content exists. Ingestion readiness and academic approval are separate states; `READY` alone should not mean “approved source”.

On content changes, create a new course/source revision and recompute affected mappings. Keep existing attempts pinned to their historical questions. Flag questions whose supporting content is invalidated; review before further delivery and determine whether historical evidence needs correction. Do not silently remap past responses onto the new taxonomy.

## Evaluating generated questions

Treat generation as an authoring workflow with an independent evaluation stage. Do not accept the generator's self-rating as validation.

1. Build an assessment blueprint from approved CO mappings, required dimensions, level descriptors, and the desired cognitive distribution.
2. Retrieve supporting content from that course version. If support is inadequate, stop with `INSUFFICIENT_EVIDENCE`.
3. Generate a structured candidate: stem, stable option IDs where applicable, key/reference answer, rationale, citations, tested claims, dimensions, target level, and rubric or scoring rule.
4. Run deterministic and semantic evaluation; reject or revise failed candidates within a bounded retry budget.
5. Present passing candidates, citations, computed checks, and judge findings for human approval. Edits create a new question version and invalidate prior evaluation approval.
6. Deliver only approved versions. Sample production responses and reviewer decisions to detect weak items and improve future evaluations.

### Evaluation dimensions

| Dimension | What to establish | Method and result |
| --- | --- | --- |
| Structure | Supported type, required fields, valid key, distinct options, numeric bounds | Deterministic pass/fail |
| Source integrity | Every citation resolves to an authorized, approved source version actually supplied | Deterministic pass/fail |
| Factual and answer-key correctness | The answer and reasoning are true, including calculations and assumptions | Independent solution, domain judge, deterministic calculation where possible, reviewer verdict |
| Groundedness | Each instructional claim follows from cited content | Claim-level entailment/contradiction evaluation with cited evidence |
| Course relevance | The question tests an approved CO at supported depth | CO/content alignment rubric |
| Answerability | Enough information is supplied; a unique defensible MCQ answer exists | Solver/judge plus explicit check of every option |
| Distractor quality | Wrong answers are actually wrong but plausible; no second valid answer | Option-level evaluation and later response analysis |
| Cognitive alignment | Required reasoning matches the assigned Bloom category and performance descriptor | Rubric and expert audit, not an action-verb classifier alone |
| Ambiguity and language | No avoidable ambiguity, misleading wording, or irrelevant language burden | Judge and bilingual/domain review where applicable |
| Novelty and exposure | No repeated intent, near duplicate, or overexposed item | Hashes, semantic similarity, case-family and exposure tracking |
| Difficulty | Intended demand and observed success rates | Initial expert tag, later empirical item statistics; keep these separate |
| Security and privacy | Source/response instructions cannot alter evaluator rules; no leaked keys or employee details | Existing guardrails plus adversarial cases |

Correctness and groundedness are separate: a question can faithfully repeat an erroneous source, or state a true fact outside the course. Neither should pass solely because an overall average is high.

For synthetic workplace scenarios, distinguish explicitly invented scenario parameters from claims about the source. Validate scenario consistency and calculations, while grounding the method in course content. Requiring every hypothetical sample size to occur literally in a manual would reject useful application questions. This refines the existing numeric-overlap heuristic without accepting fabricated source claims.

Use an independent solving pass without showing the proposed key first, then compare the solution with the key and source. For nuanced items, a separate judge can review the discrepancy. Different calls or model families reduce some correlated errors but do not establish independence or truth. Human-approved references and executable checks are stronger anchors.

### Publication decisions

Keep a metric vector and explicit reasons. Critical failures in key correctness, source integrity, answerability, or security block publication regardless of other scores. Unresolved judge disagreement or missing evaluations routes to review. A reviewer corrects the item or records an adjudicated result; a generic “approve” action must not bypass a failed hard gate.

Use named, versioned rubrics rather than unexplained decimals. An initial rubric might grade relevance on 0-3: unrelated, topical only, CO-aligned but weakly supported, and directly aligned with adequate support. Thresholds are proposed calibration settings until reviewed against expert-labeled examples.

RAG metrics should be used for their intended targets: context precision concerns retrieved content, context recall needs reference relevant evidence, and faithfulness concerns support for generated claims. Applying a generic answer-relevance metric to a question stem does not establish course relevance or answer-key correctness. [Ragas metric catalogue](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/).

## Evaluating learner answers and producing evidence

### Grading by response type

| Response type | Authoritative grading approach | LLM role |
| --- | --- | --- |
| Single/multiple-choice | Compare stable submitted option IDs with the versioned key and explicit partial/negative-marking policy | Explain approved feedback if useful; no LLM needed to decide correctness |
| Numeric / formula | Versioned units, tolerance, reference computation, and allowed equivalent expressions | Interpret explanations only where a rubric requires it |
| Short written answer | Approved analytic rubric and reference evidence; score each criterion | Evaluate semantic equivalence and justify criterion awards |
| Case analysis / essay | Separate criteria for method choice, reasoning, assumptions, application, interpretation, and communication where relevant | Produce criterion scores and supporting response excerpts; uncertain/disputed grades require adjudication |
| Code / practical artifact | Isolated execution or deterministic checks against a versioned task, with resource/network restrictions | Review reasoning/readability only if these are explicit assessed criteria |

Do not penalize spelling, English fluency, or verbosity unless the assessment explicitly measures them. Accommodations and language variants must preserve the tested construct. A skipped item, timed-out delivery, invalidated question, and attempted-but-wrong answer need different reason codes.

### Submission lifecycle

1. Authenticate the learner and verify attempt ownership, state, delivered item membership, and permitted submission time. Reject unknown or mismatched response IDs.
2. Store the submitted response revision against the exact delivered question version, option order, rubric version, and scoring policy. Do not accept client keys, correctness flags, dimension mappings, or marks.
3. Grade objective answers server-side. Queue semantic grading with a durable job ID; display `GRADING` or `REVIEW_REQUIRED` until finalized.
4. Each rubric criterion returns earned/max marks, the matched descriptor, supporting response excerpts, missing elements, misconception hypotheses, evaluator identity/version, and review status. Treat response text as untrusted data, not evaluator instructions.
5. Resolve disagreement using a second evaluation or reviewer. Store both automated and adjudicated grades with reasons and supersession links.
6. Commit finalized grades, criterion-level evidence, and a recalculation event atomically. Retries must not produce extra evidence.
7. Recalculate affected dimension estimates and gaps, then refresh recommendations. Preserve the prior snapshot if a downstream computation fails and clearly mark it stale.

Rubric criteria map to claims and dimensions before delivery. A question tagged with three competencies must not award its entire score to all three. Use criterion-specific mappings; if a single criterion supplies evidence to several dimensions, record bounded allocation weights and its shared dependence group.

A wrong distractor may suggest a misconception, but a single selection is weak evidence of its cause. Record a hypothesis and confirm it with an independent item before making a strong diagnostic claim.

Course completion records engagement. Verified course assessment results can supply mastery evidence when their task, rubric, scoring provenance, and dimension mappings are known. Attendance alone must not raise application or performance mastery.

## A more dimensional skill-gap system

### Represent what is being measured

Use a sparse set of **competency dimensions**, initially `(sub-competency, facet)`, where the facet is knowledge, application, or demonstrated performance. Create only dimensions with defined claims and rubrics. Add context tags such as survey type or tool environment to evidence for coverage analysis; avoid creating an unmanageable Cartesian product of every tag.

For each dimension and relevant target level, retain:

- mastery evidence and an uncertainty estimate;
- observed claim coverage, independent evidence volume, recency, task diversity, and grading reliability;
- the role's approved performance threshold and effective requirement version;
- gap status, missing evidence, learning priority, assessment priority, and an explanation;
- estimator, scale, mapping, and policy versions used to produce the result.

Example: strong recall of survey terminology must not cancel weak execution of non-response weighting. A parent competency summary is useful for navigation, but mandatory weak dimensions remain visible and can prevent a “requirement met” classification.

Bloom demand, empirical question difficulty, and institutional proficiency are different variables. Five easy recall answers do not establish level-5 professional competence.

### Recommended first estimator: transparent evidence fusion with explicit uncertainty

Use a versioned, quality-weighted evidence model initially. It is more auditable than immediately fitting a complex latent-trait model to sparse, uncalibrated generated questions.

For a measurement cell `c = (dimension, assessed performance level)`, normalize criterion marks as `s_i = earned_i / max_i`, with `s_i` in `[0,1]`. Discard invalid evidence; exclude pending grades. Normalize only comparable criterion scales.

Set an evidence weight from separately recorded factors:

`w_i = source_reliability * item_quality * grading_reliability * mapping_allocation * recency_factor`

Factors are bounded in `[0,1]` and governed by policy. Reliability factors are calibrated or conservatively configured, not copied from an LLM's self-reported confidence. Course completion contributes no mastery weight. Missing or malformed factors should not become implicit full confidence.

Group dependent observations by attempt, shared case, repeated intent, and source artifact. Cap each group's total contribution to the same cell, rescaling weights within the group. Ten variants of the same question must not count as ten independent demonstrations.

A practical provisional summary is:

`alpha_c = alpha0_c + sum(w_i * s_i)`

`beta_c = beta0_c + sum(w_i * (1 - s_i))`

`mastery_c = alpha_c / (alpha_c + beta_c)`

Use a weak documented prior, for example `alpha0 = beta0 = 1`, and report the corresponding Beta interval internally as model-based uncertainty. Fractional scores and dependence-adjusted weights make this a **generalized evidence model**, not an exact psychometric posterior. Validate interval coverage on held-out learners before presenting it as calibrated confidence or using probability thresholds for consequential decisions. Test prior sensitivity.

If there is no admissible evidence, expose `UNASSESSED` and `mastery: null`, even though the internal model has a prior. An older evidence-only record can become `STALE`. Recency reduces evidence strength; it is not proof that someone has forgotten a skill. Recompute from the immutable evidence set at the requested as-of time rather than repeatedly adding the same evidence to a stored posterior.

### Sufficiency and proficiency conversion

Keep evidence sufficiency separate from mastery and from probabilistic uncertainty. Its inspectable components should include distinct claim coverage, effective independent evidence volume, required task-type coverage, freshness, and grader reliability. A weighted score may summarize these, but hard minimum coverage rules for mandatory facets cannot be averaged away.

The institution sets performance descriptors and a passing mastery threshold for each relevant level/cell using expert-reviewed reference tasks. A learner earns a provisional proficiency classification only when the required cells meet their thresholds and sufficiency rules. Do not convert raw accuracy to level by multiplying by five. Do not assume evidence transfers to other levels unless the standards explicitly permit that relationship.

Sparse evidence should prompt a targeted assessment. When dimensions disagree, retain that disagreement in the profile; do not smooth it away solely to produce a cleaner overall number.

### Gap and priority calculation

For a role requirement cell `c`, let `t_c` be the approved mastery threshold and `m_c` the estimate on the same scale. For sufficient evidence, the normalized deficit is:

`g_c = max(0, t_c - m_c)`

Do not subtract a `[0,1]` mastery estimate from an ordinal `[1,5]` role level. The role level first resolves to the governed measurement cells and thresholds. Optional display of a level gap must use two comparable, supported proficiency classifications.

Return a state before prioritizing:

| State | Meaning | Next action |
| --- | --- | --- |
| `UNASSESSED` | No valid evidence | Diagnostic assessment |
| `INSUFFICIENT_EVIDENCE` | Some evidence, inadequate breadth or reliability | Assess missing claims/facets |
| `STALE` | Evidence fails freshness policy | Focused reassessment |
| `CONFLICTING_EVIDENCE` | Material disagreement between credible sources/tasks | Confirmatory assessment or reviewer inspection |
| `SUPPORTED_GAP` | Sufficient evidence below an approved target | Targeted learning or supervised practice |
| `MEETS_REQUIREMENT` | Required cells pass mastery and sufficiency criteria | Maintain or progress according to role needs |

An uncertainty interval crossing the target is a reason for further assessment, not a precise probability of failure. Until intervals are empirically calibrated, use them as review signals alongside conservative coverage rules.

Use two priority channels:

`learning_priority_c = 100 * importance_c * urgency_c * sufficiency_c * g_c`

`assessment_priority_c = 100 * importance_c * urgency_c * evidence_need_c`

All factors are `[0,1]`; `evidence_need` combines missing coverage, staleness, uncertainty, and conflict under a versioned policy. Unknown mastery leaves `g_c` null and prevents a learning-deficit claim; it can still receive a high assessment priority. Mandatory requirements are explicit ordering/eligibility constraints, not merely a small score bonus.

These formulas are initial ranking policies, not learned probabilities. Store the components, allow role/framework-specific parameters, and validate rankings with domain reviewers. The same input snapshot, policy, and as-of time must reproduce the result.

### Later estimator options

| Model | When it becomes viable | Main limitation |
| --- | --- | --- |
| Weighted evidence model above | Current sparse evidence and heterogeneous sources | Weights, priors, and uncertainty need calibration; item difficulty is not fully modeled |
| Hierarchical item response model | Stable anchor items, connected item/learner response data, and expert standards | Generated items require calibration; parameters are not identifiable from isolated items or tiny cohorts |
| Multidimensional IRT | Enough responses per mapped dimension and a validated question-to-dimension matrix | More complex identification, calibration, and drift monitoring |
| Bayesian knowledge tracing | Repeated practice on well-defined skills with temporal interaction data | Fits learning sequences better than arbitrary mixtures of certificates, supervisor ratings, and one-off tests |

Recommended progression: establish trustworthy evidence and standards first, then compare a hierarchical item-response challenger in shadow mode. Promote only if calibration, predictive validity, and subgroup performance improve. No LLM should directly invent an official's numerical mastery level from their biography.

IRT explicitly separates person ability from item difficulty; richer forms also model discrimination. Identification of parameter scale/location is a modeling requirement, reinforcing the need for anchored calibration rather than assigning difficulty from an LLM label. [Stan's item-response model guide](https://mc-stan.org/docs/2_23/stan-users-guide/item-response-models-section.html).

## A flexible recommendation engine

Recommend the **next useful intervention**, which may be a diagnostic, short module, course, practice task, supervised assignment, or reassessment. Course recommendations should use the approved CO-to-dimension mappings.

### Candidate selection and ranking

1. Load the learner's latest valid gap snapshot, role version, preferences, available time, completed learning, and active enrolments.
2. Route unknown/conflicting evidence to assessment candidates. Route supported learning gaps to learning candidates.
3. Retrieve courses/modules with published mappings to the affected dimensions, matching target depth and context. Merge provider records through canonical course IDs.
4. Enforce hard constraints: access, language/accommodations, availability, mandatory prerequisites, required proficiency, schedule, capacity, and allowed budget. Unknown prerequisites trigger assessment or a prerequisite step.
5. Rank feasible candidates with normalized, versioned factors and return a score breakdown.
6. Build a prerequisite-ordered path that maximizes incremental coverage within the user's time constraints. Recompute remaining coverage after each selection so overlapping courses do not receive repeated full credit.
7. Store selected and rejected candidates with reasons. Render explanations from those reasons; an LLM may improve wording but cannot invent benefits or change ordering.

An initial course relevance score can be:

`rank = 0.40 * gap_coverage + 0.20 * level_fit + 0.15 * content_quality + 0.10 * role_context_fit + 0.10 * preference_fit + 0.05 * time_fit`

All components are `[0,1]`, larger is better, and weights sum to one. These are proposed defaults for review, not validated optimal values. Hard constraints apply before the formula. Mandatory/urgent intervention classes can be ordered before ranking within a class.

Define `gap_coverage` as the learning-priority-weighted coverage of currently deficient cells, using approved CO mappings and appropriate depth. Deduplicate coverage within a course. `level_fit` rewards an attainable entry level and suitable exit outcomes; a harder course is not automatically better. Missing quality/effectiveness data remains explicitly unknown and uses a conservative documented prior, not a fabricated 0.95 score.

Before outcome data exists, describe coverage as “addresses these gaps”, not “will close 80% of your gap”. Later, estimate expected gap reduction from comparable pre/post assessments with uncertainty and selection-bias analysis. Clicks, enrolments, and completion are useful behavior signals but are not evidence of skill improvement.

### Learning-path behavior

- A learner strong in knowledge but weak in application receives a practice-rich module, not another introductory recall course.
- An advanced course whose prerequisite is unverified triggers a short prerequisite diagnostic or a preparatory course.
- A course addressing several gaps appears once with all targeted COs and dimensions.
- Completed courses are normally excluded; refresher use needs a reason such as stale evidence or materially revised content.
- If no suitable course exists, report `NO_SUITABLE_INTERVENTION` with unmet constraints and consider assessment, mentoring, or new content authoring. Do not invent a catalogue entry.
- Rejected recommendations and learner constraints inform a rerank; they do not lower competency requirements silently.

Start with deterministic prerequisite ordering and greedy selection using marginal coverage under a time budget. Detect cycles and unresolvable dependencies. If real scheduling/capacity constraints outgrow that approach, introduce a constraint optimizer. The learner should see prerequisites, expected coverage, hours, reasons, and the reassessment checkpoint.

After learning, use an equivalent but different assessment form. Reusing the exact taught/previously answered items can measure memorization rather than transfer. Recalculate gaps from new evidence and retain the previous recommendation snapshot for audit.

## Evaluation programme and acceptance criteria

Maintain separate versioned datasets for each decision. Langfuse datasets/experiments can organize comparisons, while application runners execute the actual pipeline under test. [Dataset documentation](https://langfuse.com/docs/evaluation/experiments/datasets).

| Dataset | Reference labels | Primary measures |
| --- | --- | --- |
| Course mapping | Expert COs, accepted taxonomy IDs, supported depth, cited passages, valid no-match cases | Mapping precision/recall, unsupported mapping rate, CO coverage, abstention quality |
| Retrieval | CO queries and expert-relevant passages from fixed course versions | Recall@k, precision@k, ranking quality, wrong-course retrieval rate |
| Question generation | Expert solution, correctness/ambiguity labels, CO support and Bloom judgments | Correct-key rate, groundedness, answerability, per-CO relevance, publication rejection rate |
| Response grading | Double-scored responses with adjudicated criterion marks | Normalized MAE, weighted agreement, false pass/fail rates, abstention and review rate |
| Evidence and gaps | Trusted longitudinal tasks, expert judgments, known missing/stale/conflicting evidence | Calibration, threshold classification error, evidence sufficiency behavior, stability |
| Recommendations | Expert-ranked candidate sets plus observed independent post-learning assessments | NDCG@k, constraint violations, incremental gap coverage, measured learning gain |

Sample across competencies, course providers, performance levels, response types, languages, sparse/contradictory sources, and adversarial inputs. Split by course/source family and learner where relevant to avoid near-duplicate leakage. Separate development/calibration sets from a frozen test set, and report sample sizes and uncertainty for every aggregate.

Calibrate judges against adjudicated human labels. Measure agreement and systematic bias; keep judge model, rubric, prompt, and source versions fixed within an experiment. Run repeated samples where model variability matters. Do not tune prompts on the held-out set or use a judge's own labels as the sole gold standard.

Proposed initial release gates, to be ratified through the pilot:

- Every delivered question is schema-valid, approved, version-pinned, and backed by resolvable approved sources.
- Zero accepted client-supplied grades, unauthorized attempt operations, cross-course source leakage, or duplicate evidence writes in the acceptance suite.
- Zero known critical answer-key errors in the approved release set; investigate each discovered error rather than offsetting it with an average score.
- At least 95% precision on mappings accepted without correction in the expert pilot; report recall and abstentions so this cannot be met merely by refusing most mappings.
- At least 90% expert-rated question correctness and course relevance on generated candidates as an initial generation-quality target, with every served item still subject to publication gates.
- For automated rubric grading, propose normalized MAE at most 0.10 and weighted agreement at least 0.80 on adjudicated pilot responses, plus a separately approved false-pass ceiling before consequential use.
- All recommendation hard constraints pass; expert ranking must improve over the current code-match baseline. Do not claim outcome gains until independent post-learning measurements support them.
- No agreed key metric regresses by more than two percentage points without a documented decision; compare confidence intervals and cohort sizes rather than interpreting tiny changes as certain regressions.

These are target criteria, not existing performance claims. Baseline, sample size, and tolerances must be recorded before promotion.

Track operational measures alongside quality: p95 latency by stage, cost per approved question and finalized semantic grade, retry counts, evaluator errors, pending-review age, stale estimates, export backlog, and provider fallback. Configure budget/time limits and bounded retries; do not repeat identical judge calls merely because they disagree with the desired result.

## Rollout and concrete integration points

| Phase | Deliverable | Completion condition |
| --- | --- | --- |
| 1. Establish trusted inputs | Formalize CO/dimension/level definitions; reconcile schema; pin attempt items; eliminate client-authoritative grading in the future implementation | Objective submission produces reproducible server-owned evidence with no silent fallback |
| 2. Instrument and baseline | Add Langfuse tracing at the shared LLM client and workflow boundaries; export existing checks; label pilot datasets | One question can be traced from exact source input through evaluation and review; baseline measured |
| 3. Course intelligence | Canonical course versions, optional/manual CO flow, automatic CO extraction and reviewed mappings | New course works with supplied, partial, or absent COs; unsupported content abstains |
| 4. Assessment quality and grading | Semantic item evaluations, reference solutions, rubrics, constructed-response grading, adjudication | Required evaluation gates pass and criterion evidence can be replayed |
| 5. Dimensional gaps and learning paths | Shared estimator/ranker, sufficiency states, prerequisites, explanation records | Shadow results reviewed; all learner views read the same snapshots |
| 6. Calibration and improvement | Item statistics, longitudinal validation, recommendation outcome analysis, possible IRT challenger | Measured improvement supports promotion beyond the transparent baseline |

Implementation responsibilities: extend `ml/pipelines/llm_client.py` for call instrumentation; extend generation and mapping modules; replace the contract of the two basic Python engines; route server assessment/pathway/automation controllers through shared domain services; extend existing review views later. Endpoint contracts need immutable IDs, versions, typed statuses, metric details, idempotency keys, and explicit partial-failure states rather than only `score` and `gap_delta`.

Use a durable PostgreSQL job/outbox mechanism for ingestion, semantic evaluation, recalculation, and exports. This addresses the concrete risk of committing a response but losing the downstream update. Add a dedicated queue system only if throughput or scheduling needs justify it. Serialize updates per learner snapshot or use optimistic concurrency so an older run cannot overwrite a newer estimate.

Feature-flag the new reads, run estimators/rankers in shadow mode, compare on the same snapshots, and backfill cautiously. The [schema companion](COMPETENCY_INTELLIGENCE_SCHEMA.md) specifies the required records, invariants, migration sequence, and example lineage.

## Worked example

A course on survey weighting is added with a manual. The author leaves COs empty. The pipeline proposes “CO2: calculate and justify non-response adjustment weights”, links it to the internal non-response sub-competency and application dimension, and cites the relevant section. A reviewer approves the course mapping.

A generated case question asks the learner to calculate weights and justify the adjustment assumptions. Its answer key is checked against a reference calculation. Its method is checked against the manual. The scenario values are labeled hypothetical. The question and rubric are approved as immutable versions.

The learner earns 2/2 on method identification, 1/4 on calculation, and 1/4 on assumptions. These three criteria produce separate attributed evidence. They do not become a single 40% score applied to all of “Sampling design”.

If independent prior evidence supports the same pattern, the profile can show knowledge meeting its target and an application gap. If this is the learner's only observation, show provisional findings and request another independent task before asserting a broad gap.

For an illustrative sufficient-evidence cell, suppose the governed target is 0.75 and the estimate is 0.45. The deficit on that same scale is 0.30. With importance 1.0, urgency 0.8, and sufficiency 0.9, the initial learning priority is `100 * 1.0 * 0.8 * 0.9 * 0.30 = 21.6`. This is a ranking value, not a 21.6% failure probability.

The recommendation engine selects a practical weighting module with an approved mapping to the deficient calculation/assumptions claims, verifies prerequisites and available time, and explains those links. After completion, a different case measures transfer. That new evidence determines whether the gap reduced. Langfuse links the relevant processing runs; PostgreSQL retains the authoritative course, assessment, grade, evidence, and recommendation history.
