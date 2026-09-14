# Proposed schema for competency intelligence

Status: design only. No database schema, migration, endpoint, or application implementation is changed by this document. Read with [the architecture and pipeline proposal](COMPETENCY_INTELLIGENCE_DESIGN.md).

## Schema strategy

Keep PostgreSQL as the authority for courses, assessment decisions, evidence, and learning recommendations. Langfuse identifiers are optional external references, never foreign keys into Langfuse's database and never the only copy of a decision-driving evaluation.

Extend the modular schema exported by [server/src/db/schema/index.js](../server/src/db/schema/index.js). Before implementing migrations, inspect the deployed database alongside [autoInit.js](../server/src/db/autoInit.js), the modular schema, and migration history. Some tables already exist through bootstrap SQL rather than Drizzle definitions. Do not create a second `assessment_attempts`, source-provenance system, or question-version system.

Use explicit foreign keys for relationships used in integrity checks and ranking. Reserve JSONB for variable payloads, policy parameters, frozen explanatory snapshots, and evaluator details. Typed records should carry the dimensions, outcomes, versions, scores, and statuses that must be queried or constrained.

Unless specified otherwise, new entities use UUID primary keys and timestamp-with-time-zone fields. Historical published versions are immutable. Status transitions and pointers to the current version may change through controlled application transactions. Archive referenced entities instead of cascading away assessment history.

## Existing entities to retain or extend

| Existing entity | Proposed change |
| --- | --- |
| `competencies`, `sub_competencies` | Retain stable identities; add governed revision references and lifecycle state |
| `learning_objectives`, `competency_claims` | Retain as internal reusable standards; introduce explicit dimension/objective relationships rather than assigning every objective under a parent to every sub-competency |
| `competency_requirements` | Retain role ownership, importance, urgency, effective dates, and framework version; add dimension-level target rows |
| `learning_materials` | Link to a canonical course/module identity; migrate `mapped_objectives` and single-competency hints into reviewed normalized mappings |
| `igot_courses`, `nssta_programmes` | Retain provider-specific metadata and integration IDs; connect to canonical courses |
| `igot_competency_map`, `nssta_competency_map` | Import existing hints with provenance and unverified status; do not treat legacy relevance scores as calibrated CO coverage |
| `source_documents`, `source_document_versions`, `source_chunks` | Reuse; add academic approval separate from processing status, uniqueness/checksum guarantees, and explicit course-version membership |
| `questions`, `question_versions`, `question_intents`, `question_source_provenance` | Reuse; pin rubrics, outcome mappings, and dimension attribution to each question version |
| `assessment_question_items` | Add/validate its missing explicit foreign key for `question_version_id`; verify that the version belongs to the listed question |
| `assessment_attempts` | Already created in bootstrap SQL; formalize in the authoritative schema, then add immutable delivered-item and response records |
| `question_validation_results`, `ai_guardrail_results` | Retain deterministic/security results; add links to versioned evaluator definitions/runs where appropriate |
| `ai_runs` | Extend with operation/parent IDs, telemetry links, usage, error codes, and batch output relationships; one LLM invocation can produce several question versions |
| `question_review_queue` | Reconcile bootstrap/review implementation; pin reviews to the evaluated question version and preserve reviewer decisions |
| `evidence` | Retain the observation identity; add typed provenance, validity, correction lineage, and child dimension contributions |
| `competency_estimates`, `sub_competency_estimates`, `skill_gaps` | Retain as current projections for compatibility; derive from immutable dimension/snapshot records |
| `recommendations` | Add canonical intervention IDs, run/version references, score breakdown, multi-gap targets, and history; remove artificial default scores in the future migration |

The old [schema/assessments.js](../server/src/db/schema/assessments.js) is separate from the modular assessment schema. Check import usage and reconcile definitions during implementation rather than applying changes to both indiscriminately. Generated migrations must be produced through the project's migration workflow, not edited as design notes.

## Courses, outcomes, and taxonomy

