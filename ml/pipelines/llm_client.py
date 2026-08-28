"""
Hybrid LLM Client
LLM_PROVIDER="deterministic" -> raises immediately, caller must handle (no keys needed).
LLM_PROVIDER="openai"        -> tries OpenAI first, falls back to Gemini on failure.
LLM_PROVIDER="gemini"        -> tries Gemini first, falls back to OpenAI on failure.
Both real providers are instructed to return strict JSON so the caller can parse
deterministically.
"""
import json
import logging

from openai import OpenAI
from google import genai
from google.genai import types as genai_types

from config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    GEMINI_API_KEY,
    GEMINI_MODEL,
    LLM_PROVIDER,
)

logger = logging.getLogger("llm_client")

_openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
_gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


class LLMGenerationError(Exception):
    """Raised when LLM_PROVIDER is deterministic, or when both real providers fail."""


def _call_openai(system_prompt: str, user_prompt: str) -> str:
    if not _openai_client:
        raise RuntimeError("OPENAI_API_KEY not configured")
    response = _openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.6,
    )
    return response.choices[0].message.content


def _call_gemini(system_prompt: str, user_prompt: str) -> str:
    if not _gemini_client:
        raise RuntimeError("GEMINI_API_KEY not configured")
    # Note: temperature/top_p/top_k are deprecated on current Gemini models —
    # deliberately not set here.
    response = _gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=user_prompt,
        config=genai_types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
        ),
    )
    return response.text


_PROVIDERS = {"openai": _call_openai, "gemini": _call_gemini}


import time


def call_llm_json(system_prompt: str, user_prompt: str) -> dict:
    """
    Respects LLM_PROVIDER from config:
      - "deterministic": raises LLMGenerationError immediately (no API calls made)
      - "openai" / "gemini": tries that provider first (with one retry on
        transient errors like 503/429), then auto-falls back to the other
        provider on failure. Both providers' errors are reported, not just
        the last one — demand-spike 503s are usually temporary but if BOTH
        providers fail you need to see why each one failed, not just the
        last attempt.
    """
    if LLM_PROVIDER not in _PROVIDERS:
        raise LLMGenerationError(
            f"LLM_PROVIDER is '{LLM_PROVIDER}' — no LLM call made (set to 'openai' or 'gemini' to generate real questions)"
        )

    fallback = "gemini" if LLM_PROVIDER == "openai" else "openai"
    errors = {}

    for provider_name in (LLM_PROVIDER, fallback):
        for attempt in range(2):  # 1 retry on transient failures
            try:
                raw = _PROVIDERS[provider_name](system_prompt, user_prompt)
                return json.loads(raw)
            except Exception as exc:  # noqa: BLE001
                is_transient = any(code in str(exc) for code in ("503", "429", "UNAVAILABLE", "RESOURCE_EXHAUSTED"))
                logger.warning("LLM provider '%s' attempt %d failed: %s", provider_name, attempt + 1, exc)
                errors[provider_name] = str(exc)
                if is_transient and attempt == 0:
                    time.sleep(2)
                    continue
                break  # non-transient, or already retried once — move to fallback provider

    raise LLMGenerationError(
        f"Both LLM providers failed. openai: {errors.get('openai', 'not attempted')} | "
        f"gemini: {errors.get('gemini', 'not attempted')}"
    )