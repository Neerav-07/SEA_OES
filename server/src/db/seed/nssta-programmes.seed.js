/**
 * V2 NSSTA TPAC Programme Catalogue Seed
 *
 * Based on real NSSTA programmes published in MoSPI announcements and circulars.
 * These programmes form the second recommendation source alongside iGOT courses.
 */
import { db } from '../index.js';

export const NSSTA_PROGRAMMES = [
  {
    code: 'NSSTA-IST-2026-001',
    title: 'Data Base Management and Data Visualization for Official Statistics',
    description: 'Covers relational database design, SQL for survey data, and creating dashboards using Power BI and Tableau for statistical dissemination.',
    targetAudience: ['ISS Officer', 'SSS Analyst', 'Statistical Officer'],
    durationDays: 5,
    mode: 'Hybrid',
    capacity: 30,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['SQL_DATABASE', 'DATA_VISUALIZATION', 'PYTHON_ANALYTICS'],
  },
  {
    code: 'NSSTA-IST-2026-002',
    title: 'Introduction to Artificial Intelligence & Machine Learning for Official Statistics',
    description: 'Foundational AI/ML course covering supervised learning, NLP for text data, imputation methods, and real case studies from NSS and CES surveys.',
    targetAudience: ['ISS Officer', 'Data Scientist', 'Director (Data Informatics)'],
    durationDays: 5,
    mode: 'Online',
    capacity: 50,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['AI_ML_FUNDAMENTALS', 'PYTHON_ANALYTICS', 'DATA_VISUALIZATION'],
  },
  {
    code: 'NSSTA-IST-2026-003',
    title: 'CAPI Implementation and Field Survey Operations',
    description: 'Hands-on training on Computer Assisted Personal Interview technology, ODK/SurveyToGo platforms, CAPI quality control, and field logistics.',
    targetAudience: ['ISS Officer', 'Assistant Director (Surveys)', 'Field Officer'],
    durationDays: 3,
    mode: 'Offline',
    capacity: 25,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['SURVEY_DESIGN', 'DATA_QUALITY'],
  },
  {
    code: 'NSSTA-IST-2026-004',
    title: 'National Accounts Statistics: Theory and Practice (SNA 2008)',
    description: 'In-depth training on GDP compilation using production, income, and expenditure approaches; GVA sectoral estimates; Supply-Use Tables; and India-specific NAS methodology.',
    targetAudience: ['ISS Officer', 'Assistant Director (Surveys)', 'Director (Data Informatics)'],
    durationDays: 7,
    mode: 'Offline',
    capacity: 20,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['NATIONAL_ACCOUNTS', 'PRICE_STATISTICS', 'METADATA_STANDARDS'],
  },
  {
    code: 'NSSTA-IST-2026-005',
    title: 'SDG Indicators: Monitoring, Metadata and Reporting',
    description: 'SDG framework overview, Tier classification, India SDG Index methodology, VNR reporting process, data gap analysis, and IAEG-SDGs metadata standards.',
    targetAudience: ['ISS Officer', 'Director (Data Informatics)', 'Policy Analyst'],
    durationDays: 4,
    mode: 'Hybrid',
    capacity: 40,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['SDG_INDICATORS', 'METADATA_STANDARDS', 'DATA_QUALITY'],
  },
  {
    code: 'NSSTA-IST-2026-006',
    title: 'Statistical Quality Assessment Framework (SQAF) and NQAF',
    description: 'Applying SQAF for self-assessment of statistical operations, NQAF principles, quality dimensions, peer review methodology, and quality reporting.',
    targetAudience: ['ISS Officer', 'Assistant Director (Surveys)', 'Statistical Analyst'],
    durationDays: 3,
    mode: 'Online',
    capacity: 60,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['DATA_QUALITY', 'METADATA_STANDARDS'],
  },
  {
    code: 'NSSTA-IST-2026-007',
    title: 'Price Statistics: CPI and WPI Methodology',
    description: 'Consumer and Wholesale Price Index construction, Laspeyres/Fisher index numbers, base year revision, HCES weights, and international CPI standards (ILO Manual).',
    targetAudience: ['ISS Officer', 'Statistical Analyst'],
    durationDays: 4,
    mode: 'Offline',
    capacity: 25,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['PRICE_STATISTICS', 'NATIONAL_ACCOUNTS'],
  },
  {
    code: 'NSSTA-IST-2026-008',
    title: 'Agricultural Statistics: CCE, Area Enumeration, and Agricultural Census',
    description: 'Crop Cutting Experiment methodology, area estimation under multiple frames, Agricultural Census design, and MSP data collection systems.',
    targetAudience: ['ISS Officer', 'Assistant Director (Surveys)', 'Field Statistician'],
    durationDays: 5,
    mode: 'Offline',
    capacity: 20,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['AGRI_STATISTICS', 'SURVEY_DESIGN', 'SAMPLING_METHODS'],
  },
  {
    code: 'NSSTA-IST-2026-009',
    title: 'Data Privacy, Anonymization, and Statistical Disclosure Control',
    description: 'Personal Data Protection Act overview, k-anonymity, l-diversity, and t-closeness techniques for microdata protection, and international SDC best practices.',
    targetAudience: ['ISS Officer', 'Data Scientist', 'Director (Data Informatics)'],
    durationDays: 3,
    mode: 'Online',
    capacity: 50,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['DATA_PRIVACY', 'CYBERSECURITY', 'DIGITAL_PUBLIC_INFRA'],
  },
  {
    code: 'NSSTA-IST-2026-010',
    title: 'Leadership, Communication, and Ethics for Senior Statistical Officers',
    description: 'Situational leadership models, statistical ethics (UN Fundamental Principles), data communication to policymakers, and managing change in statistical organizations.',
    targetAudience: ['Director (Data Informatics)', 'Assistant Director (Surveys)', 'Senior ISS Officer'],
    durationDays: 4,
    mode: 'Hybrid',
    capacity: 30,
    nominationUrl: 'https://mospi.gov.in/web/nssta/training-programmes',
    competencyCodes: ['LEADERSHIP', 'COMMUNICATION', 'ETHICS_INTEGRITY', 'DECISION_MAKING'],
  },
];

