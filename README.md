# Online Examination System preview

This repository currently runs an exam-oriented frontend preview based on the supplied SRS v1.1. The active UI covers a question bank, exam configuration and assignment, timed student attempts, exact-match objective scoring, and results. The former MoSPI feature files remain in the repository but are not loaded by the active routes.

## Run locally

Install Docker Desktop, then from the repository root run:

```powershell
docker compose up -d --build
```

Open **http://localhost:8080**. The API health endpoint is **http://localhost:8080/api/health**.

Local preview accounts:

| Role | Email | Password |
| --- | --- | --- |
| Examiner | `examiner@oes.local` | `Examiner@123!` |
| Student | `student@oes.local` | `Student@123!` |

On first visit, the browser receives 12 sample questions and three examinations. **Software Engineering Essentials** and **Database Systems Basics** are published and assigned to the demo student, so they can be started immediately. **Web Fundamentals Practice** is a draft; the examiner can open it, enter student email addresses, and publish it. Existing browser exam data is preserved.

Examiners can also use **Question bank → Import PDF**. The PDF must contain selectable text in this format: `Q1. Question text`, choices such as `A) First choice`, and a line such as `Answer: A` or `Answer: A, C`. The import preview shows detected questions and skips incomplete answer keys. Confirmed questions are added to the browser question bank and appear in the exam builder. Image-only scanned PDFs require OCR before import.

Set `JWT_SECRET`, `OES_DEMO_EXAMINER_PASSWORD`, and `OES_DEMO_STUDENT_PASSWORD` in a local `.env` file before using this outside an isolated development machine. Public registration is disabled. To stop the stack, run `docker compose down`.

## Scope

Exam questions, assignments, attempts, answers, and results are stored in the browser's `localStorage`. Use the **same browser profile** when switching between the examiner and student demo accounts. The API currently handles authentication only. Browser storage is not authoritative or secure for real examinations. See [docs/OES_UI_SCOPE.md](docs/OES_UI_SCOPE.md) for the remaining SRS gaps.
