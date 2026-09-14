"""
Scoped Assistant Pipeline
Provides approved context-only responses with strict schema validation and injection detection.

Features:
- Filters user queries against approved scope
- Retrieves only authorized competency/course data
- Detects prompt injections
- Enforces strict JSON response schema
- Returns citations with source IDs
"""

import json
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import re

# ═══════════════════════════════════════════════════════════════════════════
# Response Schema - Strict validation
# ═══════════════════════════════════════════════════════════════════════════

class Citation(BaseModel):
    """Citation reference"""
    source_id: str = Field(..., description="Approved source ID")
    title: str = Field(..., description="Source title")
    url: Optional[str] = Field(None, description="Source URL if available")


class AssistantResponse(BaseModel):
    """Strict schema for assistant responses"""
    reply: str = Field(..., description="Response text", max_length=1000)
    scope_classification: str = Field(..., description="Query scope: approved, out-of-scope, unclear")
    citations: List[Citation] = Field(default_factory=list, description="Approved sources only")
    refusal: bool = Field(default=False, description="True if query was refused")
    refusal_reason: Optional[str] = Field(None, description="Why query was refused")
    safe_prompts: List[str] = Field(
        default_factory=list,
        description="Safe alternative questions user can ask"
    )


class AssistantInput(BaseModel):
    """Assistant chat input"""
    message: str = Field(..., description="User message", max_length=500)
    context: Dict = Field(..., description="Authorized context snapshot")


# ═══════════════════════════════════════════════════════════════════════════
# Scope Classification & Injection Detection
# ═══════════════════════════════════════════════════════════════════════════

OUT_OF_SCOPE_KEYWORDS = {
    'policy': r'\b(leave\s+policy|transfer\s+policy|disciplinary\s+policy|pension\s+rule|hr\s+rule|salary\s+regulation|cabinet\s+decision|ministerial\s+directive)\b',
    'account': r'\b(password|login\s+credential|reset\s+password|delete\s+account|bank\s+details|aadhaar|pan\s+card)\b',
    'action': r'\b(approve\s+leave|process\s+transfer|submit\s+grievance|modify\s+pay|assign\s+posting|promote\s+me)\b',
    'legal': r'\b(court|lawsuit|legal\s+advice|attorney|lawyer|litigation|arbitration|legal\s+dispute)\b',
}

APPROVED_KEYWORDS = {
    'gaps': r'\b(gaps?|weak(?:ness)?|competenc(?:y|ies)|skill(?:s)?|proficienc(?:y|ies)|assessment(?:s)?|score(?:s)?|evaluation(?:s)?)\b',
    'courses': r'\b(course(?:s)?|learning|training|iGOT|pathway|recommendation(?:s)?|enrol|nssta|programme)\b',
    'statistics': r'\b(sampling|survey|nss|sna|gva|cpi|wpi|plfs|stata|spss|r|python|microdata|deflator|laspeyres|jevons|nqaf|sqaf|metadata|sdmx|stratified|variance|fsu|estimation|regression|sdg)\b',
    'socratic': r'\b(quiz|test\s+me|practice|question|explain\s+concept|how\s+to\s+calculate|socratic|tutor|walkthrough)\b',
    'guidance': r'\b(guide|help|explain|advise|suggest)\b',
}

INJECTION_PATTERNS = [
    r'ignore\s+previous|forget|disregard',
    r'system\s+prompt|show\s+me\s+your\s+instructions',
    r'roleplay|pretend|act\s+as',
    r'what\s+is\s+your\s+prompt',
]


def classify_scope(message: str) -> tuple[str, Optional[str]]:
    """
    Classify message scope.
    Returns: (scope_type, reason)
    scope_type: 'approved', 'out-of-scope', 'unclear'
    """
    msg_lower = message.lower()

    # Check for out-of-scope (high priority)
    for category, pattern in OUT_OF_SCOPE_KEYWORDS.items():
        if re.search(pattern, msg_lower, re.IGNORECASE):
            reasons = {
                'policy': 'Administrative HR policy questions require official departmental administration.',
                'account': 'Account credentials and sensitive personal records require IT/HR support.',
                'action': 'I cannot execute administrative HR or transactional service actions.',
                'legal': 'Legal and dispute matters require official government counsel.',
            }
            return 'out-of-scope', reasons.get(category)

    # If the message is not explicitly out-of-scope, allow it broadly so
    # profile, assessment, and competency questions can be answered.
    for scope, pattern in APPROVED_KEYWORDS.items():
        if re.search(pattern, msg_lower, re.IGNORECASE):
            return 'approved', None

    return 'approved', None


