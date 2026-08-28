# PS 26101 — Modular Product Engineering Plan

> **Product identity:** Evidence-Driven Competency Intelligence for Government Capacity Building
>
> **Primary objective:** Build a competency-intelligence system that determines what competencies an official's role requires, establishes current competency from auditable evidence, identifies explainable gaps, prescribes targeted learning interventions, generates and validates competency-aligned assessments, and continuously updates competency from new evidence.
>
> **Engineering philosophy:** Build feature modules, NOT generic "frontend/backend/ML" workstreams. Every module must be independently testable through the real UI and must integrate with the shared domain model.
>
> **Core principle:** `Course completion ≠ competency.` Learning must produce evidence; evidence must support competency estimates; competency estimates must have confidence and provenance.
>
> **Reference architecture:** The original proposal establishes the closed loop `Official Profile → Competency Assessment → Skill Gap → Personalized Learning → Intelligent Assessment → Competency Update → New Recommendations`, and explicitly rejects a simple chatbot/course recommender/MCQ generator. This plan retains that foundation and makes evidence, confidence, provenance, assessment intent, scenario assessment, and explainability first-class capabilities.

---

> ### 🔴 VERSION 2 ITERATION IN PROGRESS
>
> See **`docs/PLAN_V2_ITERATION.md`** for the full V2 plan. Key additions:
> - **FRAC Framework** (Roles → Activities → Competencies) - the CBC/Mission Karmayogi standard the PS demands
> - **Full MoSPI Competency Seed** — all 4 domains: Statistical, Technical, Digital Governance, Behavioural
> - **Simplified to 2 roles**: ADMIN (training coordinator) + EMPLOYEE (official/learner)
> - **iGOT Karmayogi mock API** with exact Sunbird request/response shapes (switchable to real API)
> - **NSSTA TPAC programme catalogue** as second recommendation source
> - **Automation-first**: auto-trigger gap calc, auto-recommend, auto-generate blueprints, iGOT daily sync
> - **AI Virtual Assistant** chat widget for employee support
> - **Assessment Player** with instant feedback, timer, interruption recovery
> - **Admin Review Queue** for AI-generated questions
> - **Predictive Analytics** for org-wide skill gap forecasting
> - **Hindi + English multilingual** UI

---



# 0. STACK & ENGINEERING DIRECTION

## 0.1 Recommended stack

**Use a modular PERN core with TypeScript domain services and separate Python AI workers: PostgreSQL + Express/Node.js + React, Redis-backed jobs, and object storage.**

The MVP starts as a modular monolith for authoritative domain operations. AI-heavy processing is asynchronous and isolated from request handling. Extract services only when scale, ownership, or security boundaries justify it.

### Why PostgreSQL over MongoDB

This product is highly relational and audit-heavy:

- Official ↔ Role
- Role ↔ Competency
- Competency ↔ Sub-competency
- Sub-competency ↔ Learning Objective
- Course ↔ Learning Objective
- Question ↔ Assessment Intent
- Evidence ↔ Competency
- Evidence ↔ Assessment Attempt
- Recommendation ↔ Gap
- Competency Estimate ↔ Evidence
- Human Review ↔ Competency Estimate
- Audit Log ↔ Every consequential action

PostgreSQL gives us:

- strong relational integrity
- transactions
- historical/audit records
- complex analytics
- JSONB for flexible AI metadata
- full-text search where useful
- `pgvector` for embeddings if desired
- easier enforcement of hard constraints

**Do not make the system document-centric. Make it domain-centric.** Uploaded files belong in S3-compatible object storage (MinIO locally); PostgreSQL stores metadata, checksums, versions, provenance, and processing state. Redis/queues handle background work and backpressure.

## 0.2 Updated technical architecture decisions

The following decisions supersede simpler alternatives elsewhere in this plan:

- Model the requirement chain as `Position → Role → Activity → Competency Requirement`, not only `Role → Competency`.
- Keep behavioural, functional, and domain competency types with explicit proficiency indicators and versioned frameworks.
- Separate internal latent mastery/ability from the reported semantic proficiency level. Do not present a raw continuous value such as `3.2/5` as the official's authoritative level.
- Maintain `LearningPriority` and `AssessmentPriority` independently. Low ability with strong evidence suggests learning; weak evidence suggests targeted assessment first.
- Replace unexplained confidence percentages with an Evidence Sufficiency Index based on coverage, volume, diversity, recency, consistency, and assessment quality. A weighted geometric mean prevents one strong dimension from hiding a critical weakness.
- Treat competency state as a projection derived from append-only evidence. Persist estimator version, policy version, evidence snapshot, and calculation time.
- Use a transactional outbox for asynchronous publication of evidence, audit, and learning events; full event sourcing is not required for the MVP.
- Define provider-neutral interfaces for learning resources, LLM generation, embeddings, translation, and validation so cloud and controlled/local implementations can be exchanged.
- Use PostgreSQL edge tables and recursive queries for prerequisites and competency relationships initially. A graph database remains optional.
- Keep assessment item and result structures compatible with future QTI export, and record learning activity using an xAPI-inspired event shape.

---

# 1. PRODUCT BOUNDARY

## 1.1 What this product IS

A competency intelligence layer for government capacity building that can:

1. Understand role competency requirements.
2. Model competencies, sub-competencies and learning objectives.
3. Establish baseline competency through diagnostic evidence.
4. Calculate competency estimates with confidence.
5. Explain why a competency gap exists.
6. Select targeted learning interventions.
7. Ingest learning material and map it to learning objectives/competencies.
8. Generate assessment blueprints.
9. Generate grounded questions.
10. Detect invalid, unsupported, ambiguous and repetitive questions.
11. Compare question assessment intent, not merely wording.
12. Prefer application/scenario-based assessment where appropriate.
13. Collect assessment evidence.
14. Update competency from evidence.
15. Maintain evidence provenance and competency history.
16. Explain recommendations and competency changes.
17. Allow authorized human review/override.
18. Provide individual and organizational analytics.
19. Remain conceptually interoperable with iGOT/NSSTA rather than pretending to replace them.

## 1.2 What this product IS NOT

Do not turn the product into:

- a generic LMS
- a generic AI chatbot
- a generic PDF-to-MCQ generator
- a course marketplace
- an opaque ML recommender
- an AI system that invents competencies
- a certificate tracker that equates completion with competency
- a "use AI everywhere" demo
- a replacement for iGOT

## 1.3 Central product question

For any official and competency:

> **What is required?**
>
> **What evidence do we have?**
>
> **What does that evidence imply about current capability?**
>
> **How confident are we?**
>
> **What is missing?**
>
> **What intervention should close the gap?**
>
> **Did the intervention produce new evidence of competency?**

---

# 2. GLOBAL DOMAIN MODEL

All modules must use one shared conceptual model.

```text
Official
  ↓
Position
        ↓
Role
  ↓
Activity
        ↓
Competency Requirement
  ↓
Competency
  ↓
Sub-competency
  ↓
Learning Objective
  ↓
Learning Material / Intervention
  ↓
Assessment Blueprint
  ↓
Question / Scenario / Task
  ↓
Assessment Attempt
  ↓
Evidence
  ↓
Competency Estimate
  ↓
Confidence + Provenance
  ↓
Skill Gap
  ↓
Recommendation
  ↓
New Intervention
```

## 2.1 Core entities

At minimum:

```text
Official
Department
Role
Competency
SubCompetency
CompetencyLevel
CompetencyRequirement
LearningObjective

LearningMaterial
Course
CourseModule
Intervention
Prerequisite
LearningPath

Assessment
AssessmentBlueprint
Question
QuestionIntent
QuestionVersion
QuestionAttempt
AssessmentResult

Evidence
EvidenceSource
EvidenceType
CompetencyEstimate
CompetencyHistory

SkillGap
Recommendation
RecommendationReason

HumanReview
AuditLog
Notification
```

