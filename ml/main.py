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