| Proposed entity | Key fields / relationships | Integrity and purpose |
| --- | --- | --- |
| `courses` | `id`, stable internal code, lifecycle status, current published version pointer | Canonical identity shared by local, iGOT, and NSSTA representations |
| `course_external_refs` | `course_id`, provider, external identifier, link to relevant existing provider row where applicable | Unique `(provider, external_identifier)`; titles are not identifiers |
| `course_versions` | `course_id`, revision, title, description, language, duration, delivery mode, content fingerprint, review status, published/reviewer fields | Unique `(course_id, revision)`; published metadata immutable; current availability belongs in an offering record |
| `course_offerings` | `course_id`, available `course_version_id`, provider/batch ID, dates, mode, capacity, access rules, cost/currency, sync time | Represents availability separately from instructional content; recommendations retain the offering facts observed at ranking time |
| `course_modules` | `course_version_id`, module code, title, order, duration | Version-scoped modules support targeted recommendations; unique code/order within a course version |
| `course_version_sources` | `course_version_id`, `source_document_version_id`, instructional role | Unique pair; source version must satisfy course publication policy |
| `source_chunk_embeddings` | `source_chunk_id`, embedding model/revision, preprocessing version, vector, content hash, indexed time | Unique chunk/model/preprocessing tuple; vector dimensions and indexes match the pinned model; rebuild separately on model changes |
| `course_outcomes` | `course_version_id`, CO code, statement, optional module, origin (`MANUAL`, `IMPORTED`, `LLM`), origin AI run | Unique `(course_version_id, co_code)`; new published wording requires a new course version |
| `course_mapping_revisions` | `course_version_id`, revision, framework version, status, reviewer, rationale, effective date | Mappings may change without changing source content; immutable when approved |
| `course_outcome_mappings` | `mapping_revision_id`, `course_outcome_id`, `learning_objective_revision_id`, `dimension_id`, target performance descriptor, coverage role, coverage strength, assessment method, confidence basis | Many-to-many mappings; each outcome/module must belong to the mapping revision's course version; prevent duplicate target tuples |
| `course_mapping_evidence` | `outcome_mapping_id`, `source_chunk_id`, excerpt range, support result | Citation must belong to a source version bound to that course version |
| `course_prerequisites` | `course_version_id`, required course or dimension/level target, requirement group, AND/OR semantics, mandatory flag | Exactly one target kind per row; groups specify alternatives; cycles detected before publication |
| `framework_versions` | framework identifier, version, state, approval and effective dates | Governs the institution's taxonomy/standards; models cannot publish revisions |
| `competency_revisions`, `sub_competency_revisions`, `learning_objective_revisions`, `claim_revisions` | Stable existing identity, `framework_version_id`, text, parent revision reference, lifecycle state | Unique identity/version pairs; capture historical hierarchy and wording instead of mutating old meanings |
| `competency_dimensions` | `sub_competency_revision_id`, facet, dimension code, description, state | Unique `(sub_competency_revision_id, facet)` initially; new measurement semantics require a new dimension identity |
| `dimension_objectives`, `dimension_claims` | `dimension_id` and corresponding objective/claim revision IDs | Explicit alignment, including parent consistency checks |
| `performance_descriptors` | `dimension_id`, ordinal level, observable descriptor, reference task requirements, standard-setting version | Unique dimension/level/standard version; supports institutional proficiency without equating it with Bloom level |
| `measurement_cells` | `dimension_id`, `performance_descriptor_id`, criterion scale version | Stable key for evidence, estimates, requirements, and course coverage at a defined demand level |
| `requirement_dimension_targets` | `competency_requirement_id`, `measurement_cell_id`, required mastery threshold, minimum sufficiency/coverage policy, dimension importance, mandatory flag | Unique requirement/cell; threshold in `[0,1]`; requirement and cell must belong to compatible framework versions |

Some existing competency definitions may have no useful sub-competencies. Introduce one explicit general sub-competency through taxonomy review if required; do not make ambiguous nullable dimension keys. Avoid inferring a fine-grained dimension merely from a competency code.

Keep learned mapping confidence distinct from retrieval similarity and human approval. For example, fields may store `retrieval_similarity`, `judge_score`, `confidence_method`, and `review_status`; no single decimal stands for all four concepts.

Framework changes require an explicit reviewed crosswalk between old and new dimensions if evidence is to transfer. Preserve the original evidence target and record the transfer policy/allocation; otherwise leave the new dimension unassessed. A taxonomy embedding snapshot must carry the framework version and content hash, so ML cannot silently search stale definitions.

## Questions, rubrics, attempts, and grades