## 2.2 Immutable vs mutable records

Treat these as historically important:

- AssessmentAttempt
- Evidence
- CompetencyHistory
- RecommendationHistory
- HumanReview
- AuditLog
- QuestionVersion

Do not silently overwrite historical values.

A competency changing from 2.4 to 3.2 must produce a history entry, not replace the old number.

---

# 3. GLOBAL SYSTEM RULES

## Rule 1 — No unsupported competency creation

LLMs may suggest mappings but must not silently create authoritative competency definitions.

## Rule 2 — No unsupported question generation

If source evidence is insufficient, the assessment generator must refuse/reject.

## Rule 3 — No competency update solely from course completion

Completion can create learning evidence, but cannot by itself imply competency acquisition unless the configured policy explicitly allows a defined weight.

## Rule 4 — Every competency estimate must have provenance

The system must be able to answer:

> "Why is this official currently at Level 3.2?"

## Rule 5 — Every recommendation must be explainable

The system must be able to answer:

> "Why was this intervention recommended?"

## Rule 6 — AI suggestions are not authoritative state

AI can propose:

- mappings
- questions
- explanations
- recommendations
- classifications

Authoritative records require deterministic validation and/or authorized human confirmation according to the feature.

## Rule 7 — Hard constraints override ranking

Prerequisites, eligibility, mandatory training, availability and policy constraints must be applied before soft recommendation ranking.

## Rule 8 — Same concept does not mean duplicate question

Duplicate detection must compare assessment intent.

## Rule 9 — Confidence is separate from competency

A score of 3.2/5 with 90% confidence is different from 3.2/5 with 45% confidence.

## Rule 10 — Never silently alter official competency records

Consequential updates require traceability and appropriate review policy.

---

# MODULE 1 — OFFICIAL, ROLE & COMPETENCY INTELLIGENCE

## Objective

Establish the authoritative competency requirements for each role and the competency structure used everywhere else in the system.

This module answers:

> **What should this official be capable of doing?**

---

## 1.1 Official profile

Create and manage:

1. Official identifier.
2. Name.
3. Department.
4. Designation.
5. Current role.
6. Experience.
7. Education.
8. Previous training.
9. Relevant certifications.
10. Language preferences.
11. Current competency profile.
12. Assessment history summary.
13. Learning history summary.
14. Active learning path.
15. Status.

### UI requirements

Official profile must visibly separate:

- identity/profile information
- role requirements
- current competency
- evidence
- learning history

Do not mix these into one undifferentiated dashboard.

---

## 1.2 Role model

A role should define:

```text
Role
 ├── Department context
 ├── Required competencies
 ├── Required level per competency
 ├── Priority
 ├── Mandatory competencies
 └── Optional competencies
```

Example:

```text
Role: Statistical Officer

Required:
Statistical Analysis       Level 4
Python                      Level 3
SQL                         Level 3
Policy Interpretation       Level 4
Data Management             Level 3
```

---

## 1.3 Competency ontology

Implement:

```text
Competency
  ↓
Sub-competency
  ↓
Learning Objective
  ↓
Concept
```

Example:

```text
Statistical Analysis
│
├── Sampling
│   ├── Identify sampling methods
│   ├── Select appropriate method
│   └── Evaluate sampling bias
│
├── Data Interpretation
│   ├── Interpret distributions
│   └── Interpret statistical measures
│
└── Regression
    ├── Understand regression
    └── Interpret regression output
```

### Requirements

Every competency should support:

- stable identifier
- name
- description
- hierarchy
- level definitions
- related competencies
- source/reference
- status
- version
- active/inactive state

---

## 1.4 Competency levels

Do not use unexplained `1/5`, `2/5`, etc.

Define level semantics.

Example:

```text
Level 1 — Awareness
Can recognize basic concepts.

Level 2 — Basic
Can perform simple guided tasks.

Level 3 — Working
Can independently perform routine tasks.

Level 4 — Advanced
Can handle complex situations and apply judgement.

Level 5 — Expert
Can lead, evaluate, design or mentor in the competency.
```

These definitions must be configurable rather than hard-coded.

---

## 1.5 Competency requirements

Create a requirement record connecting:

```text
Role
+
Competency
+
Required Level
+
Priority
+
Mandatory/Optional
+
Effective Date
```

Support role versioning.

If requirements change later, old historical competency calculations must remain interpretable.

---

## 1.6 Role change handling

Flow:

```text
Official
   ↓
Role changes
   ↓
New role competency requirements loaded
   ↓
Current evidence retained
   ↓
Existing evidence mapped where valid
   ↓
New gaps calculated
   ↓
New learning recommendations
```

Do not delete previous role history.

---

## 1.7 Competency profile UI

Show:

```text
Statistical Analysis
Required: 4.0
Estimated: 2.8
Confidence: 82%
Gap: 1.2
Priority: HIGH
```

Then drill down:

```text
Statistical Analysis
│
├── Sampling          2.1 / 4
├── Data Interpretation 3.2 / 4
└── Regression        2.7 / 4
```

---

## 1.8 Module 1 real UI test flow

### Test M1-UI-01 — Create official

1. Open Officials.
2. Create a new official.
3. Enter role/department/profile data.
4. Save.
5. Reopen profile.
6. Confirm data persists.

**Pass:** Same record survives refresh/re-login.

### Test M1-UI-02 — Assign role

1. Open official.
2. Assign Statistical Officer role.
3. Open Competency Requirements.
4. Confirm required competencies appear.
5. Confirm levels and priorities.

**Pass:** Required profile is automatically derived from the role.

### Test M1-UI-03 — Change role

1. Change role.
2. Confirm old role history remains.
3. Confirm new competency requirements appear.
4. Confirm gaps are recalculated.

**Pass:** No historical role/evidence is destroyed.

### Test M1-UI-04 — Drill down

1. Open Statistical Analysis.
2. Expand sub-competencies.
3. Open learning objectives.
4. Confirm hierarchy is consistent.

**Pass:** Same competency IDs are used throughout the system.

---

# MODULE 2 — DIAGNOSTIC ASSESSMENT & COMPETENCY EVIDENCE ENGINE

## Objective

Determine what the official can currently demonstrate.

This is the foundation of trustworthy competency estimation.

---

## 2.1 Evidence-first architecture

```text
Competency Requirement
        ↓
Diagnostic Blueprint
        ↓
Assessment
        ↓
Responses / Tasks
        ↓
Evidence
        ↓
Competency Estimate
        ↓
Confidence
```

---

## 2.2 Evidence types

Support at least:

### Knowledge Evidence

- MCQ
- multiple-select if policy permits
- short answer

### Application Evidence

- scenario MCQ
- case-based decision

### Performance Evidence

- task submission
- practical exercise
- simulation result

### External Evidence

- accredited training
- external assessment
- supervisor assessment
- imported record

### Learning Evidence

- course completion
- module completion
- practice activity

Learning evidence must not automatically equal competency evidence.

---

## 2.3 Evidence object

Each evidence record must contain:

```text
Evidence ID
Official ID
Competency ID
Sub-competency ID
Evidence Type
Source
Score
Maximum Score
Weight
Timestamp
Validity/Recency
Confidence
Provenance
Assessment ID
Question/Task IDs
Reviewer
Status
```

---

## 2.4 Diagnostic blueprint

A diagnostic should be generated from the competency profile.

Example:

```text
Competency:
Statistical Analysis

Target:
Level 4

Assessment:
10 questions

Sampling       3
Interpretation 3
Regression     2
Bias           2

Cognitive distribution:
Remember       5%
Understand     15%
Apply          50%
Analyze       30%
```

The assessment should deliberately sample the competency rather than randomly sample the document. Blueprint fields must also include weighted claims, evidence-mode distribution, difficulty distribution, and minimum item count. These percentages are configurable policy, not universal constants.

---

## 2.5 Baseline assessment

Example result:

