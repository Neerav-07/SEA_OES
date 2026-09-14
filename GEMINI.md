# SIH 2026 — Project Instructions

## 1. Project Context

This repository is the implementation for our Smart India Hackathon (SIH) 2026 problem statement.

The project is developed by a student team and is actively evolving.

There are two sources of project context available in this VS Code workspace:

1. `SIH26` — the actual software/codebase.
2. `06 Hackathons/SIH 2026` — the Obsidian knowledge base containing:
   - Problem Statement
   - Requirements
   - Product approach
   - Architecture
   - AI/ML approach
   - Technical decisions
   - Tasks
   - Future improvements
   - Hackathon-specific notes

Treat the Obsidian SIH notes as project documentation and the SIH26 repository as the source of truth for the current implementation.

---

## 2. Golden Rules

Before making significant code changes:

1. Understand the existing implementation.
2. Inspect relevant files and dependencies.
3. Check the SIH documentation in the Obsidian folder when the requirement or intended behaviour is unclear.
4. Do not redesign the architecture without discussing it first.
5. Do not replace existing working functionality unnecessarily.
6. Prefer minimal, targeted changes.
7. Preserve existing APIs and interfaces unless the task explicitly requires changing them.
8. Follow the project's existing coding style and conventions.
9. Never invent requirements, APIs, database fields, datasets, or integrations.
10. If something is ambiguous, ask before making a potentially breaking decision.

---

## 3. Before Coding

For non-trivial tasks, first provide:

### Understanding

- What the task requires
- Which existing functionality is involved
- Relevant files/modules

### Proposed approach

- What will change
- Why it needs to change
- Dependencies or side effects

### Verification

- How the implementation will be tested
- What existing functionality could be affected

For multi-file or architectural changes, create an implementation plan first and wait for approval before making changes.

---

## 4. Codebase Rules

### Inspect before modifying

Never modify a file simply because its name appears relevant.

First inspect:

- imports
- callers
- dependencies
- related modules
- configuration
- tests
- API contracts

Understand how the existing code works.

### Preserve working code

Do not:

- rewrite entire files unnecessarily
- remove existing functionality without justification
- change working APIs casually
- introduce duplicate implementations

Prefer:

- small changes
- reusable functions
- existing utilities
- existing abstractions

---

## 5. AI / ML Rules

AI-generated output must not be treated as automatically correct.

For AI/ML functionality:

- Validate LLM outputs where appropriate.
- Prefer structured outputs when possible.
- Validate generated questions against the expected schema.
- Do not allow unsupported facts or competencies to be silently invented.
- Preserve provenance where required.
- Handle LLM failures gracefully.
- Use deterministic/fallback behaviour where the application requires reliability.
- Keep provider-specific logic isolated from business logic.
- Do not hard-code API keys or secrets.

Any AI feature should have a clear:
Input → Processing → Validation → Output flow.

---

## 6. Configuration & Secrets

Never commit:

- API keys
- passwords
- tokens
- credentials
- `.env` secrets
- private certificates

Use environment variables.

Before changing configuration, inspect the existing configuration mechanism.

Do not modify `.env` files blindly.

---

## 7. Database Rules

Before modifying database-related code:

1. Inspect the current schema/models.
2. Inspect existing queries.
3. Check relationships and constraints.
4. Check how the application currently connects to the database.
5. Preserve data compatibility where possible.

Do not create duplicate tables or models without checking the existing implementation.

---

## 8. API Rules

Before changing an API:

- Find the route/controller.
- Find its callers.
- Inspect request/response formats.
- Check frontend usage.
- Check validation.
- Check error handling.

If an API contract must change, identify all affected components.

---

## 9. Testing

After making changes:

1. Run the most relevant tests.
2. Run lint/type checks where applicable.
3. Verify imports/builds.
4. Test affected API endpoints or flows when possible.
5. Report what was tested and what could not be tested.

Never claim a change is verified if it was not actually tested.

---

## 10. Git Safety

Never automatically:

- delete branches
- force push
- reset commits
- overwrite unrelated changes
- discard uncommitted user work

Before potentially destructive Git operations, ask for confirmation.

Keep changes focused on the requested task.

---

## 11. Obsidian Knowledge Base

The Obsidian folder is documentation, not executable code.

Use it to understand:

- SIH requirements
- product decisions
- architecture
- technical decisions
- planned features
- constraints
- hackathon strategy

When documentation conflicts with the actual codebase:

1. Identify the conflict.
2. Do not silently rewrite the code.
3. Explain the discrepancy.
4. Ask whether the documentation or implementation should become the source of truth.

---

## 12. Working Style

Act as a senior technical teammate.

For every significant task:

Understand → Inspect → Plan → Implement → Test → Report

Prefer correctness and maintainability over speed.

Do not make large speculative changes.

Do not assume that a newer or more complicated technology is automatically better.

---

## 13. Communication

When reporting work, use this format:

### Changed

- Files changed
- What changed

### Why

- Reason for the change

### Verification

- Tests/checks performed
- Results

### Notes

- Risks
- Remaining issues
- Recommended next steps

Keep explanations concise but technically clear.
