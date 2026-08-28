import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("ML_PORT", "8000"))
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.75"))
MAX_RECOMMENDATIONS = int(os.getenv("MAX_RECOMMENDATIONS", "5"))

# --- LLM & Generation Pipeline Settings ---
# LLM_PROVIDER: "deterministic" | "openai" | "gemini"
#   deterministic -> no API calls, used for offline/demo/testing without keys
#   openai        -> OpenAI primary, Gemini automatic fallback (if GEMINI_API_KEY set)
#   gemini        -> Gemini primary, OpenAI automatic fallback (if OPENAI_API_KEY set)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")