```text
Statistical Analysis

Overall: 2.2 / 5
Confidence: 71%

Sampling: 1.8
Interpretation: 2.5
Regression: 2.3
```

---

## 2.6 Evidence fusion

The MVP may use configurable weighted evidence rules, but must enforce attainment gates before reporting a semantic level:

- minimum coverage of required learning objectives;
- minimum application or performance evidence where the target competency requires it;
- minimum number of distinct evidence events; and
- minimum Evidence Sufficiency Index.

Do not allow many easy recall questions to compensate for zero application capability. Store the internal mastery/ability estimate separately from the reported framework level.

---

## 2.7 Evidence Sufficiency Index

Do not expose an arbitrary confidence percentage. Calculate and expose a sufficiency breakdown using normalized components:

```text
ESI = weighted_geometric_mean(
        coverage,
        volume,
        diversity,
        recency,
        consistency,
        assessment_quality
)
```

The index describes how sufficient the evidence is for an inference; it is not the competency score. Low ESI should increase `AssessmentPriority`, not automatically create a learning recommendation. Stale evidence should generally reduce sufficiency before reducing reported competency.

---

## 2.8 Evidence provenance

Every score must be traceable:

```text
Competency Estimate
       ↓
Evidence Records
       ↓
Assessment Attempts
       ↓
Questions / Tasks
       ↓
Question Intent
       ↓
Learning Objective
       ↓
Source Material
```

The UI must allow drilling through this chain.

---

## 2.9 Evidence recency

Implement configurable recency handling.

Do not necessarily lower competency directly.

Lower confidence when evidence becomes stale.

Example:

```text
Last validated:
2024

Current:
2026

Confidence:
Previously 88%
Current 61%

Recommendation:
Revalidate competency
```

---

## 2.10 Module 2 real UI test flow

### Test M2-UI-01 — Start diagnostic

1. Open an official with required competencies.
2. Click Start Diagnostic.
3. Confirm assessment contains competency-aligned questions.
4. Complete assessment.

**Pass:** Assessment is tied to the official's actual competency requirements.

### Test M2-UI-02 — Generate evidence

1. Complete a diagnostic.
2. Open Results.
3. Open competency breakdown.
4. Confirm evidence records are created.

**Pass:** Results do not exist only as a final number; underlying evidence is visible.

### Test M2-UI-03 — Verify score provenance

1. Click competency score.
2. Open Evidence.
3. Open an evidence item.
4. Trace it to assessment/question.

**Pass:** Full provenance is navigable.

### Test M2-UI-04 — Confidence behavior

1. Compare an official with one assessment against one with multiple evidence sources.
2. Confirm confidence differs appropriately.

**Pass:** Confidence is not simply hard-coded.

---

# MODULE 3 — SKILL GAP & PRIORITY INTELLIGENCE

## Objective

Determine not just "what is low" but:

> **What matters most, why it matters, and what should be addressed first?**

---

## 3.1 Basic gap

```text
Gap = Required Level - Estimated Level
```

Example:

```text
Python

Required: 3.0
Estimated: 1.8

Gap: 1.2
```

---

## 3.2 Sub-competency gap

Do not stop at competency-level gaps.

Example:

```text
Python = 2.0

Syntax              3.5
Data Structures     3.1
Pandas              1.9
Data Cleaning       1.4
Visualization       2.8
```

The actionable gap is:

> Data Cleaning.

---

## 3.3 Gap priority

Use configurable prioritization:

```text
Priority =
Gap Severity
× Role Importance
× Urgency
× Confidence Adjustment
```

The system should make the reasoning visible.

Example:

```text
Priority: HIGH

Reasons:
• Gap = 1.6 levels
• Required for current role
• Department marked competency as critical
• Low evidence confidence
```

---

## 3.4 Gap categories

Support:

- critical
- high
- medium
- low
- no gap
- insufficient evidence

`Insufficient evidence` is distinct from `low competency`.

Example:

```text
SQL:
Estimated = 2.8
Confidence = 29%

Status:
INSUFFICIENT EVIDENCE
```

Do not falsely claim a large gap from weak evidence.

---

## 3.5 Explainable gap UI

Example:

```text
Python — HIGH PRIORITY

Required: 3.0
Estimated: 1.8
Gap: 1.2
Confidence: 81%

Primary weak areas:
1. Data Cleaning
2. Pandas
3. Statistical Analysis

Evidence:
• Diagnostic: 48%
• Scenario: 42%
• Practical task: not attempted
```

---

## 3.6 Module 3 real UI test flow

### Test M3-UI-01 — Create gap

1. Complete diagnostic.
2. Open Gap Dashboard.
3. Verify gaps against required levels.
4. Sort by priority.

**Pass:** Highest-priority gap is explainable.

### Test M3-UI-02 — Distinguish low score from low confidence

1. Create one low-score/high-confidence example.
2. Create one moderate-score/low-confidence example.
3. Compare statuses.

**Pass:** System does not treat uncertainty as incompetence.

### Test M3-UI-03 — Drill to sub-competency

1. Open highest gap.
2. Expand sub-competencies.
3. Identify weakest learning objective.

**Pass:** Gap can be traced to actionable learning objectives.

---

# MODULE 4 — LEARNING INTERVENTION & PERSONALIZATION ENGINE

## Objective

Convert a competency gap into the **best intervention**, not merely a course recommendation.

---

## 4.1 Intervention model

```text
Gap
 ↓
Weak Sub-competency
 ↓
Weak Learning Objective
 ↓
Candidate Interventions
 ↓
Hard Constraint Filtering
 ↓
Soft Ranking
 ↓
Recommended Intervention
```

---

## 4.2 Intervention types

Support:

1. Full course
2. Course module
3. Micro-learning
4. Practice exercise
5. Case study
6. Scenario
7. Simulation
8. Assessment
9. Revision material
10. Mentor/supervisor intervention where supported

---

## 4.3 Hard constraints

Before ranking:

- prerequisites
- role eligibility
- mandatory policies
- availability
- language constraints
- competency target
- course status
- dependency order

Invalid candidates must be removed.

---

## 4.4 Soft ranking

Rank valid candidates using:

- gap severity
- learning objective alignment
- duration
- prior performance
- learning history
- relevance
- difficulty
- department priority
- recency
- learner preferences where available

---

## 4.5 Example

Gap:

```text
SQL JOINs = weak
```

Candidates:

```text
15-hour SQL course
30-minute JOIN module
JOIN practice set
Advanced SQL course
```

Hard filtering removes:

```text
Advanced SQL course
```

if prerequisites are not met.

Ranking selects:

```text
30-minute JOIN module
+
JOIN practice set
```

---

## 4.6 Recommendation explanation

Every recommendation should expose:

```text
Recommended:
SQL JOIN Practice Module

Why:
✓ Directly addresses weakest sub-competency
✓ Prerequisites satisfied
✓ Short intervention suitable for current gap
✓ Aligned with Statistical Officer role
✓ Previous diagnostic showed JOIN weakness
```

---

## 4.7 Personalized learning path

Example:

```text
Gap:
Sampling

        ↓

LO1 — Identify sampling methods
        ↓
Micro-module
        ↓
Practice

        ↓

LO2 — Select appropriate method
        ↓
Scenario
        ↓
Assessment

        ↓

LO3 — Evaluate sampling bias
        ↓
Case Study
        ↓
Assessment
```

---

## 4.8 Prerequisite graph

Represent prerequisites explicitly:

```text
Python Basics
      ↓
Pandas
      ↓
Data Cleaning
      ↓
Statistical Analysis
```

The system must not recommend downstream content when prerequisites are unsatisfied unless an authorized override exists.

---

## 4.9 Module 4 real UI test flow

### Test M4-UI-01 — Generate recommendations

1. Create a known gap.
2. Open Recommended Learning.
3. Confirm interventions are mapped to the gap.
4. Open recommendation explanation.

**Pass:** Recommendation reason is visible.