| Proposed entity or extension | Key fields / relationships | Integrity and purpose |
| --- | --- | --- |
| `rubric_versions` | stable rubric identity, revision, response type, scoring policy version, total marks, approval status | Published rubrics are immutable and unique by identity/revision |
| `rubric_criteria` | `rubric_version_id`, criterion code, descriptors, max marks, scoring method, optional deterministic-check specification | Unique code within rubric; positive max marks; criterion weights/marks must reconcile with total |
| `rubric_criterion_targets` | `rubric_criterion_id`, `measurement_cell_id`, claim revision, attribution weight | Weight in `[0,1]`; all target allocations for one criterion sum to at most one under the selected attribution policy |
| `question_versions` extension | `rubric_version_id`, scoring policy, stable option IDs, response type, intended difficulty, task context, reference answer/check artifact, content fingerprint | Keep solution/key separate from learner-facing payloads; do not infer an answer key when it is missing |
| `question_outcome_links` | `question_version_id`, `course_outcome_mapping_id`, tested claim | Pins course version, mapping revision, and outcome through explicit references |
| `assessment_attempt_items` | `attempt_id`, `assessment_question_item_id` if available, `question_version_id`, `rubric_version_id`, position, delivered option order, delivery timestamp | Freeze at attempt creation; unique `(attempt_id, position)` and permitted item identity; version/rubric consistency required |
| `assessment_responses` | `attempt_item_id`, response revision, answer payload, submitted time, state, content hash | Immutable submitted revision; one accepted revision selected by the attempt's submission transaction; answer payload has a strict type-specific schema |
| `response_evaluations` | `response_id`, revision, rubric/policy version, evaluator run, grade status, total marks, supersedes ID, finalized time | Separate automatic, provisional, and adjudicated evaluations; exactly one authoritative finalized evaluation selected per response |
| `response_criterion_scores` | `response_evaluation_id`, `rubric_criterion_id`, earned/max marks, matched descriptor, response excerpt references, feedback, uncertainty reason | Unique evaluation/criterion; earned marks within the rubric's declared score range; max marks must match the pinned rubric |
| `grading_reviews` | `response_evaluation_id`, reviewer, decision, reason, adjudicated evaluation ID, timestamp | Preserve reviewer identity and correction reasons; do not overwrite the original automated result |
| `misconception_observations` | criterion score or response reference, governed misconception code, supporting excerpt/option, hypothesis status, confirmation reference | Optional; does not become a confirmed deficit from one weak signal |

For MCQs, a single rubric criterion can define the deterministic key rule and target allocation. For free text, use several analytic criteria. This gives both formats the same downstream evidence contract without introducing an unnecessary LLM call for objective grading.

Before submission, APIs return stems, allowed response fields, and option IDs/text only. Answer keys, `isCorrect` flags, hidden checks, and reference solutions remain server-owned. Post-submission feedback visibility follows the assessment's disclosure policy.

Attempt finalization must be an ownership-scoped transaction. Lock or compare the attempt's current version/state, select the accepted response revisions, finalize objective grades, and schedule semantic grading. Unknown attempts, questions without trusted keys, and cross-learner submissions fail explicitly; no default diagnostic or first-option fallback may create evidence.

## Evidence, estimates, and gaps

| Proposed entity or extension | Key fields / relationships | Integrity and purpose |
| --- | --- | --- |
| `evidence` extension | source kind, observed time, received time, validity state, supersedes/revokes ID, reliability basis, policy version | Append-only observation identity with explicit correction events; provenance text remains descriptive rather than the only link |
| `assessment_evidence_links` | `evidence_id`, `response_criterion_score_id` | Unique criterion-score link prevents duplicate evidence on retries |
| `external_evidence_links` | `evidence_id`, provider, external event ID, verified assessment/certification artifact or existing enrolment reference | Unique provider/event/type; distinguish engagement completion from assessed mastery |
| `evidence_dimension_contributions` | `evidence_id`, `measurement_cell_id`, normalized score, allocation, quality/reliability components, dependence group, target mapping reference | Unique evidence/cell/attribution revision; typed scores/weights bounded in `[0,1]` |
| `estimation_runs` | learner, input snapshot hash, as-of time, framework/estimator/policy versions, state, parent event, previous run | Unique replay identity; immutable succeeded run; store the complete input snapshot manifest |
| `estimate_input_evidence` | `estimation_run_id`, evidence contribution ID, included/excluded state, effective weight, exclusion reason | Reconstruct which evidence contributed and why; avoids relying only on a free-form JSON snapshot |
| `dimension_estimates` | `estimation_run_id`, `measurement_cell_id`, nullable mastery, model parameters, interval bounds/method, sufficiency components, status, evidence count, newest evidence time | Unique run/cell; no evidence yields null public mastery; interval and calibration status explicit |
| `gap_runs` | `estimation_run_id`, requirement-set snapshot/version, policy version, status, as-of time | A role/requirement change can trigger gap recomputation without pretending evidence changed |
| `dimension_gaps` | `gap_run_id`, target requirement ID, dimension estimate ID, comparable target/estimate, nullable deficit, state, learning/assessment priorities, reasons | Unique run/requirement target; no numeric confirmed deficit for unknown mastery |
| `learner_intelligence_current` | learner ID, current estimation run, gap run, recommendation run, last event sequence, staleness state | Atomic current pointers prevent mixed or out-of-order snapshots |

