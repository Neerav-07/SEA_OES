# PS 26101 — Required Codebase Changes

## Purpose

This document records the code changes identified during the review of the current project against the planned PS 26101 approach.

## Changes Required

| #   | Area                               | Code path                                                                                                                        | Required change                                                                                                                                                                                                                                                                                  | Status     |
| --- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 1   | Diagnostic generation architecture | `server/src/controllers/diagnostic.controller.js`                                                                                | Keep `POST /diagnostics/blueprint` focused on blueprint/planning. Put actual ML question generation in the separate `POST /diagnostics/generate` flow. Ensure the controller imports and calls the ML service rather than keeping question-generation logic hardcoded in the blueprint endpoint. | Fix/verify |
| 2   | Diagnostic routes                  | `server/src/routes/diagnostic.route.js`                                                                                          | Expose the generation endpoint alongside blueprint and attempt submission, with the controller export matching the route import.                                                                                                                                                                 | Fix/verify |
| 3   | ML competency mapping              | `ml/pipelines/competency_mapping.py`                                                                                             | Keep semantic mapping based on `SentenceTransformer(MODEL_NAME)` and map only against the platform taxonomy. The taxonomy JSON must contain the exact same competency `code`, `name`, and `category` values as the DB seed.                                                                      | Fix/verify |
| 4   | ML taxonomy consistency            | `ml/data/competencies_taxonomy.json`                                                                                             | Synchronize the competency taxonomy with `server/src/services/module3Seed.service.js`. Remove stale/duplicate competency definitions and do not introduce competency codes that are absent from the seed.                                                                                        | Fix/verify |
| 5   | ML course catalogue                | `ml/data/course_catalogue.json`                                                                                                  | Ensure course entries reference valid competency codes from the same seeded taxonomy. Remove duplicate or stale mappings.                                                                                                                                                                        | Fix/verify |
| 6   | Module 3 seed consistency          | `server/src/services/module3Seed.service.js`                                                                                     | Treat this seed as the source of truth for demo competencies, sub-competencies, learning objectives, roles, requirements, and profile estimates. Keep ML JSON data aligned with it instead of maintaining a second conflicting taxonomy.                                                         | Fix/verify |
| 7   | Database schema migration safety   | `server/src/db/schema/competencies.js` and other schema files                                                                    | Do not accept a destructive `drizzle-kit push` when it proposes deleting populated tables/columns. Reconcile the schema with the existing database or use a deliberate migration before applying changes.                                                                                        | Required   |
| 8   | Learning-objective schema          | `server/src/db/schema/competencies.js`                                                                                           | Current schema uses `subCompetencyId`, `code`, `title`, and `taxonomyLevel`. Any old references to `competencyId`, `description`, `targetLevel`, `status`, `isActive`, or `updatedAt` in application code/data must be removed or migrated deliberately.                                         | Fix/verify |
| 9   | Sub-competency schema              | `server/src/db/schema/competencies.js`                                                                                           | Current `subCompetencies` schema does not contain `updatedAt`. Remove application references to that column unless the schema is intentionally changed through a safe migration.                                                                                                                 | Fix/verify |
| 10  | Assessment schema                  | `server/src/db/schema/assessments.js`                                                                                            | Preserve the existing assessment/question model. If adding intent-hash uniqueness, ensure nullable `intentHash` behavior is understood and generation code does not create duplicate question intents for the same assessment.                                                                   | Fix/verify |
| 11  | ML service boundary                | `server/src/services/ml.service.js`                                                                                              | Keep Python ML execution behind the server ML-service boundary. The diagnostic controller should call this service instead of embedding Python/ML implementation details directly in controller code.                                                                                            | Fix/verify |
| 12  | Analytics                          | `client/src/pages/dashboard/analytics/AnalyticsPage.jsx`                                                                         | Replace purely hardcoded/fallback-only analytics with API-backed values wherever backend data is available. Keep fallback values only as a UI failure state, not as the primary implementation.                                                                                                  | Fix/verify |
| 13  | Recalibration                      | `client/src/pages/dashboard/analytics/AnalyticsPage.jsx`                                                                         | Do not silently report successful recalibration when the API call fails. The current `catch` displays a success toast; change this to an error/warning state so the UI does not claim an operation succeeded when it did not.                                                                    | Required   |
| 14  | Recalibration target               | `client/src/pages/dashboard/analytics/AnalyticsPage.jsx`                                                                         | Avoid hardcoding `officialId: 'off-01'` unless that ID is guaranteed by the seed/database. Use the authenticated/current official or an API-supported organization-wide recalibration operation.                                                                                                 | Required   |
| 15  | API consistency                    | `client/src/services/api.js`, `server/src/routes/index.js`, route files                                                          | Verify the frontend endpoint paths exactly match the mounted backend routes. In particular, diagnostic endpoints must resolve under `/diagnostics/...` and analytics under `/analytics/...`.                                                                                                     | Fix/verify |
| 16  | Duplicate source of truth          | `server/src/services/module3Seed.service.js` + `ml/data/*.json`                                                                  | Keep DB seed data authoritative. ML JSON files should be a synchronized representation/reference dataset, not an independently edited second taxonomy.                                                                                                                                           | Required   |
| 17  | Python generated files             | `ml/__pycache__/`, `ml/pipelines/__pycache__/`                                                                                   | Do not commit generated Python cache directories. Add them to `.gitignore` if not already present.                                                                                                                                                                                               | Required   |
| 18  | Python virtual environment         | `ml/venv/`                                                                                                                       | Do not commit the ML virtual environment. Add `ml/venv/` to `.gitignore`; dependencies belong in `ml/requirements.txt`.                                                                                                                                                                          | Required   |
| 19  | Client environment example         | `client/.env.example`                                                                                                            | Restore/maintain the example environment file if it is required by the project. Do not commit real secrets.                                                                                                                                                                                      | Verify     |
| 20  | Bloom distribution                 | `server/src/controllers/diagnostic.controller.js` and/or ML assessment generator                                                 | Use the blueprint distribution as planning data and pass the actual distribution to the ML generator: `REMEMBER: 1`, `UNDERSTAND: 2`, `APPLY: 4`, `ANALYZE: 3` for the 10-question example.                                                                                                      | Required   |
| 21  | Competency selection               | `server/src/controllers/diagnostic.controller.js`                                                                                | Resolve the requested competency against the DB competency list and generate only for the selected competency, or for all selected competencies when no specific competency is supplied. Attach the resulting `competencyId` to generated questions.                                             | Required   |
| 22  | Duplicate-question prevention      | `server/src/controllers/diagnostic.controller.js`, `ml/pipelines/assessment_generator.py`, `server/src/db/schema/assessments.js` | Pass existing intent hashes into generation when available and persist/check them consistently. Do not rely only on a database unique index if the generator can produce duplicates before insertion.                                                                                            | Required   |

