/**
 * Global Server Constants for Kshamata (SIH PS 26101)
 */

export const DOMAINS = {
  STATISTICAL: 'Statistical Competencies',
  TECHNICAL: 'Technical Competencies',
  DIGITAL_GOVERNANCE: 'Digital Governance',
  BEHAVIOURAL_MANAGERIAL: 'Behavioural and Managerial Competencies',
};

export const COMPETENCY_LEVELS = {
  1: { level: 1, name: 'Awareness', description: 'Recognizes basic principles and concepts.' },
  2: { level: 2, name: 'Basic', description: 'Performs simple guided tasks with supervision.' },
  3: { level: 3, name: 'Working', description: 'Independently performs routine domain tasks.' },
  4: { level: 4, name: 'Advanced', description: 'Handles complex tasks and applies statistical judgement.' },
  5: { level: 5, name: 'Expert', description: 'Designs methodologies, mentors, and leads policies.' },
};

export const EVIDENCE_TYPES = {
  KNOWLEDGE: 'Knowledge Evidence (MCQ / Quiz)',
  APPLICATION: 'Application Evidence (Scenario / Case Study)',
  PERFORMANCE: 'Performance Evidence (Virtual Lab / Exercise)',
  EXTERNAL: 'External Certificate / Accredited Training',
  LEARNING: 'iGOT / NSSTA Course Module Completion',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
