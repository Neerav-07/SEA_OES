# Online Examination System UI adaptation

The supplied SRS v1.1 describes a three-role online examination system. The original application was a MoSPI competency platform. The active frontend routes now show an exam-oriented preview. The active backend routes are limited to authentication and health, and the local Docker stack no longer starts the unrelated ML service or MoSPI seed. Legacy feature source files remain available in the repository.

## Visible flows

- `ADMIN` accounts see examiner question-bank, exam-builder, result, and help screens.
- `EMPLOYEE` accounts see assigned examinations, timed attempts, results, and help screens.
- Public registration and the original competency, training, analytics, AI, and report screens are removed from active navigation and routes, while their source code remains in place.
- Single-choice and multi-select questions use exact-match scoring without partial or negative credit. Published questions and exam configuration cannot be edited through the preview UI.

## Important scope boundary

Exam questions, assignments, attempts, answers, and results currently use browser `localStorage` so the frontend flow can be reviewed without implementing examination backend logic. Examiner and student accounts must use the same browser profile to see the same preview data. This storage is user-editable and exposes correct answers; it is **not** suitable for a real examination or security testing.

The following SRS requirements require backend and data-model changes and are not represented as complete: a distinct Teacher/Examiner role; administrator-only account provisioning; server-side assignment and availability enforcement; authoritative server timer and answer autosave; single active attempt/session locks; immutable persisted question snapshots; once-only finalization; audit and integrity events; protected question images; platform analytics; and the specified Next.js/NestJS/Prisma/Redis/S3 architecture. Do not describe this preview as SRS-compliant until those are implemented and tested.