Keep evidence validity separate from processing state. A finalized grade can later be invalidated by an erroneous answer key or an upheld appeal. Mark the evidence superseded/revoked, create replacement evidence when appropriate, and recalculate affected snapshots. Do not delete the old grade.

The current `competency_estimates` and `skill_gaps` tables have uniqueness constraints suitable for current projections, not historical runs. Retain them as projections during migration, and add nullable/state-aware representations where their current non-null defaults incorrectly imply measured competence. Historical references must point to run-specific records rather than a mutable projection row alone.

Use timestamp-with-time-zone and explicit as-of timestamps for recency. Reject implausible future observation timestamps or flag them for verification. Replaying an old run uses its original as-of time, not the current clock.

## Recommendations and the learning loop

| Proposed entity or extension | Key fields / relationships | Integrity and purpose |
| --- | --- | --- |
| `interventions` | type, optional course/module/assessment references, title, lifecycle state | Exactly one appropriate target for supported types; practical/mentoring tasks may have their own governed definition |
| `recommendation_runs` | learner, `gap_run_id`, catalogue/mapping snapshot hash, preference/constraint snapshot, ranker/policy versions, state, created time | Reproducible run including candidate availability observed at ranking time |
| `recommendations` extension | run ID, intervention ID, course/offering version if relevant, ordinal rank, score, component breakdown, eligibility decision, reason codes, expiry | One candidate identity per run; nullable/explicitly uncalibrated score semantics; keep status history separate from rank generation |
| `recommendation_targets` | recommendation ID, dimension-gap ID or requirement target, course outcome mapping ID where applicable, coverage estimate | Several gaps per recommendation; deduplicate cell coverage |
| `recommendation_candidate_decisions` | run, candidate ID, eligible flag, exclusion reasons, score components | Retain sufficient candidate audit data to explain why a plausible alternative was excluded |
| `learning_paths`, `learning_path_steps` | learner/run, ordered interventions, prerequisite step links, intended coverage, estimated hours, state | No cyclic dependencies; selected path fits the recorded constraint budget |
| `recommendation_events` | recommendation/path step, event type, user/provider event ID, timestamp, reason | Deduplicate impressions/enrolments/completions/rejections; feedback cannot directly alter grades |
| `learning_outcome_checks` | intervention/enrolment, pre-learning estimate run, post-learning estimate run, assessment-form comparability, elapsed time, gain estimate/method | Distinguish observed change from a causal effect claim |

Provider enrolment tables remain integration records; do not create another unrelated enrolment authority. Link them to course/intervention identities. A refreshed recommendation may reference an existing active enrolment but must not enrol a learner automatically.

An intervention can cover several dimensions and a prerequisite can be an intervention itself. Store these links explicitly so the ranker can account for shared prerequisite cost and incremental coverage instead of recommending the same course multiple times.

## Evaluation, jobs, and observability

