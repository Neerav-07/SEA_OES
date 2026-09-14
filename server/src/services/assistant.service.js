import { getDb } from '../db/index.js';
import { eq, sql } from 'drizzle-orm';
import { officials, recommendations } from '../db/schema/index.js';

/**
 * Scoped Chatbot Service
 * 
 * Enforces:
 * - Query scope classification (approved vs out-of-scope)
 * - Refusal for policy/legal/account/action requests
 * - Citation tracking from approved sources
 * - Output validation and audit logging
 */

// Out-of-scope patterns that the chatbot should refuse (administrative HR, credential theft, legal)
const OUT_OF_SCOPE_PATTERNS = {
  policy: /\b(leave\s+policy|transfer\s+policy|disciplinary\s+policy|pension\s+rule|hr\s+rule|salary\s+regulation|cabinet\s+decision|ministerial\s+directive)\b/i,
  account: /\b(password|login\s+credential|reset\s+password|delete\s+account|bank\s+details|aadhaar|pan\s+card)\b/i,
  action: /\b(approve\s+leave|process\s+transfer|submit\s+grievance|modify\s+pay|assign\s+posting|promote\s+me)\b/i,
  legal: /\b(court|lawsuit|legal\s+advice|attorney|lawyer|litigation|arbitration|legal\s+dispute)\b/i,
  suspicious: /\b(ignore\s+previous|bypass\s+security|override\s+system|disable\s+security|hack|exploit|backdoor|sql\s+injection)\b/i,
};

// Approved scope patterns that the chatbot can answer
const APPROVED_SCOPE_PATTERNS = {
  gaps: /\b(gaps?|weak(?:ness)?|competenc(?:y|ies)|skill(?:s)?|proficienc(?:y|ies)|assessments?|score(?:s)?|evaluation(?:s)?)\b/i,
  courses: /\b(course(?:s)?|learning|training|module|material|resource|iGOT|enrol|pathway|recommendation(?:s)?|nssta|programme)\b/i,
  statistics: /\b(sampling|survey|nss|sna|gva|cpi|wpi|plfs|stata|spss|r|python|microdata|deflator|laspeyres|jevons|nqaf|sqaf|metadata|sdmx|stratified|variance|fsu|estimation|regression|sdg)\b/i,
  socratic: /\b(quiz|test\s+me|practice|question|explain\s+concept|how\s+to\s+calculate|socratic|tutor|walkthrough)\b/i,
  guidance: /\b(guide|help|how\s+to|explain|suggest|advise|tips|strategy|approach|method)\b/i,
  profile: /\b(profile|designation|role|department|cadre|background)\b/i,
};

/**
 * Classify if a user query is within approved scope
 * Returns: { isApproved: boolean, reason: string, scope?: string }
 */
export function classifyQueryScope(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') {
    return { isApproved: false, reason: 'Invalid message format.' };
  }

  const msgLower = userMessage.toLowerCase();

  // Check for out-of-scope first (higher priority)
  for (const [category, pattern] of Object.entries(OUT_OF_SCOPE_PATTERNS)) {
    if (pattern.test(msgLower)) {
      return {
        isApproved: false,
        reason: `I cannot assist with ${category} requests. Please contact your HR or IT administrator.`,
        scope: 'out-of-scope',
        category,
      };
    }
  }

  // Check for approved scope. If the message is not explicitly out-of-scope,
  // allow it so profile, assessment, and competency questions are answered.
  for (const [scope, pattern] of Object.entries(APPROVED_SCOPE_PATTERNS)) {
    if (pattern.test(msgLower)) {
      return { isApproved: true, reason: 'Query within approved scope.', scope };
    }
  }

  return {
    isApproved: true,
    reason: 'Query within approved scope.',
    scope: 'general',
  };
}

/**
 * Detect prompt injection attempts
 * Returns: { isSuspicious: boolean, reasons: string[] }
 */