### Test M4-UI-02 — Test prerequisite filtering

1. Create an unsatisfied prerequisite.
2. Open recommendations.
3. Confirm dependent intervention is blocked or marked unavailable.
4. Satisfy prerequisite.
5. Refresh.

**Pass:** Candidate becomes eligible only after prerequisite satisfaction.

### Test M4-UI-03 — Targeted intervention

1. Create a sub-competency-specific gap.
2. Confirm the recommendation targets that sub-competency rather than only the parent competency.

---

# MODULE 5 — LEARNING CONTENT INTELLIGENCE

## Objective

Convert learning material into structured, competency-aligned knowledge that can drive both learning and assessment.

---

## 5.1 Content ingestion

Support:

- PDF
- DOCX
- PPTX
- video and timestamped transcripts
- structured text
- course descriptions
- learning modules
- approved reference documents

---

## 5.2 Processing pipeline

```text
Document
 ↓
File validation
 ↓
Text extraction
 ↓
OCR if required
 ↓
Layout-aware page/slide/scene segmentation
 ↓
Topic extraction
 ↓
Concept extraction
 ↓
Learning objective extraction
 ↓
Competency mapping
 ↓
Human/automated validation
 ↓
Embeddings and hybrid index
 ↓
Indexed knowledge
```

Processing is asynchronous. Persist states such as `QUEUED`, `PROCESSING`, `EXTRACTING`, `STRUCTURING`, `EMBEDDING`, `MAPPING`, `VALIDATING`, `READY`, `REQUIRES_REVIEW`, and `FAILED`, together with retries, errors, parser/model versions, and pipeline version.

---

## 5.3 Source grounding

Every extracted claim should retain:

- source document
- source version and checksum
- page, slide, section, or video time range
- hierarchical chunk and parent context
- language and parser version
- extraction confidence and approval status

Example:

```text
Learning Objective:
Select an appropriate sampling method.

Source:
Statistics_Training.pdf
Page: 18
Chunk: 18-04
```

---

## 5.4 RAG

```text
User/System Request
        ↓
Relevant competency/LO
        ↓
Metadata and lexical retrieval
 ↓
Vector retrieval and reranking
        ↓
Source chunks
        ↓
LLM
        ↓
Grounded output
```

No approved source → no authoritative generation. Treat uploaded and retrieved content as untrusted input; source authority, validity dates, conflicts, and reviewer decisions must be explicit.

---

## 5.5 Contradictory material

If two approved sources conflict:

```text
Source A → Claim X
Source B → Claim Y
```

Do not silently merge.

Mark:

```text
CONFLICTING SOURCE MATERIAL
```

and require resolution/configuration.

---

## 5.6 Poor PDFs

Handle:

- scanned documents
- OCR errors
- missing text
- broken tables
- duplicate pages
- low-quality extraction

The ingestion pipeline must produce an ingestion status:

```text
READY
WARNING
FAILED
REQUIRES REVIEW
```

---

## 5.7 Module 5 real UI test flow

### Test M5-UI-01 — Upload material

1. Open Content.
2. Upload a valid PDF.
3. Wait for processing.
4. Open processing result.
5. Inspect extracted pages/chunks.

**Pass:** Material is indexed and traceable to pages.

### Test M5-UI-02 — Learning objectives

1. Open processed document.
2. View extracted learning objectives.
3. Inspect competency mapping.
4. Open source citation.

**Pass:** Every objective can be traced back to source content.

### Test M5-UI-03 — Unsupported material

1. Upload irrelevant material.
2. Run processing.
3. Verify it is flagged rather than silently mapped.

---

# MODULE 6 — ASSESSMENT BLUEPRINT & QUESTION INTELLIGENCE

## Objective

This is the primary technical differentiator.

The goal is not:

> "Generate MCQs from PDF."

The goal is:

> **Generate a controlled assessment instrument that measures explicit competencies and learning objectives while avoiding repeated assessment intent.**

---

## 6.1 Assessment pipeline

```text
Learning Material
 ↓
Knowledge / LO Mapping
 ↓
Assessment Requirements
 ↓
Assessment Blueprint
 ↓
Question Intent
 ↓
Assessment Planning
 ↓
Task Specification
 ↓
Question Construction
 ↓
Hard Validity Gates
 ↓
Grounding and Claim Verification
 ↓
Semantic Quality and Intent Adjudication
 ↓
Human Review when required
 ↓
Published Question
```

---

## 6.2 Assessment blueprint

The blueprint must define:

- competency
- weighted claims and evidence requirements
- sub-competency
- learning objective
- number of questions
- cognitive distribution
- evidence-mode distribution
- difficulty distribution
- question types
- scenario requirements
- source restrictions
- novelty requirements

Example:

```text
10 Questions

LO1 = 2
LO2 = 3
LO3 = 3
LO4 = 2

Remember = 1
Understand = 2
Apply = 5
Analyze = 2

Easy = 2
Medium = 5
Hard = 3
```

The example distribution is policy-configurable. A blueprint is a real test specification, not only a list of topics.

---

## 6.3 Question Intent Fingerprint

Every question must have:

```text
Competency
Sub-competency
Learning Objective
Concept
Cognitive Process
Context
Required Action
Difficulty
Question Type
Evidence Target
```

---

## 6.4 Question generation prompt context

Generation should receive:

```text
Source material
+
Relevant source chunks
+
Competency
+
Sub-competency
+
Learning objective
+
Cognitive level
+
Difficulty
+
Context
+
Required action
+
Question history
```

Never generate solely from a document.

---

## 6.5 Three-phase generation and adjudication

### Phase A — Assessment planning

```text
LO
+
Concept
+
Cognitive level
+
Difficulty
+
Context
+
Action
```

↓

Structured task specification and question intent.

### Phase B — Item construction

```text
Question Intent
+
Source Context
```

↓

Structured question candidate.

### Phase C — Item adjudication

Apply deterministic checks, grounding and claim verification, semantic validation, duplicate-intent detection, and an independent AI critic. Route items requiring policy or quality decisions to a human reviewer.

This separation makes validation much easier.

---

## 6.6 Grounding validation

Verify:

1. Correct answer is supported by source.
2. Explanation is supported by source.
3. No external unsupported claim is required.
4. Question does not rely on missing context.
5. Each option is classified as entailed, contradicted, or unsupported by the approved source.

Hard validity gates run before soft quality ranking:

- exactly one defensible answer;
- correct claim and competency alignment;
- no contradiction or answer-key inconsistency;
- sufficient context and policy compliance.

Only valid items are ranked for clarity, distractor quality, novelty, realism, linguistic quality, and estimated difficulty.

---

## 6.7 Correctness validation

Check:

- exactly one correct option
- no contradictory options
- answer actually satisfies question
- distractors are plausible
- no accidental clues

---

## 6.8 Ambiguity detection

Reject if:

- multiple answers can reasonably be correct
- wording lacks necessary context
- terminology is undefined
- source itself is ambiguous
- answer depends on unstated assumptions

---

## 6.9 Cognitive alignment

If blueprint says:

```text
Apply
```

but generated question only asks for a definition:

```text
Reject / regenerate
```

---

## 6.10 Scenario generation

Prefer:

```text
Concept
 ↓
Government-relevant scenario
 ↓
Decision/problem
 ↓
Application question
```

Example:

```text
Concept:
Stratified Sampling

Scenario:
A government department is conducting a survey
across urban, rural and tribal populations and needs
proportional representation.

Question:
Which sampling approach is most appropriate?
```

---

## 6.11 Question quality score

Example:

```text
Source Grounding       20
LO Alignment           20
Cognitive Alignment    15
Answer Validity        15
Distractors            10
Ambiguity              10
Novelty                10
--------------------------
Total                 100
```

Threshold must be configurable.

---

## 6.12 Question versioning

Never overwrite an approved question.

Store:

```text
Question
 ├── Version 1
 ├── Version 2
 └── Version 3
```

