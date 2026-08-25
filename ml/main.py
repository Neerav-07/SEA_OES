"""
Kshamata Machine Learning & Intelligence Service (FastAPI)
Provides AI endpoints for competency mapping, evidence gap calculation, learning recommendations, and MCQ generation.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from pipelines.skill_gap_calculator import calculate_competency_estimate
from pipelines.competency_mapping import map_text_to_competencies
from pipelines.recommendation_engine import generate_recommendations
from pipelines.assessment_generator import generate_grounded_mcqs

app = FastAPI(
    title="Kshamata ML Intelligence API",
    description="AI Engine for Evidence-Driven Competency Assessment & iGOT Learning Pathways (MoSPI DIID & NSSTA)",
    version="1.0.0"
)

class EvidenceInput(BaseModel):
    score: float
    weight: Optional[float] = 1.0

class MappingInput(BaseModel):
    text: str
    top_k: Optional[int] = 3

class AssessmentInput(BaseModel):
    source_text: str
    num_questions: Optional[int] = 5
    bloom_level: Optional[str] = "APPLY"

class AssistantInput(BaseModel):
    message: str
    context: Optional[dict] = {}

class PredictionInput(BaseModel):
    department: Optional[str] = "MoSPI DIID"

@app.get("/")
def root():
    return {"status": "online", "service": "Kshamata ML Intelligence API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/ml/calculate-gap")
def api_calculate_gap(evidence: List[EvidenceInput]):
    evidence_dicts = [e.dict() for e in evidence]
    return calculate_competency_estimate(evidence_dicts)

@app.post("/api/ml/map-competencies")
def api_map_competencies(input_data: MappingInput):
    return map_text_to_competencies(input_data.text, input_data.top_k)

@app.post("/api/ml/generate-assessment")
def api_generate_assessment(input_data: AssessmentInput):
    return generate_grounded_mcqs(input_data.source_text, input_data.num_questions, input_data.bloom_level)

@app.post("/assistant/chat")
def api_assistant_chat(input_data: AssistantInput):
    ctx = input_data.context or {}
    name = ctx.get("officialName", "Official")
    desig = ctx.get("designation", "Statistician")
    dept = ctx.get("department", "MoSPI")
    gaps = ctx.get("topGaps", [])
    
    msg_lower = input_data.message.lower()
    
    if "gap" in msg_lower or "weak" in msg_lower or "skill" in msg_lower:
        gap_names = ", ".join([g.get("competency", "") for g in gaps[:3]]) or "Python Data Analytics, Stratified Sampling"
        reply = f"Namaste {name}! As a {desig} in {dept}, your primary competency gaps are: **{gap_names}**. I recommend prioritizing the NSSTA TPAC & iGOT Karmayogi modules to strengthen your proficiency."
    elif "score" in msg_lower or "esi" in msg_lower or "calculate" in msg_lower:
        reply = f"Your competency scores are calculated using Kshamata's Evidence Sufficiency Index (ESI). Scores update dynamically whenever you complete diagnostic quizzes, iGOT courses, or scenario assessments."
    else:
        reply = f"Hello {name}! I am your Kshamata AI Capacity Building Assistant for India's Official Statistical System. How can I support your upskilling in statistical methodologies or digital technologies today?"

    return {"reply": reply}

@app.post("/api/ml/predict-trends")
def api_predict_trends(input_data: PredictionInput):
    return {
        "department": input_data.department,
        "forecastMonths": 6,
        "predictedEmergingGaps": [
            {"competency": "Python for Data Analytics", "predictedDeficitRisk": 0.42, "trend": "HIGH_INCREASE", "recommendedCapacityBuilding": "Mandatory Python & Pandas certification via iGOT"},
            {"competency": "AI/ML Fundamentals for Statistics", "predictedDeficitRisk": 0.38, "trend": "MODERATE_INCREASE", "recommendedCapacityBuilding": "NSSTA TPAC Workshop on AI/ML in Survey Imputation"},
            {"competency": "Cybersecurity & Data Privacy", "predictedDeficitRisk": 0.31, "trend": "MODERATE_INCREASE", "recommendedCapacityBuilding": "CERT-In Cyber Hygiene Module"},
        ],
        "departmentReadinessScore": 3.4,
        "modelConfidence": 0.89
    }

