"""
Semantic Competency Mapping Pipeline
Embeds free text (job descriptions, uploaded learning material, diagnostic
responses) and ranks it against the platform's actual competency taxonomy —
must stay in sync with server/src/services/module3Seed.service.js (same codes).
"""
import json
import os
from functools import lru_cache

from sentence_transformers import SentenceTransformer, util

from config import MODEL_NAME

_TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "competencies_taxonomy.json")


@lru_cache(maxsize=1)
def _load_taxonomy():
    with open(_TAXONOMY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    flat = []
    for domain in data.get("domains", []):
        for comp in domain.get("competencies", []):
            flat.append({
                "code": comp["code"],
                "name": comp["name"],
                "category": domain.get("name", ""),
                "description": comp.get("description", comp["name"]),
            })
    return flat


@lru_cache(maxsize=1)
def _get_model():
    return SentenceTransformer(MODEL_NAME)


@lru_cache(maxsize=1)
def _get_competency_embeddings():
    taxonomy = _load_taxonomy()
    model = _get_model()
    texts = [f"{c['name']}: {c['description']}" for c in taxonomy]
    embeddings = model.encode(texts, convert_to_tensor=True)
    return taxonomy, embeddings


def map_text_to_competencies(input_text: str, top_k: int = 3):
    """
    Returns the top_k competencies (from the real seeded taxonomy) closest
    to input_text by cosine similarity of sentence embeddings.
    """
    if not input_text or not input_text.strip():
        return []

    taxonomy, competency_embeddings = _get_competency_embeddings()
    model = _get_model()
    query_embedding = model.encode(input_text, convert_to_tensor=True)

    scores = util.cos_sim(query_embedding, competency_embeddings)[0]
    ranked = sorted(zip(taxonomy, scores.tolist()), key=lambda pair: pair[1], reverse=True)

    return [
        {
            "code": comp["code"],
            "name": comp["name"],
            "category": comp["category"],
            "match_score": round(float(score), 4),
        }
        for comp, score in ranked[:top_k]
    ]