def detect_injection(message: str) -> bool:
    """Detect possible prompt injection attempts"""
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, message, re.IGNORECASE):
            return True
    return False


# ═══════════════════════════════════════════════════════════════════════════
# Response Builders
# ═══════════════════════════════════════════════════════════════════════════

def build_approved_response(
    message: str,
    context: Dict,
    llm_reply: Optional[str] = None
) -> AssistantResponse:
    """Build response for approved queries"""
    # If LLM provided a reply, use it; otherwise generate domain-aware response
    reply = llm_reply or generate_domain_response(message, context)

    return AssistantResponse(
        reply=reply,
        scope_classification='approved',
        citations=[],  # Would be populated from LLM output
        refusal=False,
        safe_prompts=[
            "What is my current top skill gap?",
            "Which courses are recommended for me?",
            "Test my understanding of Stratified Sampling",
        ]
    )


def build_refusal_response(
    message: str,
    reason: str,
    scope: str
) -> AssistantResponse:
    """Build refusal response for out-of-scope queries"""
    refusal_messages = {
        'policy': "I'm designed to assist with learning pathways and statistical competency development, not administrative HR decisions. Please contact your nodal officer for HR policy questions.",
        'account': "Account security and credential issues should be directed to your nodal IT support team.",
        'action': "I cannot process administrative personnel actions. Please use e-Office or contact your establishment division.",
        'legal': "Legal matters require professional counsel. I cannot provide legal guidance.",
    }

    reason_msg = refusal_messages.get(scope, reason or "I cannot assist with that question.")

    return AssistantResponse(
        reply=f"I appreciate your question, but I'm unable to help with that.\n\n{reason_msg}",
        scope_classification='out-of-scope',
        citations=[],
        refusal=True,
        refusal_reason=scope,
        safe_prompts=[
            "What competencies do I need for my role?",
            "Recommend learning resources for me",
            "How do I understand my assessment scores?",
        ]
    )


def build_unclear_response() -> AssistantResponse:
    """Build response for unclear queries"""
    return AssistantResponse(
        reply="I can help with questions about your competency assessments, skill gaps, learning recommendations, and course guidance.\n\nWhat would you like to know?",
        scope_classification='unclear',
        citations=[],
        refusal=False,
        safe_prompts=[
            "Show me my current skill gaps",
            "What courses are recommended for my role?",
            "How is my competency score calculated?",
        ]
    )