export async function seedNsstaProgrammes(competencyRows = []) {
  console.log('🌱 Seeding NSSTA TPAC programme catalogue...');

  let seeded = 0;
  for (const prog of NSSTA_PROGRAMMES) {
    const rawRes = await db.execute(`
      INSERT INTO nssta_programmes (code, title, description, target_audience, duration_days, mode, capacity, nomination_url)
      VALUES (
        '${prog.code}',
        '${prog.title.replace(/'/g, "''")}',
        '${prog.description.replace(/'/g, "''")}',
        '${JSON.stringify(prog.targetAudience)}'::jsonb,
        ${prog.durationDays},
        '${prog.mode}',
        ${prog.capacity},
        '${prog.nominationUrl}'
      )
      ON CONFLICT (code) DO NOTHING
      RETURNING id
    `).catch(() => null);

    const rows = rawRes?.rows || (Array.isArray(rawRes) ? rawRes : []);
    let progId = rows?.[0]?.id;

    // If ON CONFLICT DO NOTHING returned no row because it already exists, fetch id
    if (!progId) {
      const existingRes = await db.execute(`SELECT id FROM nssta_programmes WHERE code = '${prog.code}'`).catch(() => null);
      const existingRows = existingRes?.rows || (Array.isArray(existingRes) ? existingRes : []);
      progId = existingRows?.[0]?.id;
    }

    if (progId) {
      seeded++;
      for (const compCode of prog.competencyCodes) {
        const comp = (competencyRows || []).find(c => c.code === compCode);
        if (!comp) continue;
        await db.execute(`
          INSERT INTO nssta_competency_map (programme_id, competency_id, relevance_level)
          VALUES ('${progId}', '${comp.id}', 'PRIMARY')
          ON CONFLICT DO NOTHING
        `).catch(() => {});
      }
    }
  }

  console.log(`✅ Seeded ${seeded} NSSTA TPAC programmes`);
}