Historical attempts must reference the exact version presented.

---

## 6.13 Module 6 real UI test flow

### Test M6-UI-01 — Generate blueprint

1. Select competency.
2. Select learning objectives.
3. Configure question count.
4. Configure cognitive distribution.
5. Configure difficulty.
6. Generate blueprint.

**Pass:** Blueprint visibly reflects all requested constraints.

### Test M6-UI-02 — Generate questions

1. Generate from blueprint.
2. Inspect generated questions.
3. Open metadata.
4. Verify competency, LO, concept, cognitive level and source.

**Pass:** No question is an unstructured LLM output.

### Test M6-UI-03 — Force duplicate intent

1. Generate a batch with overlapping source material.
2. Generate multiple questions around the same LO.
3. Inspect validation.
4. Confirm same-intent questions are rejected.

**Pass:** Duplicate detection is not solely based on text similarity.

### Test M6-UI-04 — Unsupported source

1. Attempt generation where source does not contain enough information.
2. Run generation.
3. Confirm question is rejected or generation is refused.

### Test M6-UI-05 — Ambiguous question

1. Introduce a question with two defensible answers.
2. Run validation.
3. Confirm ambiguity failure.

### Test M6-UI-06 — Scenario question

1. Select Apply/Analyze.
2. Require scenario.
3. Generate.
4. Verify question requires contextual decision-making rather than recall.

---

# MODULE 7 — ASSESSMENT DELIVERY, ATTEMPTS & ADAPTATION

## Objective

Deliver assessments reliably and collect high-quality response evidence.

---

## 7.1 Assessment session

Support:

- assessment instructions
- question navigation
- answer saving
- progress
- timer where configured
- submission
- interruption recovery
- final confirmation

---

## 7.2 Attempt integrity

Record:

```text
Assessment Attempt
 ├── Official
 ├── Assessment
 ├── Question Version
 ├── Presented order
 ├── Responses
 ├── Start time
 ├── Submit time
 └── Result
```

---

## 7.3 Randomization

Randomize where policy permits:

- question order
- option order

Do not destroy reproducibility.

Store the exact presentation order.

---

## 7.4 Guessing

The system should track:

- accuracy
- question difficulty
- response pattern
- consistency

Do not immediately claim a competency from one lucky answer.

---

## 7.5 Adaptive assessment

### MVP

Use rule-based, multistage adaptive assessment. Route the official into competency-specific diagnostic modules while preserving blueprint coverage, evidence-mode balance, content balance, and exposure limits. Adapt difficulty within a module; do not use one global correct → harder / wrong → easier variable.

### Future

Use calibrated IRT/CAT for item-level ability estimation and knowledge tracing for mastery across sequential learning opportunities. Keep these models separate and introduce them only after sufficient real response data exists.

Do not pretend small synthetic datasets are sufficient for calibrated IRT.

---

## 7.6 Module 7 real UI test flow

### Test M7-UI-01 — Complete assessment

1. Start assessment.
2. Answer questions.
3. Navigate backward/forward.
4. Submit.
5. Verify result.

### Test M7-UI-02 — Refresh/recovery

1. Start assessment.
2. Save responses.
3. Refresh or reopen session.
4. Verify responses remain intact.

### Test M7-UI-03 — Exact attempt provenance

1. Complete assessment.
2. Open attempt history.
3. Open a question.
4. Confirm exact question version and option order.

### Test M7-UI-04 — Adaptive flow

1. Intentionally answer easy questions correctly.
2. Verify next configured question becomes harder.
3. Repeat with incorrect responses.
4. Verify difficulty changes appropriately.

---

# MODULE 8 — COMPETENCY UPDATE, EVIDENCE FUSION & HISTORY

## Objective

Turn new assessment evidence into an updated, explainable competency estimate.

---

## 8.1 Update pipeline

```text
New Assessment
      ↓
Assessment Result
      ↓
Evidence
      ↓
Evidence Quality
      ↓
Evidence Fusion
      ↓
Competency Estimate
      ↓
Confidence
      ↓
Competency History
      ↓
Remaining Gap
```

---

## 8.2 Before/after model

Example:

```text
BEFORE

Statistical Analysis
2.2 / 5
Confidence: 71%
```

After intervention:

```text
Diagnostic          52%
Scenario            72%
Application         78%
```

↓

```text
AFTER

Statistical Analysis
3.3 / 5
Confidence: 84%
```

---

## 8.3 Competency history

Show:

```text
Aug 2026     3.3
Jun 2026     2.2
Mar 2026     2.0
```

Each point must be clickable.

---

## 8.4 Explainable update

Clicking the 3.3 result should reveal:

```text
Updated from 2.2 → 3.3

Evidence:
✓ Scenario assessment
✓ Application assessment
✓ Reassessment

Strongest improvement:
Sampling

Remaining weakness:
Regression interpretation
```

---

## 8.5 Human review

Authorized reviewers can:

- approve
- reject
- adjust according to policy
- request reassessment
- record reason

Every action becomes an audit event.

---

## 8.6 Module 8 real UI test flow

### Test M8-UI-01 — Update competency

1. Complete intervention.
2. Complete reassessment.
3. Open competency profile.
4. Verify score changed.
5. Open evidence.

**Pass:** Score update is supported by actual new evidence.

### Test M8-UI-02 — Verify history

1. Open competency history.
2. Confirm previous score remains.
3. Open old record.
4. Confirm old evidence is still available.

### Test M8-UI-03 — Explain update

1. Click updated score.
2. Inspect evidence.
3. Trace evidence to assessment attempt.

### Test M8-UI-04 — Human override

1. Log in as authorized reviewer.
2. Override/verify an estimate according to configured policy.
3. Enter reason.
4. Save.
5. Verify audit log.

---

# MODULE 9 — CONTINUOUS PERSONALIZED LEARNING LOOP

## Objective

Close the loop between competency state, learning and assessment.

---

## 9.1 Master loop

```text
Competency Profile
       ↓
Skill Gap
       ↓
Learning Objective
       ↓
Intervention
       ↓
Learning
       ↓
Assessment
       ↓
Evidence
       ↓
Competency Update
       ↓
Remaining Gap
       ↓
Next Intervention
```

---

## 9.2 Do not force linear learning

The path can branch.

Example:

```text
Sampling Gap
    │
    ├── Knowledge weak
    │      ↓
    │   Micro-module
    │
    ├── Application weak
    │      ↓
    │   Scenario
    │
    └── Performance weak
           ↓
        Practical task
```

---

## 9.3 Completion rules

Possible states:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
ASSESSMENT_PENDING
COMPETENCY_VALIDATED
REQUIRES_REASSESSMENT
```

Do not use `COMPLETED` as a synonym for `COMPETENCY_VALIDATED`.

---

## 9.4 Module 9 real UI test flow

### Test M9-UI-01 — Complete full loop

1. Create official.
2. Assign role.
3. Run diagnostic.
4. Generate gap.
5. Generate intervention.
6. Complete intervention.
7. Run assessment.
8. Update competency.
9. Confirm next gap/recommendation.

**Pass:** All stages are connected through real persisted data.

### Test M9-UI-02 — Partial completion

1. Start learning.
2. Leave before completion.
3. Return later.
4. Confirm learning state persists.
5. Confirm competency has not falsely increased.

---

# MODULE 10 — EXPLAINABILITY & EVIDENCE PROVENANCE

## Objective

Make every consequential AI/system decision understandable.

---

## 10.1 "Why is my competency X?"

UI:

```text
Python
Estimated: 3.1 / 5
Confidence: 84%

Why?

Evidence:
• Diagnostic: 62%
• Scenario: 74%
• Practical task: 81%

Last validated:
24 Aug 2026
```

---

## 10.2 "Why do I have this gap?"

```text
Required: 4.0
Estimated: 2.8
Gap: 1.2

Primary evidence:
• Sampling assessment: 42%
• Scenario: 51%