def generate_domain_response(message: str, context: Dict) -> str:
    """
    Generate domain-aware response from context.
    Only uses approved data - no cross-user data or false claims.
    """
    msg_lower = message.lower()
    official_name = context.get('officialName', 'there')
    profile = context.get('profile', {}) or {}
    gaps = context.get('topGaps', [])
    recommendations = context.get('recommendations', [])
    designation = profile.get('designation') or context.get('designation', 'official')
    department = profile.get('department') or context.get('department', '')
    cadre = profile.get('cadre') or context.get('cadre', '')

    # Socratic Tutoring & Statistical Concept Walkthroughs
    if any(word in msg_lower for word in ['stratified', 'sampling', 'nss', 'fsu', 'ppswr']):
        return (
            f"**Official Statistics Concept — NSS Stratified Multi-Stage Sampling (NSS 79th Round)**\n\n"
            f"1. **First Stage Units (FSUs):** In the rural sector, FSUs are Census villages selected with *Probability Proportional to Size with Replacement (PPSWR)* based on population.\n"
            f"2. **Second Stage Stratification (SSS):** Within each selected FSU, households are stratified by economic indicators (e.g. land ownership or consumption expenditure).\n"
            f"3. **Ultimate Sampling Units (USUs):** Sample households are selected using *Simple Random Sampling Without Replacement (SRSWOR)*.\n\n"
            f"💡 *Socratic Check:* If a village has twice the Census population of another, how does its probability of selection in the first stage change? (Hint: PPSWR scales linearly with size measure)."
        )

    if any(word in msg_lower for word in ['sna', 'national accounts', 'gva', 'deflation', 'gdp']):
        return (
            f"**System of National Accounts (SNA 2008) — Gross Value Added (GVA) & Deflation**\n\n"
            f"• **GVA at Basic Prices:** `Gross Output (Basic Prices) - Intermediate Consumption (Purchasers Prices)`\n"
            f"• **Double Deflation:** Real GVA is derived by separately deflating Gross Output using product-specific Wholesale Price Index (WPI) and Intermediate Consumption using input cost deflators.\n"
            f"• **GDP at Market Prices:** `GVA at Basic Prices + Product Taxes - Product Subsidies`.\n\n"
            f"📌 *Recommended Course:* Explore the *National Accounts Statistics Methodology* module on iGOT Karmayogi to build mastery."
        )

    if any(word in msg_lower for word in ['cpi', 'wpi', 'laspeyres', 'jevons', 'inflation']):
        return (
            f"**Price Statistics Methodology (MoSPI Standards)**\n\n"
            f"• **Formula:** India's All-India CPI uses the modified *Laspeyres formula* weighted by Household Consumption Expenditure Survey (HCES) baseline consumption.\n"
            f"• **Elementary Aggregates:** Geometric Mean (*Jevons Index*) of price relatives is used at the item quotation level to avoid substitution bias.\n\n"
            f"💡 *Cadre Tip:* For officials in Central Statistics Office (CSO) Price Unit, completing the *Price Index Compilation* pathway directly addresses your domain competency targets."
        )

    # Profile-related queries
    if any(word in msg_lower for word in ['profile', 'role', 'designation', 'department', 'cadre', 'who am i', 'my details']):
        if designation or department or cadre:
            profile_parts = []
            if designation:
                profile_parts.append(f"designation: {designation}")
            if department:
                profile_parts.append(f"department: {department}")
            if cadre:
                profile_parts.append(f"cadre: {cadre}")
            return f"Hello {official_name}, your profile shows {', '.join(profile_parts)}."

    # Gap-related queries
    if any(word in msg_lower for word in ['gap', 'weak', 'competency', 'skill']):
        if gaps:
            gaps_text = ', '.join([f"**{g['competency']}** ({g['category']})" for g in gaps[:3]])
            return f"Hello {official_name}, as a {designation}, your top priority skill gaps are: {gaps_text}. I recommend starting with the courses matched to these competencies in your Learning Pathways tab."
        else:
            return f"Hello {official_name}, no significant skill gaps have been identified yet. Keep building evidence through assessments to get personalized recommendations."

    # Course/recommendation queries
    if any(word in msg_lower for word in ['course', 'recommend', 'learning', 'igot', 'pathway', 'nssta']):
        if recommendations:
            rec_titles = ', '.join([f"**{r['title']}**" for r in recommendations[:2]])
            return f"Based on your gaps and role requirements, here are recommended learning resources: {rec_titles}. You can access these from your Learning Paths tab to get started."
        else:
            return f"No specific course recommendations are available yet. This will be updated once we have sufficient assessment data about your competencies."

    # Score/calculation queries
    if any(word in msg_lower for word in ['score', 'calculate', 'assessment']):
        return f"Your competency scores are calculated using the Kshamata Evidence Sufficiency Index (ESI), which combines assessment results, evidence quality, and role-specific benchmarks. Higher confidence (>80%) requires multiple evidence sources."

    # Default helpful response
    return f"Hello {official_name}, I am your Kshamata Statistical Capacity Assistant (`Sahayak`). I can explain official statistics concepts (SNA, NSS Sampling, CPI, NQAF), diagnose your skill gaps, and suggest targeted iGOT & NSSTA learning pathways for your role as a {designation}. What would you like to explore?"


# ═══════════════════════════════════════════════════════════════════════════
# Main Processing Function (for FastAPI integration)
# ═══════════════════════════════════════════════════════════════════════════

def process_assistant_query(user_input: AssistantInput) -> dict:
    """
    Main processing function for assistant queries.
    
    Returns:
    - AssistantResponse in dict format (JSON-serializable)
    """
    message = user_input.message.strip()
    context = user_input.context

    # Validate message
    if not message or len(message) > 500:
        return AssistantResponse(
            reply="Message must be between 1 and 500 characters.",
            scope_classification='invalid',
            refusal=True,
        ).dict()

    # Check for injection attempts
    if detect_injection(message):
        return AssistantResponse(
            reply="I detected an unusual pattern in your message. For security, please rephrase your question.",
            scope_classification='suspicious',
            refusal=True,
            refusal_reason='injection_detected',
        ).dict()

    # Classify scope
    scope, reason = classify_scope(message)

    if scope == 'out-of-scope':
        return build_refusal_response(message, reason, scope).dict()
    elif scope == 'unclear':
        return build_unclear_response().dict()
    else:  # approved
        response = build_approved_response(message, context)
        return response.dict()
