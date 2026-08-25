# 🏛️ Kshamata V2 — Technical System Architecture & Core Engines

This document presents the official **System Architecture & 6 Core Technical Engines** powering **Kshamata V2 (MoSPI Problem Statement 26101 Capacity Building System)**. It maps the end-to-end official user flow to technical system components.

---

## 📐 1. End-to-End Technical System Architecture

```mermaid
graph TD
    subgraph S1 ["1. Profile & Role Layer"]
        U["Official / User"] -->|1. Login & Role Selection| E1["1. FRAC Role & Profile Architecture Engine"]
        E1 -->|Retrieves Baseline Requirements| DB1[("Postgres: FRAC Blueprint DB <br/> (Roles, Competencies, L1-L5 Requirements)")]
    end

    subgraph S2 ["2. Assessment & RAG Generation Layer"]
        DOCS["MoSPI Source Manuals <br/> (NSS, SNA 2008, NDSAP)"] -->|Chunking & Vector Embeddings| RAG["pgvector / RAG Pipeline"]
        RAG -->|Grounded Context| E2["2. AI Grounded Assessment & Item Engine"]
        E2 -->|Auto-Validation & Auto-Publishing| DB2[("Question Bank DB <br/> (10 Case Studies / Bloom Levels)")]
        DB2 -->|Delivers Exam| PLAYER["Dedicated Full-Screen Exam Arena <br/> (Anti-Cheating Protocol)"]
    end

    subgraph S3 ["3. Evidence & Gap Fusion Layer"]
        PLAYER -->|Submit Attempt Scores| E3["3. Multi-Modal Evidence Fusion Engine"]
        COURSE["iGOT / NSSTA Completion Logs"] -->|Training Evidence| E3
        E3 -->|Calculates Fused Level| DB3[("Official Evidence Registry")]
        DB3 --> E4["4. Real-Time Dynamic Skill Gap Engine"]
        DB1 --> E4
        E4 -->|Calculates Deficit: Required - Estimated| GAP_REPORTS["Live Skill Deficit Vector (ΔC)"]
    end

    subgraph S4 ["4. Recommendation & Governance Layer"]
        GAP_REPORTS --> E5["5. Intelligent iGOT/NSSTA Recommendation Engine"]
        E5 -->|Maps Deficits to Courses| LEARNING_PATH["Personalized iGOT Learning Pathways"]
        LEARNING_PATH -->|Official Upskills| COURSE
        
        GAP_REPORTS --> E6["6. Governance & Predictive Analytics Engine"]
        E6 -->|Aggregates Workforce Metrics| ACBP["Annual Capacity Building Plan (ACBP) <br/> & Executive Dashboards"]
    end

    style E1 fill:#1e3a8a,stroke:#3b82f6,color:#ffffff,font-weight:bold
    style E2 fill:#1e3a8a,stroke:#3b82f6,color:#ffffff,font-weight:bold
    style E3 fill:#1e3a8a,stroke:#3b82f6,color:#ffffff,font-weight:bold
    style E4 fill:#1e3a8a,stroke:#3b82f6,color:#ffffff,font-weight:bold
    style E5 fill:#1e3a8a,stroke:#3b82f6,color:#ffffff,font-weight:bold
    style E6 fill:#1e3a8a,stroke:#3b82f6,color:#ffffff,font-weight:bold
```

---

## ⚙️ 2. Detailed Breakdown of the 6 Core Technical Engines

### 1️⃣ Engine 1: FRAC Role & Profile Architecture Engine
* **User Flow Mapping**: Steps 1 & 2 (*Login & Profile Sync* ➔ *Competency Requirement Mapping*).
* **Technical Function**:
  - Ingests official designations (*Senior Statistical Officer*, *Assistant Director*, *Director*).
  - Maps roles to standard FRAC (Framework for Roles, Activities, and Competencies) blueprints across 4 domains (*Statistical*, *Technical*, *Digital Governance*, *Managerial*).
  - Assigns target baseline proficiency levels ($L_1$ to $L_5$).

---