| Proposed entity or extension | Key fields / relationships | Integrity and purpose |
| --- | --- | --- |
| `evaluator_versions` | name, version, metric definitions, method, rubric/prompt/model/check version, required input schema | Unique evaluator/version; published definitions immutable |
| `evaluation_runs` | evaluator version, application AI run if any, input/output fingerprints, state, attempts, start/end time, error code | Tracks deterministic, model, and human evaluation execution; error is not a passing score |
| `evaluation_targets` | evaluation run plus explicit nullable FK slots for question version, mapping revision, response evaluation, retrieval run, or recommendation run | Exactly one target populated; avoids unconstrained `entity_type + entity_id` integrity |
| `evaluation_scores` | evaluation run, metric name/version, typed value, units/range, rationale, evidence references, judge disagreement | Unique run/metric; one score type per row; keep raw and adjudicated results distinct |
| `retrieval_runs`, `retrieval_run_chunks` | query/context snapshot, course version, retrieval/index versions, ordered chunk IDs, scores, supplied-to-model flag | Exact retrieval lineage; provides a concrete FK target for retrieval evaluation |
| `ai_runs` extension | workflow operation ID, parent run, trace ID, observation ID, token usage, cost currency/value, error category | Preserve one row per actual invocation; batch outputs use typed join records instead of overloading one question-version FK |
| `ai_run_question_outputs`, `ai_run_mapping_outputs` | AI run ID, concrete version/mapping revision ID | One invocation can produce many outputs; one output can have generation/revision lineage |
| `policy_versions` | policy name/version, validated parameters, approval state, effective dates, configuration hash | Initial finite policy set for mapping, publication, grading, estimation, and ranking; no general-purpose policy language needed |
| `pipeline_jobs` | operation, typed target reference, idempotency key, payload version, state, retry count, next attempt, lease expiry, error | Recoverable processing within the existing application; worker leases prevent abandoned jobs from blocking indefinitely |
| `outbox_events` | event ID/type, subject reference, sequence, payload version, created time, published time, retry status | Write in the same transaction as domain changes; delivery can be retried safely |
| `telemetry_exports` | application result ID, trace/observation/score IDs, state, retry count, last error | External Langfuse state can be repaired without rerunning authoritative grading |

Use Langfuse's datasets and experiment records for experiment management. Keep versioned dataset manifests or hashes and adjudicated reference labels in controlled project storage so evaluation history is portable. Do not duplicate its entire trace/experiment schema in the application.

For input manifests and references, keep necessary content snapshots or content-addressed artifacts under the domain retention policy. A hash verifies identity but cannot reconstruct content if every copy of the content has been deleted.

## Required invariants and indexes

1. **Version consistency:** a delivered question belongs to its declared question identity, course outcome mapping, rubric, and approved source versions. Composite keys/FKs enforce same-parent relationships where possible; transaction-time validation enforces cross-table publication rules.
2. **Scoring authority:** only finalized server-generated/adjudicated grades create assessment evidence. Learner-provided IDs resolve only within the learner's delivered attempt items.
3. **Score ranges:** max marks are positive; normalized values and bounded factors are in `[0,1]`; lower uncertainty bound does not exceed the upper bound. Policies explicitly define any allowed negative raw marking before normalization.
4. **Attribution limits:** criterion allocation weights reconcile under the selected policy. Enforce cross-row sums transactionally or with a database constraint trigger; a row CHECK alone cannot enforce a sum across records.
5. **Idempotency:** unique submission revision, criterion-score evidence link, external event, job key, and recommendation candidate/run identity. `ON CONFLICT DO NOTHING` without an appropriate unique constraint does not establish idempotency.
6. **Historical integrity:** no cascade deletion of source versions, rubric versions, or question versions that are needed to explain delivered assessments. Archive through lifecycle fields.
7. **Current snapshot ordering:** only a completed run built from the latest accepted input sequence may replace a current pointer. Failed/outdated runs remain inspectable without overriding newer results.
8. **Framework validity:** one applicable requirement version per role/context/cell at an as-of time, or an explicit precedence rule. Prevent accidental overlapping effective windows. Resolve multiple roles deliberately, preserving the controlling requirement identity.
9. **Publication:** an approved revision is immutable; its status can become retired/revoked without rewriting its content. A new content or mapping revision must pass its own gates.
10. **Authorization:** learner-scoped reads/writes and reviewer permissions apply to attempts, evidence, estimates, and traces. If multi-institution tenancy is introduced, tenant membership must also propagate into source and mapping joins.

Index learner/current-run access; evidence by learner, validity, and observed time; contributions by measurement cell; mappings by dimension and published revision; jobs by state/next-attempt time; and evaluation results by target and evaluator version. Add unique provider IDs, revision keys, and response/evidence keys before relying on upserts. Selective indexes for pending review/jobs and published mappings are appropriate after measuring query patterns.

