const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function diagnostic(code, field, message) { return { code, field, message }; }

export function validateUuid(value, field) {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value.trim())) return diagnostic('INVALID_UUID', field, `${field} must be a valid identifier.`);
  return null;
}

export function validateRetrievalRequest(payload = {}) {
  const errors = [];
  for (const field of ['competencyId', 'claimId', 'learningObjectiveId']) {
    if (payload[field] !== undefined && payload[field] !== null) {
      const issue = validateUuid(payload[field], field);
      if (issue) errors.push(issue);
    }
  }
  if (payload.query !== undefined && typeof payload.query !== 'string') errors.push(diagnostic('INVALID_QUERY', 'query', 'Query must be a string.'));
  if (payload.limit !== undefined && (!Number.isInteger(payload.limit) || payload.limit < 1 || payload.limit > 50)) errors.push(diagnostic('INVALID_LIMIT', 'limit', 'Limit must be an integer between 1 and 50.'));
  if (payload.sourceDocumentIds !== undefined && (!Array.isArray(payload.sourceDocumentIds) || payload.sourceDocumentIds.some((id) => validateUuid(id, 'sourceDocumentIds')))) errors.push(diagnostic('INVALID_SOURCE_DOCUMENT_IDS', 'sourceDocumentIds', 'Source document IDs must be valid identifiers.'));
  if (payload.sourceVersionIds !== undefined && (!Array.isArray(payload.sourceVersionIds) || payload.sourceVersionIds.some((id) => validateUuid(id, 'sourceVersionIds')))) errors.push(diagnostic('INVALID_SOURCE_VERSION_IDS', 'sourceVersionIds', 'Source version IDs must be valid identifiers.'));
  return { valid: errors.length === 0, errors };
}

export function validateGenerationRequest(payload = {}) {
  const errors = [];
  const blueprintIssue = validateUuid(payload.blueprintId, 'blueprintId');
  if (blueprintIssue) errors.push(blueprintIssue);
  for (const field of ['claimId', 'learningObjectiveId', 'assessmentId']) {
    if (payload[field] !== undefined && payload[field] !== null) {
      const issue = validateUuid(payload[field], field);
      if (issue) errors.push(issue);
    }
  }
  if (payload.questionType !== undefined && !['MCQ', 'SCENARIO'].includes(payload.questionType)) errors.push(diagnostic('UNSUPPORTED_QUESTION_TYPE', 'questionType', 'Question type is not supported.'));
  if (payload.cognitiveLevel !== undefined && !['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE'].includes(payload.cognitiveLevel)) errors.push(diagnostic('UNSUPPORTED_COGNITIVE_LEVEL', 'cognitiveLevel', 'Cognitive level is not supported.'));
  if (payload.query !== undefined && typeof payload.query !== 'string') errors.push(diagnostic('INVALID_QUERY', 'query', 'Query must be a string.'));
  return { valid: errors.length === 0, errors };
}
