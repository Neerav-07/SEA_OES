import { EVIDENCE_TYPES } from '../utils/constants.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// These values are the Bloom terminology already used by the ML prompt and plan.
export const SUPPORTED_COGNITIVE_LEVELS = [
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYZE',
  'EVALUATE',
];

// These are the question types currently represented by the schema and plan.
export const SUPPORTED_QUESTION_TYPES = ['MCQ', 'SCENARIO'];
export const SUPPORTED_EVIDENCE_TYPES = Object.values(EVIDENCE_TYPES);

function diagnostic(code, field, message) {
  return { code, field, message };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function duplicateValues(values) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function validateIdentifier(value, field, requiredCode, invalidCode, label) {
  if (typeof value !== 'string' || !value.trim()) {
    return diagnostic(requiredCode, field, `${label} is required.`);
  }
  if (!UUID_PATTERN.test(value.trim())) {
    return diagnostic(invalidCode, field, `${label} must be a valid identifier.`);
  }
  return null;
}

export function validateTitle(title) {
  if (typeof title !== 'string' || !title.trim()) {
    return diagnostic('REQUIRED_TITLE', 'title', 'Title is required.');
  }
  return null;
}

export function validateCompetencyId(competencyId) {
  return validateIdentifier(
    competencyId,
    'competencyId',
    'REQUIRED_COMPETENCY_ID',
    'INVALID_COMPETENCY_ID',
    'Competency ID',
  );
}

export function validateBlueprintId(blueprintId) {
  return validateIdentifier(
    blueprintId,
    'id',
    'REQUIRED_BLUEPRINT_ID',
    'INVALID_BLUEPRINT_ID',
    'Blueprint ID',
  );
}

export function validateTargetProficiency(targetProficiency) {
  if (targetProficiency === undefined || targetProficiency === null || targetProficiency === '') {
    return diagnostic('REQUIRED_TARGET_PROFICIENCY', 'targetProficiency', 'Target proficiency is required.');
  }
  if (typeof targetProficiency !== 'number' || !Number.isFinite(targetProficiency) || targetProficiency <= 0) {
    return diagnostic('INVALID_TARGET_PROFICIENCY', 'targetProficiency', 'Target proficiency must be a positive finite number.');
  }
  return null;
}

export function validateQuestionCount(questionCount) {
  if (questionCount === undefined || questionCount === null) {
    return diagnostic('REQUIRED_QUESTION_COUNT', 'questionCount', 'Question count is required.');
  }
  if (!Number.isInteger(questionCount) || questionCount <= 0) {
    return diagnostic('INVALID_QUESTION_COUNT', 'questionCount', 'Question count must be a positive integer.');
  }
  return null;
}

export function validateCognitiveDistribution(cognitiveDistribution, questionCount) {
  const errors = [];
  if (!isPlainObject(cognitiveDistribution)) {
    return [diagnostic('INVALID_COGNITIVE_DISTRIBUTION', 'cognitiveDistribution', 'Cognitive distribution must be an object.')];
  }

  for (const [level, allocation] of Object.entries(cognitiveDistribution)) {
    if (!SUPPORTED_COGNITIVE_LEVELS.includes(level)) {
      errors.push(diagnostic('UNKNOWN_COGNITIVE_LEVEL', `cognitiveDistribution.${level}`, 'Cognitive level is not supported.'));
    } else if (!isNonNegativeInteger(allocation)) {
      errors.push(diagnostic('INVALID_COGNITIVE_ALLOCATION', `cognitiveDistribution.${level}`, 'Cognitive allocation must be a non-negative integer.'));
    }
  }

  const total = Object.values(cognitiveDistribution).reduce(
    (sum, allocation) => (isNonNegativeInteger(allocation) ? sum + allocation : sum),
    0,
  );
  if (errors.length === 0 && total !== questionCount) {
    errors.push(diagnostic('COGNITIVE_ALLOCATION_MISMATCH', 'cognitiveDistribution', 'Cognitive allocation must equal question count.'));
  }
  return errors;
}

export function validateQuestionTypes(supportedQuestionTypes) {
  if (!Array.isArray(supportedQuestionTypes) || supportedQuestionTypes.length === 0) {
    return [diagnostic('REQUIRED_QUESTION_TYPES', 'supportedQuestionTypes', 'At least one question type is required.')];
  }

  const errors = [];
  if (duplicateValues(supportedQuestionTypes).length > 0) {
    errors.push(diagnostic('DUPLICATE_QUESTION_TYPE', 'supportedQuestionTypes', 'Question types must not be duplicated.'));
  }
  for (const [index, questionType] of supportedQuestionTypes.entries()) {
    if (!SUPPORTED_QUESTION_TYPES.includes(questionType)) {
      errors.push(diagnostic('UNSUPPORTED_QUESTION_TYPE', `supportedQuestionTypes[${index}]`, 'Question type is not supported.'));
    }
  }
  return errors;
}

function validateMappingEntries(mappings, field, identifierField, codes, label, questionCount) {
  if (!Array.isArray(mappings)) {
    return [diagnostic(codes.required, field, `${label} must be an array.`)];
  }

  const errors = [];
  const identifiers = [];
  let allocation = 0;
  mappings.forEach((mapping, index) => {
    const path = `${field}[${index}]`;
    if (!isPlainObject(mapping)) {
      errors.push(diagnostic(codes.invalidEntry, path, `${label} entries must be objects.`));
      return;
    }

    const identifier = mapping[identifierField];
    const identifierError = validateIdentifier(
      identifier,
      `${path}.${identifierField}`,
      codes.requiredIdentifier,
      codes.invalidIdentifier,
      `${label} ID`,
    );
    if (identifierError) errors.push(identifierError);
    else identifiers.push(identifier.trim());

    if (!isNonNegativeInteger(mapping.questionCount)) {
      errors.push(diagnostic(codes.invalidQuestionCount, `${path}.questionCount`, 'Question allocation must be a non-negative integer.'));
    } else {
      allocation += mapping.questionCount;
    }
  });

  if (duplicateValues(identifiers).length > 0) {
    errors.push(diagnostic(codes.duplicateIdentifier, field, `${label} IDs must not be duplicated.`));
  }
  if (allocation > questionCount) {
    errors.push(diagnostic(codes.allocationExceeded, field, `${label} allocation must not exceed question count.`));
  }
  return errors;
}

export function validateClaimMappings(claims, questionCount) {
  return validateMappingEntries(
    claims,
    'claims',
    'claimId',
    {
      required: 'INVALID_CLAIMS',
      invalidEntry: 'INVALID_CLAIM_MAPPING',
      requiredIdentifier: 'REQUIRED_CLAIM_ID',
      invalidIdentifier: 'INVALID_CLAIM_ID',
      invalidQuestionCount: 'INVALID_CLAIM_QUESTION_COUNT',
      duplicateIdentifier: 'DUPLICATE_CLAIM_ID',
      allocationExceeded: 'CLAIM_ALLOCATION_EXCEEDED',
    },
    'Claim',
    questionCount,
  );
}

export function validateObjectiveMappings(learningObjectives, questionCount) {
  return validateMappingEntries(
    learningObjectives,
    'learningObjectives',
    'learningObjectiveId',
    {
      required: 'INVALID_LEARNING_OBJECTIVES',
      invalidEntry: 'INVALID_LEARNING_OBJECTIVE_MAPPING',
      requiredIdentifier: 'REQUIRED_LEARNING_OBJECTIVE_ID',
      invalidIdentifier: 'INVALID_LEARNING_OBJECTIVE_ID',
      invalidQuestionCount: 'INVALID_LEARNING_OBJECTIVE_QUESTION_COUNT',
      duplicateIdentifier: 'DUPLICATE_LEARNING_OBJECTIVE_ID',
      allocationExceeded: 'LEARNING_OBJECTIVE_ALLOCATION_EXCEEDED',
    },
    'Learning objective',
    questionCount,
  );
}

function validateIdentifierArray(value, field) {
  if (!Array.isArray(value)) {
    return [diagnostic('INVALID_SOURCE_IDENTIFIER_LIST', field, 'Source identifiers must be an array.')];
  }
  const errors = [];
  const identifiers = [];
  value.forEach((identifier, index) => {
    const error = validateIdentifier(
      identifier,
      `${field}[${index}]`,
      'REQUIRED_SOURCE_IDENTIFIER',
      'INVALID_SOURCE_IDENTIFIER',
      'Source identifier',
    );
    if (error) errors.push(error);
    else identifiers.push(identifier.trim());
  });
  if (duplicateValues(identifiers).length > 0) {
    errors.push(diagnostic('DUPLICATE_SOURCE_IDENTIFIER', field, 'Source identifiers must not be duplicated.'));
  }
  return errors;
}

export function validateSourceRestrictions(sourceRestrictions) {
  if (sourceRestrictions === undefined) return [];
  if (!isPlainObject(sourceRestrictions)) {
    return [diagnostic('INVALID_SOURCE_RESTRICTIONS', 'sourceRestrictions', 'Source restrictions must be an object.')];
  }

  const errors = [];
  for (const key of Object.keys(sourceRestrictions)) {
    if (!['documentIds', 'documentVersionIds'].includes(key)) {
      errors.push(diagnostic('UNKNOWN_SOURCE_RESTRICTION', `sourceRestrictions.${key}`, 'Source restriction is not supported.'));
    }
  }
  for (const field of ['documentIds', 'documentVersionIds']) {
    if (sourceRestrictions[field] !== undefined) errors.push(...validateIdentifierArray(sourceRestrictions[field], `sourceRestrictions.${field}`));
  }
  return errors;
}

export function validateEvidenceRequirements(evidenceRequirements) {
  if (evidenceRequirements === undefined) return [];
  if (!isPlainObject(evidenceRequirements)) {
    return [diagnostic('INVALID_EVIDENCE_REQUIREMENTS', 'evidenceRequirements', 'Evidence requirements must be an object.')];
  }

  const errors = [];
  for (const key of Object.keys(evidenceRequirements)) {
    if (!['evidenceTypes', 'requireGrounding'].includes(key)) {
      errors.push(diagnostic('UNKNOWN_EVIDENCE_REQUIREMENT', `evidenceRequirements.${key}`, 'Evidence requirement is not supported.'));
    }
  }
  if (evidenceRequirements.evidenceTypes !== undefined) {
    if (!Array.isArray(evidenceRequirements.evidenceTypes)) {
      errors.push(diagnostic('INVALID_EVIDENCE_TYPES', 'evidenceRequirements.evidenceTypes', 'Evidence types must be an array.'));
    } else {
      const duplicates = duplicateValues(evidenceRequirements.evidenceTypes);
      if (duplicates.length > 0) {
        errors.push(diagnostic('DUPLICATE_EVIDENCE_TYPE', 'evidenceRequirements.evidenceTypes', 'Evidence types must not be duplicated.'));
      }
      evidenceRequirements.evidenceTypes.forEach((evidenceType, index) => {
        if (!SUPPORTED_EVIDENCE_TYPES.includes(evidenceType)) {
          errors.push(diagnostic('UNSUPPORTED_EVIDENCE_TYPE', `evidenceRequirements.evidenceTypes[${index}]`, 'Evidence type is not supported.'));
        }
      });
    }
  }
  if (evidenceRequirements.requireGrounding !== undefined && typeof evidenceRequirements.requireGrounding !== 'boolean') {
    errors.push(diagnostic('INVALID_REQUIRE_GROUNDING', 'evidenceRequirements.requireGrounding', 'Require grounding must be boolean.'));
  }
  return errors;
}

export function validateAssessmentBlueprint(input = {}) {
  const errors = [];
  const titleError = validateTitle(input.title);
  const competencyError = validateCompetencyId(input.competencyId);
  const targetProficiencyError = validateTargetProficiency(input.targetProficiency);
  const questionCountError = validateQuestionCount(input.questionCount);

  for (const error of [titleError, competencyError, targetProficiencyError, questionCountError]) {
    if (error) errors.push(error);
  }

  const questionCount = Number.isInteger(input.questionCount) && input.questionCount > 0 ? input.questionCount : 0;
  errors.push(...validateCognitiveDistribution(input.cognitiveDistribution, questionCount));
  errors.push(...validateQuestionTypes(input.supportedQuestionTypes));
  errors.push(...validateClaimMappings(input.claims, questionCount));
  errors.push(...validateObjectiveMappings(input.learningObjectives, questionCount));
  errors.push(...validateSourceRestrictions(input.sourceRestrictions));
  errors.push(...validateEvidenceRequirements(input.evidenceRequirements));

  return { valid: errors.length === 0, errors, warnings: [] };
}
