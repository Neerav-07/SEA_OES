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
import time
import uuid
from dataclasses import asdict, dataclass

import httpx

from openai import OpenAI
from google import genai
from google.genai import types as genai_types

from config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    GEMINI_API_KEY,
    GEMINI_MODEL,
    LLM_PROVIDER,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    OLLAMA_TIMEOUT,
)

logger = logging.getLogger("llm_client")

PROMPT_VERSION = "2026-09-05.1"

_openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
_gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


class LLMGenerationError(Exception):
    """Raised when LLM_PROVIDER is deterministic, or when both real providers fail."""


@dataclass(frozen=True)
class LLMMetadata:
    request_id: str
    use_case: str
    provider: str
    model: str
    prompt_version: str
    latency_ms: int
    fallback_from: str | None
    generation_parameters: dict


def _metadata(*, request_id: str, use_case: str, provider: str, started: float, fallback_from: str | None, parameters: dict) -> dict:
    model = {
        "openai": OPENAI_MODEL,
        "gemini": GEMINI_MODEL,
        "ollama": OLLAMA_MODEL,
    }[provider]
    return asdict(LLMMetadata(
        request_id=request_id,
        use_case=use_case,
        provider=provider,
        model=model,
        prompt_version=PROMPT_VERSION,
        latency_ms=round((time.monotonic() - started) * 1000),
        fallback_from=fallback_from,
        generation_parameters=parameters,
    ))


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


def _call_ollama(system_prompt: str, user_prompt: str) -> str:
    """Call the configured local Ollama model for structured JSON output."""
    try:
        response = httpx.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": f"{system_prompt}\n\n{user_prompt}",
                "stream": False,
                "options": {"temperature": 0.0},
                "format": "json",
            },
            timeout=OLLAMA_TIMEOUT,
        )
        response.raise_for_status()
        return response.json().get("response", "{}")
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Ollama request failed: {exc}") from exc


def _ollama_health() -> dict:
    """Check whether the configured Ollama instance is reachable."""
    try:
        response = httpx.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=OLLAMA_TIMEOUT)
        response.raise_for_status()
        return {"status": "healthy", "details": "Ollama reachable"}
    except Exception as exc:  # noqa: BLE001
        return {"status": "unavailable", "details": str(exc)}


_PROVIDERS = {"openai": _call_openai, "gemini": _call_gemini, "ollama": _call_ollama}


def _call_openai_text(system_prompt: str, user_prompt: str) -> str:
    if not _openai_client:
        raise RuntimeError("OPENAI_API_KEY not configured")
    response = _openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
    )
    return response.choices[0].message.content


def _call_gemini_text(system_prompt: str, user_prompt: str) -> str:
    if not _gemini_client:
        raise RuntimeError("GEMINI_API_KEY not configured")
    response = _gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=user_prompt,
        config=genai_types.GenerateContentConfig(
            system_instruction=system_prompt,
        ),
    )
    return response.text


_TEXT_PROVIDERS = {"openai": _call_openai_text, "gemini": _call_gemini_text}

def call_llm_text_with_metadata(system_prompt: str, user_prompt: str, *, use_case: str = "assistant") -> tuple[str, dict]:
    """Invokes LLM for natural text responses with provider fallback."""
    if LLM_PROVIDER not in _TEXT_PROVIDERS:
        raise LLMGenerationError(f"LLM_PROVIDER is '{LLM_PROVIDER}'")

    providers = (LLM_PROVIDER, "gemini" if LLM_PROVIDER == "openai" else "openai")
    request_id = str(uuid.uuid4())
    started = time.monotonic()
    for provider_name in providers:
        try:
            output = _TEXT_PROVIDERS[provider_name](system_prompt, user_prompt)
            return output, _metadata(
                request_id=request_id,
                use_case=use_case,
                provider=provider_name,
                started=started,
                fallback_from=LLM_PROVIDER if provider_name != LLM_PROVIDER else None,
                parameters={"temperature": 0.7},
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("LLM text provider '%s' failed: %s", provider_name, exc)

    raise LLMGenerationError("All LLM text providers failed.")


def call_llm_text(system_prompt: str, user_prompt: str) -> str:
    output, _ = call_llm_text_with_metadata(system_prompt, user_prompt)
    return output


def call_llm_json_with_metadata(system_prompt: str, user_prompt: str, *, use_case: str = "assessment_generation") -> tuple[dict, dict]:
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
            f"LLM_PROVIDER is '{LLM_PROVIDER}' — no LLM call made (set to 'openai', 'gemini', or 'ollama' to generate real questions)"
        )

    if LLM_PROVIDER == "ollama":
        providers = ("ollama",)
    else:
        providers = (LLM_PROVIDER, "gemini" if LLM_PROVIDER == "openai" else "openai")
    errors = {}
    request_id = str(uuid.uuid4())
    started = time.monotonic()

    for provider_name in providers:
        for attempt in range(2):  # 1 retry on transient failures
            try:
                raw = _PROVIDERS[provider_name](system_prompt, user_prompt)
                return json.loads(raw), _metadata(
                    request_id=request_id,
                    use_case=use_case,
                    provider=provider_name,
                    started=started,
                    fallback_from=LLM_PROVIDER if provider_name != LLM_PROVIDER else None,
                    parameters={"temperature": 0.6, "response_format": "json"},
                )
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


def call_llm_json(system_prompt: str, user_prompt: str) -> dict:
    output, _ = call_llm_json_with_metadata(system_prompt, user_prompt)
    return output
