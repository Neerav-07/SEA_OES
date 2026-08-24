"""
Kshamata ML Service Configuration
"""
import os

PORT = int(os.getenv("ML_PORT", "8000"))
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.75"))
MAX_RECOMMENDATIONS = int(os.getenv("MAX_RECOMMENDATIONS", "5"))
