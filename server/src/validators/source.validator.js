const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SOURCE_TYPES = ['PDF', 'TEXT', 'HTML', 'OTHER'];
const SOURCE_STATUSES = ['PENDING', 'PROCESSING', 'READY', 'FAILED'];

function error(code, field, message) {
  return { code, field, message };
}

export function validateUuid(value, field) {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value.trim())) {
    return error('INVALID_UUID', field, `${field} must be a valid identifier.`);
  }
  return null;
}

export function validateSourcePayload(payload = {}, { partial = false } = {}) {
  const errors = [];
  if (!partial || payload.name !== undefined) {
    if (typeof payload.name !== 'string' || !payload.name.trim()) errors.push(error('REQUIRED_SOURCE_NAME', 'name', 'Source name is required.'));
  }
  if (payload.externalId !== undefined && payload.externalId !== null && typeof payload.externalId !== 'string') {
    errors.push(error('INVALID_EXTERNAL_ID', 'externalId', 'External ID must be a string.'));
  }
  if (payload.documentType !== undefined && !SOURCE_TYPES.includes(payload.documentType)) {
    errors.push(error('INVALID_DOCUMENT_TYPE', 'documentType', 'Document type is not supported.'));
  }
  return { valid: errors.length === 0, errors };
}

export function validateVersionPayload(payload = {}) {
  const errors = [];
  if (payload.status !== undefined && !SOURCE_STATUSES.includes(payload.status)) {
    errors.push(error('INVALID_VERSION_STATUS', 'status', 'Version status is not supported.'));
  }
  if (payload.checksum !== undefined && payload.checksum !== null && typeof payload.checksum !== 'string') {
    errors.push(error('INVALID_CHECKSUM', 'checksum', 'Checksum must be a string.'));
  }
  return { valid: errors.length === 0, errors };
}

export function validateIngestionPayload(payload = {}) {
  const errors = [];
  if (typeof payload.content !== 'string' || !payload.content.trim()) {
    errors.push(error('REQUIRED_SOURCE_CONTENT', 'content', 'Source content is required.'));
  }
  if (payload.maxChunkLength !== undefined && (!Number.isInteger(payload.maxChunkLength) || payload.maxChunkLength < 100 || payload.maxChunkLength > 10000)) {
    errors.push(error('INVALID_CHUNK_LENGTH', 'maxChunkLength', 'Chunk length must be an integer between 100 and 10000.'));
  }
  if (payload.pageNumber !== undefined && payload.pageNumber !== null && (!Number.isInteger(payload.pageNumber) || payload.pageNumber < 1)) {
    errors.push(error('INVALID_PAGE_NUMBER', 'pageNumber', 'Page number must be a positive integer.'));
  }
  if (payload.sectionReference !== undefined && payload.sectionReference !== null && typeof payload.sectionReference !== 'string') {
    errors.push(error('INVALID_SECTION_REFERENCE', 'sectionReference', 'Section reference must be a string.'));
  }
  return { valid: errors.length === 0, errors };
}