Weak sub-competency:
Sampling bias
```

---

## 10.3 "Why this recommendation?"

```text
Recommendation:
Sampling Bias Case Study

Reason:
✓ Directly mapped to current gap
✓ Required by current role
✓ Prerequisites satisfied
✓ Previous assessment identified weakness
✓ Estimated duration is low
```

---

## 10.4 "Why was this question rejected?"

This is especially important for the SIH demo.

Example:

```text
Question Q-1048

STATUS:
REJECTED

Reasons:
✗ Duplicate assessment intent
✓ Source grounded
✓ Correct answer
✓ LO aligned

Duplicate:
Q-1021

Shared intent:
Competency: Sampling
LO: Select appropriate method
Action: Choose sampling technique
Cognitive level: Apply
```

---

## 10.5 Module 10 real UI test flow

### Test M10-UI-01 — Competency explanation

1. Open competency score.
2. Click "Why?"
3. Inspect evidence.
4. Open source assessment.

**Pass:** Every claim has a traceable source.

### Test M10-UI-02 — Recommendation explanation

1. Open recommendation.
2. Click "Why recommended?"
3. Verify gap, prerequisites and alignment.

### Test M10-UI-03 — Question rejection explanation

1. Open rejected question.
2. View validation report.
3. Verify failure reasons and related question.

---

# MODULE 11 — QUESTION BANK QUALITY & CONTINUOUS ASSESSMENT ANALYTICS

## Objective

Make the assessment system improve based on real usage.

---

## 11.1 Question analytics

Track:

- attempts
- correct %
- incorrect %
- option distribution
- response time
- skip rate
- observed difficulty
- discrimination
- complaints
- rejection history

---

## 11.2 Predicted vs observed difficulty

Example:

```text
LLM Predicted:
Medium

Observed:
96% correct

Conclusion:
Likely too easy
```

Flag for review.

---

## 11.3 Question health

Example:

```text
Q-1001
Quality: 92
Observed Difficulty: Medium
Discrimination: Good
Status: ACTIVE
```

Versus:

```text
Q-1002
Quality: 88
Observed Difficulty: Very Easy
Discrimination: Poor
Status: REVIEW
```

---

## 11.4 Question retirement

Retire questions when:

- repeatedly exposed
- poor discrimination
- source becomes invalid
- source version changes
- ambiguity discovered
- policy changes
- answer becomes outdated

Historical attempts must still reference the old question version.

---

## 11.5 Module 11 real UI test flow

### Test M11-UI-01 — Question analytics

1. Complete several assessments.
2. Open question analytics.
3. Inspect performance statistics.
4. Compare predicted and observed difficulty.

### Test M11-UI-02 — Retire question

1. Mark a question for review.
2. Retire it.
3. Generate a new assessment.
4. Confirm retired question does not appear.
5. Open old attempt.
6. Confirm retired question remains visible there.

---

# MODULE 12 — ORGANIZATIONAL COMPETENCY ANALYTICS

## Objective

Move from individual personalization to department-level capacity-building intelligence.

---

## 12.1 Department view

Show:

```text
Department:
Statistics Division

Officials:
250

Critical competency gaps:

Statistical Analysis      19%
Data Management            17%
Python                     14%
Policy Interpretation      12%
```

---

## 12.2 Competency heatmap

```text
                  Competency

Department      Stats   Python   SQL   Policy

Division A       🟢      🟡      🟢      🔴
Division B       🟡      🔴      🟡      🟡
Division C       🟢      🟢      🟢      🟡
```

Use actual UI colors only where accessibility permits; retain textual labels for interpretation.

---

## 12.3 Training effectiveness

Measure:

```text
Average competency before intervention
vs
Average competency after intervention
```

Example:

```text
Sampling

Before: 2.1
After:  3.2

Improvement: +1.1
```

Do not claim causal effectiveness from insufficient data. Label small samples accordingly.

---

## 12.4 Organizational recommendation

Example:

```text
Department-wide finding:

42% of Statistical Officers
show a gap in Regression Interpretation.

Recommended action:

Deploy targeted regression intervention
to affected officials.
```

---

## 12.5 Module 12 real UI test flow

### Test M12-UI-01 — Department analytics

1. Create multiple officials.
2. Assign them to a department.
3. Create assessments/evidence.
4. Open department dashboard.
5. Verify aggregation.

### Test M12-UI-02 — Competency heatmap

1. Create different competency levels.
2. Verify heatmap reflects underlying data.

### Test M12-UI-03 — Intervention effectiveness

1. Record pre-intervention evidence.
2. Record post-intervention evidence.
3. Open effectiveness dashboard.
4. Verify before/after comparison.

---

# MODULE 13 — HUMAN GOVERNANCE, AUDIT & SAFETY

## Objective

Make the system suitable for a government context rather than treating it as a consumer AI app.

---

## 13.1 RBAC

At minimum:

```text
Official
Supervisor
Department Administrator
Assessment Manager
System Administrator
```

Each role gets explicit permissions.

---

## 13.2 Audit logs

Log consequential actions:

- competency change
- evidence creation
- evidence modification
- question approval
- question rejection
- question retirement
- recommendation override
- human competency override
- role change
- competency framework change

---

## 13.3 Audit event

```text
AuditLog
├── Actor
├── Action
├── Entity
├── Entity ID
├── Old State
├── New State
├── Reason
├── Timestamp
└── Request/Trace ID
```

---

## 13.4 Human review queue

Provide a dedicated queue for:

- uncertain competency mappings
- conflicting sources
- low-confidence competency
- ambiguous question
- low-quality question
- recommendation conflicts
- human review requests

---

## 13.5 AI decision transparency

Every AI-generated object should record:

```text
Model
Prompt/Template Version
Source Context
Generation Timestamp
Validation Result
Reviewer
Final Status
```

Do not store sensitive raw prompts if policy prohibits it; store sufficient provenance to reproduce/audit the decision.

---

## 13.6 Module 13 real UI test flow

### Test M13-UI-01 — Permission boundary

1. Log in as Official.
2. Attempt administrator action.
3. Verify access denied.
4. Log in as authorized administrator.
5. Verify access granted.

### Test M13-UI-02 — Audit trail

1. Perform competency override.
2. Open audit logs.
3. Verify actor, timestamp, reason and old/new state.

### Test M13-UI-03 — Human review

1. Create low-confidence mapping/question.
2. Verify it appears in review queue.
3. Approve/reject.
4. Verify downstream state changes appropriately.

---

# MODULE 14 — INTEROPERABILITY & EXTERNAL CONTENT INTEGRATION

## Objective

Position the system as an intelligence/evidence layer that can work with existing government learning ecosystems rather than attempting to replace them.

---

## 14.1 Integration abstraction

Do not hard-code the entire platform around one external API.

Use:

```text
External Learning Provider
        ↓
Provider Adapter
        ↓
Normalized Course Model
        ↓
Internal Learning/Intervention Engine
```

---

## 14.2 External course metadata

Normalize:

- course ID
- provider
- title
- description
- competency mapping
- learning objectives
- prerequisites
- duration
- language
- availability
- URL/reference
- status

---

## 14.3 iGOT/NSSTA positioning

The product should conceptually be:

```text
Existing Learning Ecosystem
          ↓
Courses / Learning
          ↓
OUR INTELLIGENCE LAYER
          │
          ├── Competency Gap
          ├── Evidence
          ├── Assessment
          ├── Recommendation
          └── Competency Update
```

Do not assume undocumented APIs.

Implement adapters/mocks for the SIH demonstration if live APIs are unavailable.

---

## 14.4 Module 14 real UI test flow

### Test M14-UI-01 — Import external course

1. Import normalized course metadata.
2. Map competencies.
3. Verify course appears as an intervention candidate.
4. Verify prerequisite handling.

### Test M14-UI-02 — External completion

1. Simulate external completion event.
2. Verify learning evidence is created.
3. Confirm competency does NOT automatically jump unless configured evidence policy allows it.

---

# MODULE 15 — COMPLETE END-TO-END PRODUCT FLOW

This is the master real-system journey.

```text
OFFICIAL CREATED
      ↓
