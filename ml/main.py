"""
Kshamata Machine Learning & Intelligence Service (FastAPI)
Provides AI endpoints for competency mapping, evidence gap calculation, learning recommendations, and MCQ generation.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict

from pipelines.skill_gap_calculator import calculate_competency_estimate
from pipelines.competency_mapping import map_text_to_competencies
from pipelines.recommendation_engine import generate_recommendations
from pipelines.assessment_generator import generate_grounded_mcqs
from pipelines.llm_client import LLMGenerationError

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
    competency_name: Optional[str] = "General Competency"
    competency_category: Optional[str] = "Statistical"
    bloom_distribution: Optional[Dict[str, int]] = None
    existing_intent_hashes: Optional[List[str]] = None

class SkillGapInput(BaseModel):
    competency_code: str
    competency_name: Optional[str] = None
    gap_delta: Optional[float] = 1.0

class RecommendationInput(BaseModel):
    skill_gaps: List[SkillGapInput]

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
    try:
        questions = generate_grounded_mcqs(
            source_text=input_data.source_text,
            competency_name=input_data.competency_name,
            competency_category=input_data.competency_category,
            bloom_distribution=input_data.bloom_distribution,
            existing_intent_hashes=input_data.existing_intent_hashes,
        )
        return {"questions": questions}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except LLMGenerationError as exc:
        raise HTTPException(status_code=502, detail=f"Question generation failed: {exc}")

@app.post("/api/ml/recommend-courses")
def api_recommend_courses(input_data: RecommendationInput):
    gaps = [g.dict() for g in input_data.skill_gaps]
    return {"recommendations": generate_recommendations({}, gaps)}