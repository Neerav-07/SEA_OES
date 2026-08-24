# Kshamata (क्षमता)

> **AI-Enabled Competency Intelligence & Assessment Platform for Official Statistics**  
> **Smart India Hackathon (SIH) 2026 — Problem Statement ID: 26101**  
> **Ministry / Organization:** Ministry of Statistics and Programme Implementation (MoSPI)  
> **Department:** Data Informatics & Innovation Division (DIID) & National Statistical Systems Training Academy (NSSTA)

---

## Executive Summary

**Kshamata** is an enterprise-grade AI-enabled competency intelligence and capacity-building layer engineered for India's Official Statistical System. The platform assesses officials' existing capabilities, identifies explainable skill gaps against required statistical role profiles, recommends personalized learning pathways integrated with the **iGOT Karmayogi** ecosystem & **NSSTA TPAC** recommended training programmes, and automatically generates grounded multiple-choice questions (MCQs) and quizzes from official learning materials.

---

## Core Differentiators & Product Philosophy

- **`Course Completion ≠ Competency`**: Learning activities generate evidence; auditable evidence supports competency estimates with explicit confidence scores and provenance tracing.
- **Evidence-Driven Skill Gap Analysis**: Multi-layered evidence fusion across Knowledge, Application (Scenario-based), Performance (Virtual Lab), and External Training records.
- **Grounded Assessment Generation**: Automated generation of Bloom's Taxonomy-aligned MCQs and quizzes directly grounded in uploaded documents and statistical guidelines, rejecting ungrounded LLM hallucinations.
- **Explainable AI Recommendations**: Transparent mapping between role gaps, learning objectives, and recommended iGOT Karmayogi modules.

---

## Technical Architecture & Stack

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Kshamata Web Platform (React 19)                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST / API
┌────────────────────────────────────▼────────────────────────────────────┐
│                    Express 5 / Node.js ESM Core API                     │
└─────────┬──────────────────────────┬──────────────────────────┬─────────┘
          │                          │                          │
┌─────────▼────────┐      ┌──────────▼─────────┐      ┌─────────▼─────────┐
│ PostgreSQL 16 DB │      │ iGOT Karmayogi API │      │ LLM Assessment Engine│
│   (Drizzle ORM)  │      │  (Course Sync)     │      │ (Grounded Generator)│
└──────────────────┘      └────────────────────┘      └───────────────────┘
```

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS v4, Zustand, Lucide Icons |
| **Backend API** | Node.js (ESM), Express 5, JWT Authentication (Access + Refresh Rotation) |
| **Database & ORM** | PostgreSQL 16 (Local Docker / Neon Serverless), Drizzle ORM |
| **Containerization** | Docker & Multi-stage Docker Compose Orchestration |
| **Security & Compliance** | Helmet, CORS, Cookie Parser, Role-Based Access Control (RBAC) |

---

## System Modules Overview

1. **Official & Role Competency Intelligence**: Profile management, designation mapping, and department-specific competency requirements across:
   - *Statistical Competencies* (Survey Design, Sampling, National Accounts, Price Statistics, Labour Statistics, Data Quality Frameworks).
   - *Technical Competencies* (Python, R, SQL, Stata, SPSS, GIS, Data Visualization, AI/ML, Cloud Computing).
   - *Digital Governance* (Cybersecurity, Data Privacy, Government Cloud, Digital Signatures).
   - *Behavioural & Managerial Competencies* (Leadership, Decision Making, Ethics, Change Management).
2. **Diagnostic Evidence Engine**: Evidence collection, confidence calculation, recency decay, and provenance breakdown.
3. **iGOT Karmayogi & NSSTA Integration Engine**: Personalized learning pathway prescription mapped to identified deficits.
4. **Intelligent Assessment & Quiz Generator**: Grounded MCQ generation from uploaded learning materials with instant evaluation and feedback.
5. **Workforce & Capacity Analytics Dashboard**: Learner progression tracking and organization-wide workforce capacity insights for administrators.

---

## Quick Start & Development Setup

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose

---

### Method A: Single Command Full-Stack Docker

Start PostgreSQL, Express Server, and React Client simultaneously:

```bash
# Build and launch all services in detached mode
docker compose up -d --build
```

Access services:
- **Web App**: `http://localhost:80` (or `http://localhost:5173` if running local dev)
- **API Server**: `http://localhost:5000/api`
- **PostgreSQL**: `localhost:5432` (`kshamata_db`)

---

### Method B: Manual Local Setup

#### 1. Start Database
```bash
docker compose up -d postgres
```

#### 2. Backend Server
```bash
cd server
cp .env.example .env
npm install
npm run db:push     # Apply Drizzle schemas to PostgreSQL
npm run dev
```

#### 3. Frontend Client
```bash
cd client
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

---

## API Specification Summary

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register official account |
| `POST` | `/api/auth/login` | No | Authenticate official & set session cookies |
| `POST` | `/api/auth/refresh` | Cookie | Refresh JWT access token |
| `POST` | `/api/auth/logout` | Cookie | Logout official & clear cookies |
| `GET` | `/api/auth/me` | Bearer | Get current official profile |
| `GET` | `/api/health` | No | Server health check endpoint |

---

## License & Organization

Built for **Smart India Hackathon (SIH) 2026** — **MoSPI DIID & NSSTA**.  
Developed by **Team Esc(Reality);**
