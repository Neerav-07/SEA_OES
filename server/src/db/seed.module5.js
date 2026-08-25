import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import { assessmentBlueprintClaims, assessmentBlueprintObjectives, assessmentBlueprints } from './schema/assessmentBlueprints.js';
import { competencies } from './schema/competencies.js';
import { competencyClaims, learningObjectives } from './schema/learningObjectives.js';
import { sourceChunks, sourceDocumentVersions, sourceDocuments } from './schema/sourceProvenance.js';

const IDS = {
  competency: '11111111-1111-4111-8111-111111111111',
  objective: '22222222-2222-4222-8222-222222222222',
  claim: '33333333-3333-4333-8333-333333333333',
  source: '44444444-4444-4444-8444-444444444444',
  version: '55555555-5555-4555-8555-555555555555',
  chunkOne: '66666666-6666-4666-8666-666666666666',
  chunkTwo: '77777777-7777-4777-8777-777777777777',
  blueprint: '88888888-8888-4888-8888-888888888888',
  blueprintClaim: '99999999-9999-4999-8999-999999999999',
  blueprintObjective: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
};

async function seed() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);
  try {
    await db.transaction(async (tx) => {
      await tx.insert(competencies).values({ id: IDS.competency, code: 'DEV_SURVEY_DESIGN', name: 'Development Survey Design', category: 'Statistical Competencies', description: 'Synthetic development competency for local Module 5 verification.' }).onConflictDoNothing({ target: competencies.id });
      await tx.insert(learningObjectives).values({ id: IDS.objective, competencyId: IDS.competency, code: 'DEV-LO-001', title: 'Select a sampling method', description: 'Use source guidance to select an appropriate sampling method.', targetLevel: 3, status: 'ACTIVE', isActive: true }).onConflictDoNothing({ target: learningObjectives.id });
      await tx.insert(competencyClaims).values({ id: IDS.claim, competencyId: IDS.competency, learningObjectiveId: IDS.objective, code: 'DEV-CLAIM-001', statement: 'Select an appropriate sampling method for a survey.', status: 'ACTIVE' }).onConflictDoNothing({ target: competencyClaims.id });
      await tx.insert(sourceDocuments).values({ id: IDS.source, externalId: 'module5-development-fixture', name: 'Synthetic Module 5 Development Source', documentType: 'TEXT' }).onConflictDoNothing({ target: sourceDocuments.id });
      await tx.insert(sourceDocumentVersions).values({ id: IDS.version, documentId: IDS.source, version: 1, checksum: 'module5-development-fixture-v1', status: 'READY' }).onConflictDoNothing({ target: sourceDocumentVersions.id });
      await tx.insert(sourceChunks).values([
        { id: IDS.chunkOne, documentVersionId: IDS.version, chunkReference: 'fixture-chunk-0001', text: 'Synthetic survey guidance: probability sampling gives each unit a known chance of selection and supports representative survey estimates.', textStart: 0, textEnd: 119, metadata: { ordinal: 1, fixture: true } },
        { id: IDS.chunkTwo, documentVersionId: IDS.version, chunkReference: 'fixture-chunk-0002', text: 'Synthetic survey guidance: select a sampling method that matches the target population, available frame, and intended inference.', textStart: 119, textEnd: 239, metadata: { ordinal: 2, fixture: true } },
      ]).onConflictDoNothing({ target: sourceChunks.id });
      await tx.insert(assessmentBlueprints).values({ id: IDS.blueprint, title: 'Synthetic Survey Blueprint', competencyId: IDS.competency, targetProficiency: 3, cognitiveDistribution: { APPLY: 1 }, questionCount: 1, supportedQuestionTypes: ['MCQ'], sourceRestrictions: { documentIds: [IDS.source], documentVersionIds: [IDS.version] }, evidenceRequirements: { requireGrounding: true }, status: 'DRAFT' }).onConflictDoNothing({ target: assessmentBlueprints.id });
      await tx.insert(assessmentBlueprintClaims).values({ id: IDS.blueprintClaim, blueprintId: IDS.blueprint, claimId: IDS.claim, questionCount: 1 }).onConflictDoNothing({ target: assessmentBlueprintClaims.id });
      await tx.insert(assessmentBlueprintObjectives).values({ id: IDS.blueprintObjective, blueprintId: IDS.blueprint, learningObjectiveId: IDS.objective, questionCount: 1 }).onConflictDoNothing({ target: assessmentBlueprintObjectives.id });
    });
    console.log(JSON.stringify({ seeded: true, ids: IDS }));
  } finally {
    await client.end();
  }
}

seed().catch((error) => { console.error(`Module 5 development seed failed: ${error.message || error.code}`); process.exitCode = 1; });