Keep answer payloads and grade excerpts under stricter access/retention rules than aggregate analytics. Langfuse exports use pseudonymous references. Retention/deletion procedures must account for domain artifacts, exports, and backups without leaving dangling claims of reproducibility.

## Migration and rollout sequence

| Stage | Work to perform when implementation is authorized | Verification before proceeding |
| --- | --- | --- |
| Inventory | Compare real deployed tables/constraints with Drizzle exports, bootstrap SQL, migrations, and route usage | Enumerate discrepancies and baseline row counts; back up data |
| Add | Introduce new tables and nullable compatibility references; formalize bootstrap-only tables in the authoritative schema | Existing reads/writes still function; generated migration reviewed |
| Canonicalize courses | Resolve provider IDs into canonical courses; create legacy version snapshots and source associations where known | Duplicate provider IDs reconciled; uncertain title-only matches remain unresolved |
| Backfill mappings | Import single-competency/JSON/provider mappings as `LEGACY_UNVERIFIED` with origin and scores preserved | No legacy hint silently becomes an approved CO or dimension mapping |
| Backfill assessment lineage | Recover delivered versions, rubrics, and response keys where the historical data supports it | Unknown history is marked `LEGACY_UNVERIFIED`; current question content is not falsely asserted to be what the learner saw |
| Establish trusted grading writes | Route new submissions to version-pinned, server-owned grading and typed evidence links | Duplicate submits, retries, invalid keys, and interrupted jobs behave correctly |
| Shadow estimates/ranking | Compute new run snapshots without replacing current user-facing projections | Compare with trusted evidence and reviewer expectations; investigate differences |
| Switch reads | Enable current-run pointers and use shared projections across all gap/pathway consumers | Same learner receives consistent estimates and recommendation lineage across views |
| Enforce | Validate FKs, uniqueness, ranges, effective windows, and non-null fields once backfill allows | Invalid legacy rows quarantined and explicitly excluded |
| Retire | Remove obsolete calculation routes and redundant legacy write paths through planned migrations | Usage confirms no dependent readers; historical data remains available |

Do not force existing aggregate evidence into invented criterion-level detail. Preserve coarse evidence with its known competency and uncertainty; request new assessments to fill missing dimensions. Any legacy evidence admitted by policy must be labeled and bounded in influence.

Rollback switches reads to the previous valid projections and pauses new-model promotion. Preserve newly captured responses, jobs, grades, and version history; rollback must not erase evidence or restore client-authoritative grading. Keep compatibility projections updated during the transition until rollback is no longer required.

## Example lineage to support

| Step | Illustrative record chain |
| --- | --- |
| Course source | Course C1 -> version C1-v3 -> source manual M1-v2 -> chunk M1-v2-p18 |
| Outcome mapping | C1-v3 CO2 -> mapping revision R4 -> internal objective O7 revision F2 -> application dimension D9 -> measurement cell D9-L3 |
| Question | Q42 version 2 -> outcome mapping R4/CO2/D9 -> source chunk M1-v2-p18 -> rubric RB8 version 1 |
| Evaluation and approval | Q42-v2 -> evaluation run EV13 -> correctness/relevance scores -> version-specific reviewer approval |
| Delivery and grade | Learner U5 -> attempt A17 -> delivered item I3 pinned to Q42-v2/RB8-v1 -> response revision 1 -> finalized grade G6 -> criterion score CS2 |
| Evidence | CS2 -> evidence E55 -> contribution to D9-L3, with provenance, quality factors, and shared-case dependence group |
| Estimate and gap | E55 plus independent valid evidence -> estimation run ER20 -> dimension estimate DE9 -> role target RT4 -> gap run GR12 |
| Recommendation | GR12 -> recommendation run RR6 -> practical module PM2 -> approved CO mapping covering D9-L3 -> reassessment checkpoint |
| Observation | Each processing run links to its own trace/observation; evaluation scores mirror to Langfuse while the chain remains resolvable in PostgreSQL |

If Q42-v2's key is later corrected, the system can find CS2/E55, create a regrade/revocation record, rebuild the affected estimate/gap/recommendation runs, and explain the change to the learner. This is the reason for retaining explicit version and evidence links.
