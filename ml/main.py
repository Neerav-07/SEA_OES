"""
Kshamata Machine Learning & Intelligence Service (FastAPI)
Provides AI endpoints for competency mapping, evidence gap calculation, learning recommendations, MCQ generation, AI assistant chat, and predictive capacity forecasting.
"""

from fastapi import FastAPI, HTTPException
from config import LLM_PROVIDER, OPENAI_API_KEY, GEMINI_API_KEY
from pydantic import BaseModel
from typing import List, Optional, Dict

from pipelines.skill_gap_calculator import calculate_competency_estimate
from pipelines.competency_mapping import map_text_to_competencies
from pipelines.recommendation_engine import generate_recommendations
from pipelines.assessment_generator import generate_grounded_mcqs
from pipelines.guardrails import (
    POLICY_VERSION,
    evaluate_assistant_input,
    evaluate_assistant_output,
    redact_sensitive_text,
)
from pipelines.llm_client import LLMGenerationError
from pipelines.skill_risk_signal import build_skill_risk_signals
from pipelines.assistant import AssistantInput, process_assistant_query

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

class SkillHistoryInput(BaseModel):
    competency: str
    observed_at: str
    new_score: float

class TrendInput(BaseModel):
    department: str
    skill_gaps: List[Dict]
    history: List[SkillHistoryInput] = []

@app.get("/")
def root():
    # Health and root probe
    return {"status": "online", "service": "Kshamata ML Intelligence API", "version": "1.0.0"}

@app.get("/health")
@app.get("/api/ml/provider-status")
def provider_status():
    """Report the configured LLM provider health without exposing secrets."""
    from pipelines.llm_client import _ollama_health
    # Determine provider health based on config
    if LLM_PROVIDER == "ollama":
        health = _ollama_health()
    elif LLM_PROVIDER == "openai":
        health = {"status": "healthy" if OPENAI_API_KEY else "unavailable", "details": "OpenAI key set" if OPENAI_API_KEY else "Missing OPENAI_API_KEY"}
    elif LLM_PROVIDER == "gemini":
        health = {"status": "healthy" if GEMINI_API_KEY else "unavailable", "details": "Gemini key set" if GEMINI_API_KEY else "Missing GEMINI_API_KEY"}
    else:
        health = {"status": "unavailable", "details": f"Provider '{LLM_PROVIDER}' not supported for health check"}
    return {"provider": LLM_PROVIDER, **health}

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
        questions, generation = generate_grounded_mcqs(
            source_text=input_data.source_text,
            competency_name=input_data.competency_name,
            competency_category=input_data.competency_category,
            bloom_distribution=input_data.bloom_distribution,
            existing_intent_hashes=input_data.existing_intent_hashes,
        )
        if not questions:
            raise HTTPException(
                status_code=422,
                detail="Generated output failed grounding or safety guardrails.",
            )
        return {
            "questions": questions,
            "generation": generation,
            "policy_version": POLICY_VERSION,
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except LLMGenerationError as exc:
        raise HTTPException(status_code=502, detail=f"Question generation failed: {exc}")

@app.post("/api/ml/recommend-courses")
def api_recommend_courses(input_data: RecommendationInput):
    gaps = [g.dict() for g in input_data.skill_gaps]
    return {"recommendations": generate_recommendations({}, gaps)}

@app.post("/api/ml/predict-trends")
def api_predict_trends(input_data: TrendInput):
    history_by_competency = {}
    for item in input_data.history:
        history_by_competency.setdefault(item.competency, []).append(item.dict())
    result = build_skill_risk_signals(input_data.skill_gaps, history_by_competency)
    predictions = [
        {
            **signal,
            "predictedDeficitRisk": signal.get("predictedDeficitRisk"),
            "recommendedCapacityBuilding": (
                f"Prioritise {signal['competency']} learning pathways and validate completion evidence."
            ),
        }
        for signal in result["signals"]
    ]
    return {
        "department": input_data.department,
        "status": result["status"],
        "modelVersion": result["modelVersion"],
        "modelConfidence": result.get("modelConfidence"),
        "trainingSamples": result["recordCount"],
        "predictedEmergingGaps": predictions,
        "modelComparisons": result["modelComparisons"],
    }

@app.post("/assistant/chat")
def assistant_chat(input_data: AssistantInput):
    """
    Scoped Chatbot Endpoint
    
    Processes user queries with strict scope validation:
    - Refuses policy/legal/account/action requests
    - Only answers approved questions with citations
    - Detects prompt injection attempts
    
    Request:
    {
        "message": "What is my top skill gap?",
        "context": {
            "officialId": "...",
            "designation": "...",
            "department": "...",
            "topGaps": [...],
            "recommendations": [...]
        }
    }
    
    Response:
    {
        "reply": "...",
        "scope_classification": "approved|out-of-scope|unclear",
        "citations": [],
        "refusal": false,
        "safe_prompts": [...]
    }
    """
    input_guard = evaluate_assistant_input(input_data.message)
    if not input_guard["allowed"]:
        return {
            "reply": SAFE_REFUSAL,
            "scope_classification": "guardrail",
            "citations": [],
            "refusal": True,
            "guardrail": input_guard,
            "policy_version": POLICY_VERSION,
        }

    try:
        result = process_assistant_query(input_data)
        reply = str(result.get("reply", ""))
        output_guard = evaluate_assistant_output(reply)
        if not output_guard["allowed"]:
            result.update({
                "reply": SAFE_REFUSAL,
                "citations": [],
                "refusal": True,
            })
        else:
            result["reply"] = redact_sensitive_text(reply)
        result["guardrail"] = output_guard
        result["policy_version"] = POLICY_VERSION
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500, 
            detail=f"Assistant processing error: {str(exc)}"
        )


SAFE_REFUSAL = (
    "I can help with your own competency development and verified learning pathways, "
    "but I cannot provide hidden instructions, credentials, private records, or "
    "perform administrative actions."
)