### 2️⃣ Engine 2: AI Grounded Assessment & Item Generation Engine
* **User Flow Mapping**: Step 3 (*AI Competency Assessment*).
* **Technical Function**:
  - Ingests official MoSPI manuals (*NSS survey instructions, SNA 2008 national accounting rules, NDSAP privacy standards*).
  - Uses RAG vector retrieval to generate 10 deep, Codeforces-style multi-paragraph case-study problem statements.
  - Aligns questions to Bloom’s Taxonomy (`APPLY`, `ANALYZE`, `EVALUATE`).
  - Executes **Automated Quality Verification** (Schema, Logic, Grounding) and auto-publishes to the DB Question Bank.

---

### 3️⃣ Engine 3: Multi-Modal Evidence & Capability Fusion Engine
* **User Flow Mapping**: Steps 7 & 8 (*Re-Assess* ➔ *Competency Profile Updated*).
* **Technical Function**:
  - Collects multi-modal performance evidence:
    $$\text{Evidence} = \{ \text{Diagnostic Exam Scores}, \text{iGOT Course Logs}, \text{NSSTA Workshops} \}$$
  - Computes weighted Bayesian evidence fusion:
    $$E_{\text{fused}} = w_1 \cdot S_{\text{exam}} + w_2 \cdot S_{\text{iGOT}} + w_3 \cdot S_{\text{prior}}$$
  - Automatically updates estimated competency levels in real-time ($L_{\text{estimated}}$).

---

### 4️⃣ Engine 4: Real-Time Dynamic Skill Deficit & Gap Engine
* **User Flow Mapping**: Step 4 (*Evidence-Based Gap Analysis*).
* **Technical Function**:
  - Computes real-time competency gap vectors:
    $$\Delta C_i = \max\left(0, L_{\text{required}, i} - L_{\text{estimated}, i}\right)$$
  - Triggers instant gap recalculation whenever an official submits an assessment or changes assigned roles.
  - Classifies gap urgency: *Critical Deficit*, *Moderate Deficit*, *Target Met*.

---

### 5️⃣ Engine 5: Intelligent iGOT / NSSTA Recommendation Engine
* **User Flow Mapping**: Steps 5 & 6 (*Personalized Recommendations* ➔ *Learn & Upskill*).
* **Technical Function**:
  - Takes real-time gap vectors ($\Delta C_i$) and maps them to TPAC-approved **iGOT Karmayogi course modules** and **NSSTA training programmes**.
  - Uses cosine similarity matching between competency deficit vectors and course metadata embeddings.
  - Generates role-aware, prioritized learning pathways for each official.

---

### 6️⃣ Engine 6: Governance & Predictive Analytics Engine (ACBP)
* **User Flow Mapping**: Step 9 (*Dashboard & Insights*).
* **Technical Function**:
  - Aggregates workforce capability data across all MoSPI divisions (*FOD*, *NAD*, *DIID*, *ESD*, *SDRD*).
  - Auto-generates the **Annual Capacity Building Plan (ACBP)** report for ministry leadership.
  - Predicts future training demand trends using predictive analytics models.

---

## 🎨 3. Slide Summary Table (For Presentation)

| Engine Name | Input Data | Core Processing Logic | Output Artifact |
| :--- | :--- | :--- | :--- |
| **1. FRAC Profile Engine** | Designation, Department | FRAC Mapping Rules | Baseline Competency Blueprint |
| **2. AI Item Engine** | MoSPI Manuals, RAG Chunks | LLM + Auto-Validation Rules | Grounded Case-Study Question Bank |
| **3. Evidence Fusion Engine** | Exam Scores, iGOT Logs | Weighted Bayesian Fusion | Real-Time Estimated Level ($L_{\text{est}}$) |
| **4. Skill Gap Engine** | $L_{\text{required}}$, $L_{\text{estimated}}$ | Vector Subtraction ($\Delta C_i$) | Real-Time Deficit Gap Vector |
| **5. Recommendation Engine** | Deficit Vector ($\Delta C_i$) | Cosine Similarity Ranking | Targeted iGOT / NSSTA Learning Plan |
| **6. Governance Engine** | Ministry-wide Gap Vectors | Predictive Trend Modeling | Annual Capacity Building Plan (ACBP) |
