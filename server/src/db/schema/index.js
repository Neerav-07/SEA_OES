// ─── Core Domain Schema ────────────────────────────────────────────────────────
export * from "./core/users.js";
export * from "./core/officials.js";
export * from "./core/roles.js";
export * from "./core/competencies.js";
export * from "./core/learningObjectives.js";
export * from "./core/competencyRequirements.js";

// ─── Evidence & Skill Gaps Schema ─────────────────────────────────────────────
export * from "./evidence/evidence.js";
export * from "./evidence/competencyEstimates.js";
export * from "./evidence/subCompetencyEstimates.js";
export * from "./evidence/skillGaps.js";

// ─── Assessment & Question Intelligence Schema ─────────────────────────────
export * from "./assessment/assessments.js";
export * from "./assessment/assessmentAssembly.js";
export * from "./assessment/assessmentBlueprints.js";
export * from "./assessment/questionIntelligence.js";

// ─── Integrations (iGOT Karmayogi & NSSTA TPAC) ──────────────────────────────
export * from "./integrations/igot.js";
export * from "./integrations/nssta.js";
export * from "./integrations/recommendations.js";
export * from "./integrations/resourceItems.js";

// ─── Content Sources & Provenance ──────────────────────────────────────────────
export * from "./sources/sourceProvenance.js";

// ─── Workforce Analytics Schema ──────────────────────────────────────────────
export * from "./analytics/analytics.js";
