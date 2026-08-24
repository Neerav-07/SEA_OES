# 🤖 Kshamata Machine Learning & Intelligence Service

Modular Python/FastAPI Machine Learning service for Kshamata (SIH PS 26101).

---

## 🌟 Capabilities

1. **Evidence Fusion & Gap Calculator** (`pipelines/skill_gap_calculator.py`):
   - Computes weighted competency estimates, confidence metrics, and recency attenuation.
2. **Competency Taxonomy & Semantic Mapping** (`pipelines/competency_mapping.py`):
   - Maps official designations and uploaded text to MoSPI statistical competency frameworks.
3. **iGOT & NSSTA Recommendation Engine** (`pipelines/recommendation_engine.py`):
   - Hybrid recommendation pipeline matching skill deficits with iGOT Karmayogi modules.
4. **Grounded Assessment Generator** (`pipelines/assessment_generator.py`):
   - Grounded Bloom's Taxonomy-aligned MCQ generation from uploaded learning materials.

---

## 🚀 Running Locally

```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

FastAPI Interactive Docs: `http://localhost:8000/docs`