export function detectInjectionAttempts(userMessage) {
  const suspiciousPatterns = [
    /ignore\s+previous|forget|disregard/i,
    /system\s+prompt|system\s+message|instructions|you\s+are\s+now/i,
    /roleplay|pretend|act\s+as|imagine\s+you/i,
    /what\s+is\s+your\s+prompt|show\s+me\s+your\s+instructions/i,
  ];

  const reasons = [];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userMessage)) {
      reasons.push('Possible prompt injection detected.');
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Build authorized context snapshot for the user
 * Only includes approved data (gaps, recommendations, profile)
 */
export async function buildAuthorizedContext(official, userId, officialName = 'there') {
  try {
    const db = getDb();

    // Fetch only approved competency gaps (not raw profile data)
    const gapsResult = await db.execute(sql`
      SELECT 
        sg.id,
        sg.competency_id,
        c.name AS competency_name,
        c.code AS competency_code,
        sg.gap_severity,
        sg.learning_priority,
        sg.category
      FROM skill_gaps sg
      JOIN competencies c ON sg.competency_id = c.id
      WHERE sg.official_id = ${official.id}
      ORDER BY sg.learning_priority DESC, sg.gap_severity DESC
      LIMIT 5
    `);

    const gaps = (gapsResult.rows || gapsResult).map(g => ({
      id: g.competency_id,
      competency: g.competency_name,
      code: g.competency_code,
      severity: g.gap_severity,
      priority: g.learning_priority,
      category: g.category,
    }));

    // Fetch recommendations using the live recommendations schema
    const recsResult = await db.execute(sql`
      SELECT 
        r.id,
        r.title,
        r.provider,
        r.reason,
        r.course_id,
        r.status,
        r.created_at
      FROM recommendations r
      WHERE r.official_id = ${official.id}
        AND r.status IN ('RECOMMENDED', 'ENROLLED', 'COMPLETED')
      ORDER BY r.created_at DESC
      LIMIT 3
    `);

    const recommendations_list = (recsResult.rows || recsResult).map(r => ({
      id: r.id,
      title: r.title,
      provider: r.provider,
      reason: r.reason,
      sourceId: r.course_id,
    }));

    return {
      officialId: official.id,
      officialName,
      designation: official.designation,
      department: official.department,
      cadre: official.cadre || 'General',
      roleContext: `${official.designation} in ${official.department}`,
      profile: {
        name: officialName,
        designation: official.designation,
        department: official.department,
        cadre: official.cadre || 'General',
      },
      topGaps: gaps,
      recommendations: recommendations_list,
      lastUpdated: new Date().toISOString(),
      dataMode: 'APPROVED_ONLY', // Mark as only approved data
    };
  } catch (error) {
    console.error('Error building authorized context:', error);
    return {
      error: 'Could not retrieve full context.',
      dataMode: 'PARTIAL',
    };
  }
}

/**
 * Extract citations from ML response
 * Returns: { citations: Array<{sourceId, title, url}>, textWithoutCitations: string }
 */
export function extractCitations(mlResponse) {
  const citations = [];
  let textWithoutCitations = mlResponse;

  // Pattern: [source:ID:Title:URL] or [citation:ID]
  const citationPattern = /\[(?:source|citation):([^:]+):?([^:]*):?([^\]]*)\]/g;
  let match;

  while ((match = citationPattern.exec(mlResponse)) !== null) {
    const [fullMatch, sourceId, title, url] = match;
    citations.push({
      sourceId,
      title: title || 'Approved Source',
      url: url || null,
    });
    textWithoutCitations = textWithoutCitations.replace(fullMatch, '');
  }

  return {
    citations,
    text: textWithoutCitations.trim(),
  };
}

/**
 * Validate that response doesn't contain cross-user data or iGOT claims
 * Returns: { isValid: boolean, violations: string[] }
 */
export function validateOutput(responseText, officialId) {
  const violations = [];

  // Check for cross-user data exposure
  if (/other official|another official|colleague|peer|manager|supervisor/i.test(responseText)) {
    violations.push('Response contains potential cross-user data.');
  }

  // Check for unsupported iGOT claims
  if (/(live\s+iGOT|real\s+iGOT|actual\s+enrollment|official\s+enrollment)/i.test(responseText)) {
    violations.push('Response claims unsupported live iGOT action.');
  }

  // Check for action claims the chatbot cannot perform
  if (/(i\s+have\s+enrolled|i\s+have\s+approved|i\s+have\s+assigned)/i.test(responseText)) {
    violations.push('Response falsely claims to have taken action.');
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Audit log for all assistant interactions
 */
export async function auditAssistantInteraction(
  officialId,
  userMessage,
  assistantReply,
  scopeClassification,
  citations = []
) {
  try {
    const db = getDb();
    const auditEntry = {
      officialId,
      userMessage,
      assistantReply,
      scopeClassification: scopeClassification.scope || 'unknown',
      citationCount: citations.length,
      refusal: !scopeClassification.isApproved,
      timestamp: new Date().toISOString(),
    };

    // Save to audit log (non-blocking)
    db.execute(sql`
      INSERT INTO audit_logs (actor_id, action_type, target_entity, metadata)
      VALUES (${String(officialId)}, 'ASSISTANT_INTERACTION', 'assistant_chat', ${JSON.stringify(auditEntry)})
    `).catch(err => {
      console.warn('Assistant audit log save warning:', err.message);
    });
  } catch (error) {
    console.warn('Audit logging error:', error.message);
  }
}

/**
 * Generate refusal message with safe next steps
 */
export function generateRefusalMessage(scopeClassification, officialName) {
  if (!scopeClassification.isApproved) {
    return `Hello ${officialName}, ${scopeClassification.reason}

**Safe topics I can help with:**
- Your current skill gaps and competency assessments
- Recommended learning pathways and courses
- Understanding how your scores are calculated
- Guidance on assessment strategies
- Course enrolment information

For other requests, please contact your administrator.`;
  }
  return null;
}

/**
 * Generate response with citations
 */
export function formatResponseWithCitations(responseText, citations) {
  if (!citations || citations.length === 0) {
    return responseText;
  }

  const citationsBlock = citations
    .map(c => `- **${c.title}** ${c.url ? `([Link](${c.url}))` : ''}`)
    .join('\n');

  return `${responseText}

---
**Sources:**
${citationsBlock}`;
}
