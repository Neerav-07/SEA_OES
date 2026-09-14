import { eq } from "drizzle-orm";
import { db } from "../index.js";
import {
  assessmentBlueprints,
  assessmentBlueprintClaims,
  assessmentBlueprintObjectives,
  competencyClaims,
  learningObjectives,
} from "../schema/index.js";

export const BLUEPRINT_DEFINITIONS = [
  {
    compCode: "SAMPLING_METHODS",
    title: "NSSO Multi-Stage Stratified Sampling & Probability Proportional Selection",
    targetProficiency: 4.0,
    cognitiveDistribution: { REMEMBER: 1, UNDERSTAND: 2, APPLY: 4, ANALYZE: 2, EVALUATE: 1 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "ACTIVE",
    version: 1,
  },
  {
    compCode: "NATIONAL_ACCOUNTS",
    title: "SNA 2008 Gross Value Added (GVA) & Constant-Price Deflation Compilation",
    targetProficiency: 4.0,
    cognitiveDistribution: { REMEMBER: 1, UNDERSTAND: 2, APPLY: 4, ANALYZE: 2, EVALUATE: 1 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "ACTIVE",
    version: 1,
  },
  {
    compCode: "DATA_QUALITY",
    title: "MoSPI National Quality Assurance Framework (NQAF) & Audit Protocols",
    targetProficiency: 3.5,
    cognitiveDistribution: { REMEMBER: 1, UNDERSTAND: 3, APPLY: 3, ANALYZE: 2, EVALUATE: 1 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "APPROVED",
    version: 1,
  },
  {
    compCode: "PYTHON_ANALYTICS",
    title: "Large-Scale Survey Microdata Analytics with Python & Pandas",
    targetProficiency: 3.5,
    cognitiveDistribution: { REMEMBER: 1, UNDERSTAND: 2, APPLY: 5, ANALYZE: 2, EVALUATE: 0 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "ACTIVE",
    version: 1,
  },
  {
    compCode: "PRICE_STATISTICS",
    title: "Consumer Price Index (CPI) Elementary Aggregates & Jevons Index Formula",
    targetProficiency: 3.5,
    cognitiveDistribution: { REMEMBER: 2, UNDERSTAND: 2, APPLY: 4, ANALYZE: 2, EVALUATE: 0 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "APPROVED",
    version: 1,
  },
  {
    compCode: "SURVEY_DESIGN",
    title: "Periodic Labour Force Survey (PLFS) CAPI Design & Non-Sampling Error Reduction",
    targetProficiency: 4.0,
    cognitiveDistribution: { REMEMBER: 1, UNDERSTAND: 2, APPLY: 4, ANALYZE: 2, EVALUATE: 1 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "ACTIVE",
    version: 1,
  },
  {
    compCode: "METADATA_STANDARDS",
    title: "SDMX Statistical Metadata Harmonisation & National Data Warehouse Standards",
    targetProficiency: 3.0,
    cognitiveDistribution: { REMEMBER: 2, UNDERSTAND: 3, APPLY: 3, ANALYZE: 2, EVALUATE: 0 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "APPROVED",
    version: 1,
  },
  {
    compCode: "AGRI_STATISTICS",
    title: "Situation Assessment of Agricultural Households (SAS) Land & Livestock Holdings",
    targetProficiency: 3.5,
    cognitiveDistribution: { REMEMBER: 2, UNDERSTAND: 2, APPLY: 4, ANALYZE: 2, EVALUATE: 0 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "ACTIVE",
    version: 1,
  },
  {
    compCode: "SQL_DATABASE",
    title: "Relational Database Querying & SQL Microdata Extraction for Statistical Audits",
    targetProficiency: 3.5,
    cognitiveDistribution: { REMEMBER: 1, UNDERSTAND: 2, APPLY: 5, ANALYZE: 2, EVALUATE: 0 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "APPROVED",
    version: 1,
  },
  {
    compCode: "DATA_PRIVACY",
    title: "Microdata Anonymisation & Statistical Disclosure Control (SDC) Governance",
    targetProficiency: 4.0,
    cognitiveDistribution: { REMEMBER: 1, UNDERSTAND: 2, APPLY: 3, ANALYZE: 3, EVALUATE: 1 },
    questionCount: 10,
    supportedQuestionTypes: ["MCQ", "SCENARIO"],
    status: "ACTIVE",
    version: 1,
  },
];

/**
 * Seed realistic MoSPI assessment blueprints and link their claims & learning objectives
 */
export async function seedAssessmentBlueprints(competencyRows = []) {
  console.log("🌱 Seeding MoSPI assessment blueprints...");

  // Pre-fetch all claims and objectives for O(1) in-memory lookup
  const [allClaims, allObjectives] = await Promise.all([
    db.select().from(competencyClaims).catch(() => []),
    db.select().from(learningObjectives).catch(() => []),
  ]);

  const claimsByComp = new Map();
  for (const c of allClaims) {
    if (!claimsByComp.has(c.competencyId)) claimsByComp.set(c.competencyId, []);
    claimsByComp.get(c.competencyId).push(c);
  }

  const objectivesByComp = new Map();
  for (const lo of allObjectives) {
    if (!objectivesByComp.has(lo.competencyId)) objectivesByComp.set(lo.competencyId, []);
    objectivesByComp.get(lo.competencyId).push(lo);
  }

  const blueprintInsertRows = [];
  const findComp = (code) => (competencyRows || []).find((c) => c.code === code);

  for (const def of BLUEPRINT_DEFINITIONS) {
    const comp = findComp(def.compCode);
    if (!comp) continue;

    blueprintInsertRows.push({
      title: def.title,
      competencyId: comp.id,
      targetProficiency: def.targetProficiency,
      cognitiveDistribution: def.cognitiveDistribution,
      questionCount: def.questionCount,
      supportedQuestionTypes: def.supportedQuestionTypes,
      sourceRestrictions: { documentIds: [], documentVersionIds: [] },
      evidenceRequirements: {
        evidenceTypes: [
          "Knowledge Evidence (MCQ / Quiz)",
          "Application Evidence (Scenario / Case Study)",
        ],
        requireGrounding: true,
      },
      status: def.status,
      version: def.version,
    });
  }

  if (blueprintInsertRows.length === 0) return [];

  const createdBlueprints = await db
    .insert(assessmentBlueprints)
    .values(blueprintInsertRows)
    .returning()
    .catch(() => []);

  const claimInsertValues = [];
  const objectiveInsertValues = [];

  for (let i = 0; i < createdBlueprints.length; i++) {
    const bp = createdBlueprints[i];
    const compId = bp.competencyId;

    const compClaims = claimsByComp.get(compId) || [];
    for (const c of compClaims) {
      claimInsertValues.push({
        blueprintId: bp.id,
        claimId: c.id,
        questionCount: 2,
      });
    }

    const compObjectives = objectivesByComp.get(compId) || [];
    for (const lo of compObjectives) {
      objectiveInsertValues.push({
        blueprintId: bp.id,
        learningObjectiveId: lo.id,
        questionCount: 2,
      });
    }
  }

  if (claimInsertValues.length > 0) {
    await db.insert(assessmentBlueprintClaims).values(claimInsertValues).onConflictDoNothing().catch(() => {});
  }

  if (objectiveInsertValues.length > 0) {
    await db.insert(assessmentBlueprintObjectives).values(objectiveInsertValues).onConflictDoNothing().catch(() => {});
  }

  console.log(`✅ Seeded ${createdBlueprints.length} MoSPI assessment blueprints with claims and objectives`);
  return createdBlueprints;
}