ROLE ASSIGNED
      ↓
REQUIRED COMPETENCIES GENERATED
      ↓
DIAGNOSTIC ASSESSMENT
      ↓
EVIDENCE CREATED
      ↓
COMPETENCY + CONFIDENCE
      ↓
SKILL GAPS
      ↓
PRIORITY RANKING
      ↓
TARGET LEARNING OBJECTIVE
      ↓
INTERVENTION RECOMMENDATION
      ↓
LEARNING MATERIAL
      ↓
CONTENT / LO MAPPING
      ↓
ASSESSMENT BLUEPRINT
      ↓
QUESTION INTENT
      ↓
QUESTION GENERATION
      ↓
VALIDATION
      ↓
INTENT DEDUPLICATION
      ↓
SCENARIO / APPLICATION ASSESSMENT
      ↓
ASSESSMENT ATTEMPT
      ↓
NEW EVIDENCE
      ↓
COMPETENCY UPDATE
      ↓
CONFIDENCE UPDATE
      ↓
AUDIT / PROVENANCE
      ↓
REMAINING GAP
      ↓
NEXT INTERVENTION
```

---

# 16. GOLDEN MANUAL UI TEST

This test should be executable against the final product without mocks except external integrations.

## Scenario

Create:

```text
Official:
Test Statistical Officer

Role:
Statistical Officer
```

### Phase 1 — Role

1. Open profile.
2. Verify role.
3. Verify required competencies.

### Phase 2 — Baseline

4. Start diagnostic.
5. Complete assessment.
6. Verify competency estimates.
7. Verify confidence values.
8. Open evidence.
9. Trace evidence to exact questions.

### Phase 3 — Gap

10. Open gap dashboard.
11. Verify highest-priority gap.
12. Drill into sub-competency.
13. Drill into learning objective.

### Phase 4 — Recommendation

14. Open recommended interventions.
15. Verify recommendation is aligned with weak LO.
16. Open "Why recommended?"
17. Verify prerequisite checks.

### Phase 5 — Content

18. Open recommended material.
19. Verify source content.
20. Verify learning objectives.
21. Verify competency mapping.

### Phase 6 — Assessment Generation

22. Generate assessment blueprint.
23. Verify LO distribution.
24. Verify cognitive distribution.
25. Verify difficulty distribution.
26. Generate questions.
27. Inspect question intent.
28. Inspect source grounding.
29. Inspect quality score.

### Phase 7 — Validation

30. Confirm invalid question rejection.
31. Confirm unsupported question rejection.
32. Confirm duplicate-intent rejection.
33. Confirm valid question acceptance.

### Phase 8 — Assessment

34. Start assessment.
35. Answer questions.
36. Submit.
37. Verify exact attempt is persisted.

### Phase 9 — Competency update

38. Open competency.
39. Verify updated estimate.
40. Verify updated confidence.
41. Open evidence.
42. Verify new evidence is responsible for update.
43. Open competency history.

### Phase 10 — Loop

44. Open remaining gaps.
45. Verify next recommended intervention changed appropriately.

### Phase 11 — Governance

46. Log in as administrator.
47. Inspect audit logs.
48. Verify assessment generation, competency update and recommendation events.

**FINAL PASS CONDITION:**

The system demonstrates a complete, persistent, traceable:

```text
Role
→ Competency
→ Evidence
→ Gap
→ Intervention
→ Learning
→ Assessment
→ Evidence
→ Competency Update
→ Next Recommendation
```

without manually editing database records.

---

# 17. GOLDEN QUESTION-INTELLIGENCE TEST

This should be a dedicated engineering acceptance test.

Create source material containing one concept:

```text
Stratified Sampling
```

Generate:

### Q1

Definition/recall.

### Q2

Application/scenario.

### Q3

Same wording/intent as Q1.

### Q4

Unsupported claim.

### Q5

Two potentially correct answers.

### Q6

Different concept.

Expected:

```text
Q1 → ACCEPT
Q2 → ACCEPT
Q3 → DUPLICATE INTENT → REJECT
Q4 → UNSUPPORTED → REJECT
Q5 → AMBIGUOUS → REJECT
Q6 → ACCEPT
```

Then inspect every decision through the UI.

This is one of the strongest demonstrations of the system.

---

# 18. GOLDEN COMPETENCY-EVIDENCE TEST

Create:

```text
Required:
Statistical Analysis = 4
```

Initial evidence:

```text
Diagnostic = weak
```

Expected:

```text
Estimate ≈ low
Confidence = moderate
Gap = high
```

Add:

```text
Scenario assessment
```

Expected:

```text
Estimate increases
Confidence increases
```

Add:

```text
Performance evidence
```

Expected:

```text
Estimate changes again
Confidence increases further
```

Then remove/expire one old evidence item according to policy.

Expected:

```text
Confidence decreases
```

but competency must not arbitrarily collapse.

This validates the evidence architecture rather than merely the UI.

---

# 19. GOLDEN RECOMMENDATION TEST

Create:

```text
Gap:
Data Cleaning
```

Candidate interventions:

```text
A — Intro Python
B — Data Cleaning Micro-module
C — Advanced ML
D — Data Cleaning Practice
```

Prerequisite:

```text
Python Basics required for B and D.
```

If Python Basics is unsatisfied:

```text
B → BLOCKED
D → BLOCKED
```

After prerequisite completion:

```text
B → ELIGIBLE
D → ELIGIBLE
```

Then ranking should select based on:

- gap alignment
- duration
- relevance
- learner history
- policy priority

The system must expose the reasoning.

---

# 20. GOLDEN AUDIT TEST

Perform these actions:

1. Create official.
2. Change role.
3. Generate assessment.
4. Reject question.
5. Approve question.
6. Complete assessment.
7. Update competency.
8. Override competency.
9. Change intervention.

Then open Audit Logs.

Every consequential action must be reconstructable.

---

# 21. MVP ACCEPTANCE CRITERIA

The system is NOT MVP-complete until all of the following work through the real UI.

## Competency

- [ ] Official profile works.
- [ ] Role assignment works.
- [ ] Role requirements work.
- [ ] Competency hierarchy works.
- [ ] Required levels work.
- [ ] Role changes preserve history.

## Evidence

- [ ] Diagnostic creates evidence.
- [ ] Evidence has provenance.
- [ ] Competency score is evidence-derived.
- [ ] Confidence exists.
- [ ] Competency history exists.
- [ ] Low evidence is distinguishable from low competency.

## Gap

- [ ] Gaps calculate correctly.
- [ ] Sub-competency gaps exist.
- [ ] Priority exists.
- [ ] Gap explanation exists.

## Learning

- [ ] Interventions map to LOs.
- [ ] Prerequisites work.
- [ ] Recommendations are explainable.
- [ ] Learning progress persists.
- [ ] Completion does not falsely equal competency.

## Content

- [ ] Documents ingest.
- [ ] Source pages/chunks persist.
- [ ] LOs can be extracted.
- [ ] Competency mapping exists.
- [ ] Unsupported material is handled safely.

## Assessment

- [ ] Blueprint works.
- [ ] Question intent exists.
- [ ] Questions are source-grounded.
- [ ] Correctness validation works.
- [ ] Ambiguity validation works.
- [ ] Cognitive alignment works.
- [ ] Difficulty validation works.
- [ ] Duplicate intent detection works.
- [ ] Scenario generation works.
- [ ] Question versions persist.

## Competency Update

- [ ] Assessment creates new evidence.
- [ ] Competency updates.
- [ ] Confidence updates.
- [ ] History persists.
- [ ] Explanation works.

## Governance

- [ ] RBAC works.
- [ ] Human review works.
- [ ] Overrides are audited.
- [ ] Consequential AI actions are traceable.

---

# 22. PHASED ENGINEERING ORDER

The modules are feature-oriented, but they should be built in dependency order.

## Phase 0 — Requirements, Contracts & Evaluation Baseline

Before implementation, define:

- FRAC/PS competency and position requirements;
- provider-neutral `LearningProvider` contract;
- approved competency and assessment benchmark data;
- privacy, retention, RBAC, and review policies;
- MVP vertical slice and measurable acceptance metrics.

Use `MockProvider` or `CSVProvider` where live iGOT/NSSTA credentials or API specifications are unavailable. Do not invent undocumented external endpoints.

## Phase 1 — Domain Foundation

Build:

- Official
- Role
- Competency
- Sub-competency
- Learning Objective
- Competency Requirement
- level definitions
- versioning
- audit primitives

Do not build polished dashboards yet.

---

## Phase 2 — Evidence Foundation

Build:

- evidence model
- assessment attempt model
- competency estimate
- latent mastery/ability estimate
- semantic proficiency mapping
- Evidence Sufficiency Index
- attainment gates
- provenance
- history

Then prove:

```text
Assessment
→ Evidence
→ Competency Estimate
```

---

## Phase 3 — Gap Intelligence

Build:

```text
Required
vs
Estimated
↓
Gap
↓
Priority
```

Then sub-competency analysis.

---

## Phase 4 — Learning Intelligence

Build:

```text
Gap
→ LO
→ Intervention
→ Recommendation
```

Then prerequisite-aware ranking. Introduce a generic learning-resource model with `IGOT`, `NSSTA`, `INTERNAL`, and `OTHER` providers, and represent prerequisites as a DAG using PostgreSQL edge tables.

---

## Phase 5 — Content Intelligence

Build:

```text
Document / Presentation / Video
→ asynchronous processing job
→ layout-aware chunks and provenance
→ topics
→ LOs
→ competency mapping
→ embeddings and hybrid index
```

Add object storage, Redis queues, fine-grained citations, source authority/versioning, conflict handling, and hybrid RAG. Python workers handle OCR, ASR, embeddings, NLP, and generation; TypeScript/Node handles domain transactions and APIs.

---

## Phase 6 — Assessment Intelligence

Build in this order:

1. Blueprint.
2. Question intent.
3. Generation.
4. Grounding.
5. Correctness validation.
6. Ambiguity validation.
7. Cognitive validation.
8. Difficulty validation.
9. Semantic similarity.
10. Intent-level deduplication.
11. Scenario generation.
12. Question versioning.

Also add item exposure control, empirical difficulty statistics, and QTI-compatible internal item/result structures. Hard validity gates must run before soft quality scores.

Do NOT start by making a PDF-to-MCQ endpoint.

---

## Phase 7 — Real Assessment

Build:

- delivery
- attempts
- response persistence
- results
- evidence creation
- multistage competency-specific adaptive rules
- exposure limits and content-balance rules

---

## Phase 8 — Competency Update

Connect:

```text
Assessment
→ Evidence
→ Competency
→ Confidence
→ History
→ Gap
```

This creates the actual closed loop.

---

## Phase 9 — Governance

Add:

- RBAC
- review queues
- audit
- human override
- conflict handling
- department/organisation scope and privacy controls
- AI reproducibility metadata
- transactional outbox and durable security logging

---

## Phase 10 — Analytics

Add:

- question analytics
- competency trends
- department analytics
- intervention effectiveness
- organizational gap analysis

---

## Phase 11 — External Integration

The provider contract starts in Phase 0; production synchronization follows internal validation:

- normalized external course model
- `IGotProvider`, `NSSTAProvider`, `MockProvider`, and `CSVProvider` adapters
- iGOT/NSSTA integration where technically available
- external completion events
- callback idempotency, sync status, external IDs, and periodic reconciliation

Do not make the core system dependent on an external API during early development.

---

# 23. FUTURE ADVANCED ENGINEERING

These are deliberately after the core evidence system.

## IRT

Introduce when sufficient real response data exists.

```text
Question responses
+
item parameters
+
learner responses
↓
IRT ability estimate
```

## BKT

Potentially model mastery over learning events.

## Advanced recommender

Train from:

```text
Gap
+
Intervention
+
Outcome
+
Learner context
```

## Predictive analytics

Only when adequate longitudinal data exists.

## Competency decay

Model evidence freshness more rigorously.

## Performance assessment

Introduce practical task evaluation.

---

# 24. FINAL PRODUCT DEMONSTRATION

The SIH demonstration should follow exactly one official.

```text
STATISTICAL OFFICER
        ↓
