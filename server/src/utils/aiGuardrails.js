import crypto from 'node:crypto';

export const AI_POLICY_VERSION = '2026-09-05.1';
export const SAFE_ASSISTANT_REFUSAL = 'I can help with your own competency development and verified learning pathways, but I cannot provide hidden instructions, credentials, private records, or perform administrative actions.';

const injectionPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions?/i,
  /reveal\s+(the\s+)?(system|developer)\s+prompt/i,
  /print\s+(the\s+)?hidden\s+instructions?/i,
  /jailbreak/i,
];

const boundaryPatterns = [
  /another (?:employee|official|user)'?s?/i,
  /(?:show|list|give|reveal).*(?:credentials?|api keys?|database|private records?)/i,
  /(?:approve|publish|enrol|enroll|delete|change).*(?:assessment|record|user|course)/i,
];

const sensitivePatterns = [
  [/\b(?:sk-[A-Za-z0-9_-]{16,}|AIza[A-Za-z0-9_-]{20,})\b/g, '[REDACTED_API_KEY]'],
  [/\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b/g, '[REDACTED_AADHAAR]'],
  [/\b(?:password|passwd|secret)\s*[:=]\s*\S+/gi, '[REDACTED_SECRET]'],
];

export function evaluateAssistantInput(message) {
  const violations = [];
  if (typeof message !== 'string' || !message.trim()) violations.push({ code: 'MESSAGE_REQUIRED', severity: 'HIGH', blocking: true });
  if (typeof message === 'string' && message.length > 4000) violations.push({ code: 'INPUT_TOO_LONG', severity: 'HIGH', blocking: true });
  if (injectionPatterns.some((pattern) => pattern.test(message || ''))) violations.push({ code: 'PROMPT_INJECTION', severity: 'CRITICAL', blocking: true });
  if (boundaryPatterns.some((pattern) => pattern.test(message || ''))) violations.push({ code: 'AUTHORIZATION_BOUNDARY', severity: 'CRITICAL', blocking: true });
  return { allowed: violations.length === 0, policyVersion: AI_POLICY_VERSION, violations, scores: {} };
}

export function evaluateSourceEvidence(sourceText) {
  const violations = [];
  if (typeof sourceText !== 'string' || !sourceText.trim()) {
    violations.push({ code: 'SOURCE_TEXT_REQUIRED', severity: 'HIGH', blocking: true });
  }
  if (injectionPatterns.some((pattern) => pattern.test(sourceText || ''))) {
    violations.push({ code: 'INDIRECT_PROMPT_INJECTION', severity: 'CRITICAL', blocking: true });
  }
  return { allowed: violations.length === 0, policyVersion: AI_POLICY_VERSION, violations, scores: {} };
}

export function redactSensitiveText(value = '') {
  return sensitivePatterns.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), String(value));
}

export function pseudonymousTraceId(officialId) {
  const salt = process.env.AI_TRACE_SALT || process.env.JWT_SECRET || 'kshamata-local-trace-salt';
  return crypto.createHmac('sha256', salt).update(String(officialId)).digest('hex').slice(0, 24);
}