## Canonical Competency Source

The current DB seed in:

`server/src/services/module3Seed.service.js`

defines these competency codes:

- `SURVEY_SAMPLING`
- `STATISTICAL_ANALYSIS`
- `PYTHON_DATA`
- `DATA_PRIVACY`
- `SQL_DATA`
- `GIS_VISUALIZATION`
- `CLOUD_APIS`

Their names/categories must match exactly in:

`ml/data/competencies_taxonomy.json`

## Important Database Warning

Do **not** select `Yes` on a destructive `drizzle-kit push` merely to make the schema warning disappear.

The database currently contains populated data in tables/columns that the changed schema may no longer describe. First reconcile the schema and database intentionally, then generate/apply a migration or otherwise preserve the existing data.

## Architecture Target

The intended flow is:

1. **Blueprint**
   - Determine competency/role requirements.
   - Produce the assessment blueprint.
   - Do not generate questions here.

2. **Generation**
   - Receive source material + competency + Bloom distribution.
   - Use the ML pipeline.
   - Semantic competency mapping uses the SentenceTransformer model configured by `ml/config.py`.
   - Generate questions.
   - Attach the DB `competencyId`.
   - Prevent duplicate question intents.

3. **Assessment submission**
   - Persist/evaluate the attempt.
   - Update competency evidence/estimates as defined by the backend services.

4. **Skill-gap / pathway loop**
   - Recalculate gaps from competency requirements and estimates.
   - Feed the resulting gaps into learning recommendations/pathways.

5. **Analytics**
   - Read calculated backend data.
   - Display organization/department/domain readiness.
   - Trigger recalibration through the backend.
   - Never show a success message when the API operation actually failed.

## Definition of Done

The fixes are complete when:

- DB seed and `ml/data/competencies_taxonomy.json` contain the same competency codes, names, and categories.
- Course mappings reference valid competency codes.
- There is no duplicate/stale competency taxonomy being used by the ML pipeline.
- Blueprint and question generation are separate operations.
- The diagnostic controller calls the ML service for generation.
- Bloom distribution is actually passed into question generation.
- Generated questions receive the correct `competencyId`.
- Duplicate question intents are prevented.
- Analytics uses backend data rather than presenting hardcoded demo values as real results.
- Recalibration failures are shown as failures.
- No destructive database push is performed without a deliberate migration/data-preservation plan.
- `__pycache__` and `ml/venv` are not committed.