ROLE REQUIREMENTS
        ↓
STATISTICAL ANALYSIS REQUIRED = 4
        ↓
DIAGNOSTIC
        ↓
CURRENT = 2.2
CONFIDENCE = 71%
        ↓
GAP ANALYSIS
        ↓
SAMPLING = 1.8
        ↓
TARGETED INTERVENTION
        ↓
20-MIN SAMPLING MODULE
+
PRACTICE
        ↓
CONTENT MAPPING
        ↓
LEARNING OBJECTIVES
        ↓
ASSESSMENT BLUEPRINT
        ↓
GENERATE QUESTIONS
        ↓
VALIDATION
 ┌──────┼─────────┐
 ↓      ↓         ↓
VALID  DUPLICATE UNSUPPORTED
 ↓      ↓         ↓
KEEP   REJECT    REJECT
        ↓
SCENARIO ASSESSMENT
        ↓
NEW EVIDENCE
        ↓
SAMPLING = 3.1
CONFIDENCE = 84%
        ↓
STATISTICAL ANALYSIS = 3.2
        ↓
REMAINING GAP
        ↓
REGRESSION INTERVENTION
```

The most important visual moment should be:

```text
BEFORE
Statistical Analysis
2.2 / 5
Confidence 71%

          ↓ LEARNING + ASSESSMENT ↓

AFTER
Statistical Analysis
3.2 / 5
Confidence 84%

Evidence:
✓ Diagnostic
✓ Scenario
✓ Application
✓ Reassessment
```

---

# 25. FINAL PRODUCT DEFINITION

The final system should be understood internally as six interconnected intelligence layers:

```text
┌────────────────────────────────────────────┐
│ 1. COMPETENCY INTELLIGENCE                 │
│ What should the official know/do?          │
├────────────────────────────────────────────┤
│ 2. EVIDENCE INTELLIGENCE                   │
│ What can we prove about capability?        │
├────────────────────────────────────────────┤
│ 3. GAP INTELLIGENCE                        │
│ What is missing and how important is it?   │
├────────────────────────────────────────────┤
│ 4. LEARNING INTELLIGENCE                   │
│ What intervention should close the gap?    │
├────────────────────────────────────────────┤
│ 5. ASSESSMENT INTELLIGENCE                 │
│ Did learning produce demonstrated ability? │
├────────────────────────────────────────────┤
│ 6. CONTINUOUS COMPETENCY INTELLIGENCE      │
│ What changed and what happens next?        │
└────────────────────────────────────────────┘
```

The system's defining loop is:

```text
                 ┌─────────────────────┐
                 │ REQUIRED COMPETENCY │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │     EVIDENCE        │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ SCORE + CONFIDENCE  │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │    SKILL GAP        │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ TARGETED LEARNING   │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ ASSESSMENT          │
                 │ INTELLIGENCE        │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ NEW EVIDENCE        │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ UPDATED COMPETENCY  │
                 └──────────┬──────────┘
                            │
                            └───────────────→ NEXT GAP
```

## Non-negotiable final principle

> **The product must never merely say that an official completed learning. It must maintain an auditable chain of evidence showing what competency was required, what the official demonstrated, how confident the system is, what gap remained, what intervention was selected, and what new evidence justified the subsequent competency update.**

This is the product context against which every future feature, implementation decision, AI prompt, database change, API, UI screen, and test should be evaluated.
