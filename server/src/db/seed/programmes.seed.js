import { db } from "../index.js";
import { nsstaNotices, nsstaNoticeCompetencies } from "../schema/index.js";

// NSSTA TPAC Training Programmes
export const NSSTA_PROGRAMMES = [
  {
    code: "NSSTA-IST-2026-001",
    title: "Data Base Management and Data Visualization for Official Statistics",
    description: "Covers relational database design, SQL for survey data, and creating dashboards using Power BI and Tableau for statistical dissemination.",
    targetAudience: ["ISS Officer", "SSS Analyst", "Statistical Officer"],
    durationDays: 5,
    mode: "Hybrid",
    capacity: 30,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["SQL_DATABASE", "DATA_VISUALIZATION", "PYTHON_ANALYTICS"],
  },
  {
    code: "NSSTA-IST-2026-002",
    title: "Introduction to Artificial Intelligence & Machine Learning for Official Statistics",
    description: "Foundational AI/ML course covering supervised learning, NLP for text data, imputation methods, and real case studies from NSS and CES surveys.",
    targetAudience: ["ISS Officer", "Data Scientist", "Director (Data Informatics)"],
    durationDays: 5,
    mode: "Online",
    capacity: 50,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["AI_ML_FUNDAMENTALS", "PYTHON_ANALYTICS", "DATA_VISUALIZATION"],
  },
  {
    code: "NSSTA-IST-2026-003",
    title: "CAPI Implementation and Field Survey Operations",
    description: "Hands-on training on Computer Assisted Personal Interview technology, ODK/SurveyToGo platforms, CAPI quality control, and field logistics.",
    targetAudience: ["ISS Officer", "Assistant Director (Surveys)", "Field Officer"],
    durationDays: 3,
    mode: "Offline",
    capacity: 25,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["SURVEY_DESIGN", "DATA_QUALITY"],
  },
  {
    code: "NSSTA-IST-2026-004",
    title: "National Accounts Statistics: Theory and Practice (SNA 2008)",
    description: "In-depth training on GDP compilation using production, income, and expenditure approaches; GVA sectoral estimates; Supply-Use Tables; and India-specific NAS methodology.",
    targetAudience: ["ISS Officer", "Assistant Director (Surveys)", "Director (Data Informatics)"],
    durationDays: 7,
    mode: "Offline",
    capacity: 20,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["NATIONAL_ACCOUNTS", "PRICE_STATISTICS", "METADATA_STANDARDS"],
  },
  {
    code: "NSSTA-IST-2026-005",
    title: "SDG Indicators: Monitoring, Metadata and Reporting",
    description: "SDG framework overview, Tier classification, India SDG Index methodology, VNR reporting process, data gap analysis, and IAEG-SDGs metadata standards.",
    targetAudience: ["ISS Officer", "Director (Data Informatics)", "Policy Analyst"],
    durationDays: 4,
    mode: "Hybrid",
    capacity: 35,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["SDG_INDICATORS", "METADATA_STANDARDS", "COMMUNICATION"],
  },
  {
    code: "NSSTA-IST-2026-006",
    title: "Price Indices: Compilation Methodology and Deflation Techniques",
    description: "Consumer Price Index (CPI-Rural/Urban/Combined) and Wholesale Price Index (WPI) compilation, weighting diagrams, item substitution, and chaining methods.",
    targetAudience: ["Statistical Officer", "Assistant Director (Surveys)", "SSS Analyst"],
    durationDays: 4,
    mode: "Online",
    capacity: 40,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["PRICE_STATISTICS", "NATIONAL_ACCOUNTS"],
  },
  {
    code: "NSSTA-IST-2026-007",
    title: "Python for Statistical Computing & Large-Scale Survey Processing",
    description: "Data manipulation with pandas, survey data processing, automated validation scripts, exploratory data analysis, and integrating Python with official data pipelines.",
    targetAudience: ["ISS Officer", "Statistical Officer", "Data Scientist"],
    durationDays: 5,
    mode: "Hybrid",
    capacity: 30,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["PYTHON_ANALYTICS", "DATA_QUALITY", "APIS_OPEN_DATA"],
  },
  {
    code: "NSSTA-IST-2026-008",
    title: "Sampling Techniques and Sample Design for Socio-Economic Surveys",
    description: "Stratified multi-stage sampling, PPSWR/PPSWOR selection, sample size calculation, design effects (DEFF), weighting, and non-response adjustment methods.",
    targetAudience: ["ISS Officer", "Assistant Director (Surveys)", "Statistical Officer"],
    durationDays: 5,
    mode: "Offline",
    capacity: 25,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["SAMPLING_METHODS", "SURVEY_DESIGN"],
  },
  {
    code: "NSSTA-IST-2026-009",
    title: "Data Quality Assessment and Statistical Quality Assurance Framework (SQAF)",
    description: "Implementation of NQAF principles, quality dimension measurement (accuracy, timeliness, comparability), quality audits, and metadata documentation standards.",
    targetAudience: ["Director (Data Informatics)", "ISS Officer", "Quality Auditor"],
    durationDays: 3,
    mode: "Online",
    capacity: 45,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["DATA_QUALITY", "METADATA_STANDARDS", "DATA_GOVERNANCE"],
  },
  {
    code: "NSSTA-IST-2026-010",
    title: "Leadership, Strategic Communication and Evidence-Based Decision Making",
    description: "Situational leadership, statistical communication to non-technical policy makers, inter-agency coordination, change management, and civil service ethics.",
    targetAudience: ["ISS Officer", "Director (Data Informatics)", "Joint Director"],
    durationDays: 3,
    mode: "Offline",
    capacity: 20,
    nominationUrl: "https://mospi.gov.in/web/nssta/training-programmes",
    competencyCodes: ["LEADERSHIP", "COMMUNICATION", "STRATEGIC_PLANNING", "ETHICS_INTEGRITY"],
  },
];

// Seeds NSSTA TPAC programme catalogue
export async function seedNsstaProgrammes(competencyRows = []) {
  console.log("🌱 Seeding NSSTA TPAC programme catalogue...");

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

    if (!progId) {
      const existingRes = await db.execute(`SELECT id FROM nssta_programmes WHERE code = '${prog.code}'`).catch(() => null);
      const existingRows = existingRes?.rows || (Array.isArray(existingRes) ? existingRes : []);
      progId = existingRows?.[0]?.id;
    }

    if (progId) {
      seeded++;
      for (const compCode of prog.competencyCodes) {
        const comp = (competencyRows || []).find((c) => c.code === compCode);
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

// Seeds official circular notices (OMs)
export async function seedNsstaNotices(competencyRows = []) {
  console.log("🌱 Seeding official NSSTA circular notices (OMs)...");

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const findComp = (code) => (competencyRows || []).find((c) => c.code === code);

  const noticesList = [
    {
      omNumber: "NSSTA/TPAC/2026/04",
      title: "5-Day Residential Workshop on CAPI Administration & Sampling Validation",
      description: "Intensive in-person capacity building workshop covering Android CAPI tablet validation, survey design stratification, and sampling non-response imputation at NSSTA Greater Noida.",
      documentUrl: "https://www.mospi.gov.in/sites/default/files/training/OM_CAPI_2026.pdf",
      checksum: "sha256:4f8e91a2c3b5d6e7f8a9b0c1d2e3f4a5",
      publishedDate: new Date(now - 5 * dayMs),
      nominationDeadline: new Date(now + 12 * dayMs),
      durationDays: 5,
      mode: "Residential (Greater Noida)",
      targetAudience: ["Senior Statistical Officers (SSO)", "Assistant Directors (AD)", "Field Investigators"],
      status: "ACTIVE",
      isMandatory: true,
      urgencyLevel: "CRITICAL",
      compCode: "SAMPLING_METHODS",
    },
    {
      omNumber: "NSSTA/TPAC/2026/07",
      title: "Advanced Workshop on Python & R for National Sample Survey Microdata",
      description: "Practical virtual and lab training on large-scale unit-level data processing using Python pandas and R survey packages for automated survey dissemination.",
      documentUrl: "https://www.mospi.gov.in/sites/default/files/training/OM_PY_STAT_2026.pdf",
      checksum: "sha256:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
      publishedDate: new Date(now - 8 * dayMs),
      nominationDeadline: new Date(now + 18 * dayMs),
      durationDays: 4,
      mode: "Hybrid",
      targetAudience: ["ISS Officers", "Statistical Analysts (SSS)", "DIID Data Team"],
      status: "ACTIVE",
      isMandatory: true,
      urgencyLevel: "HIGH",
      compCode: "PYTHON_ANALYTICS",
    },
    {
      omNumber: "NSSTA/TPAC/2026/11",
      title: "Executive Programme on System of National Accounts (SNA 2008) & GVA Deflation",
      description: "Specialized training for National Accounts Division officials on double-deflation methodology, base year revision, and sectoral Gross Value Added compilation.",
      documentUrl: "https://www.mospi.gov.in/sites/default/files/training/OM_SNA_GVA_2026.pdf",
      checksum: "sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
      publishedDate: new Date(now - 12 * dayMs),
      nominationDeadline: new Date(now + 25 * dayMs),
      durationDays: 3,
      mode: "Online",
      targetAudience: ["NAD Officers", "DIID Economists", "Senior Statistical Officers"],
      status: "ACTIVE",
      isMandatory: false,
      urgencyLevel: "NORMAL",
      compCode: "NATIONAL_ACCOUNTS",
    },
  ];

  for (const n of noticesList) {
    const [noticeRow] = await db.insert(nsstaNotices).values({
      omNumber: n.omNumber,
      title: n.title,
      description: n.description,
      documentUrl: n.documentUrl,
      sourceUrl: "https://www.mospi.gov.in/announcements",
      checksum: n.checksum,
      publishedDate: n.publishedDate,
      nominationDeadline: n.nominationDeadline,
      durationDays: n.durationDays,
      mode: n.mode,
      targetAudience: n.targetAudience,
      status: n.status,
      isMandatory: n.isMandatory,
      urgencyLevel: n.urgencyLevel,
    }).returning().catch(() => []);

    const comp = findComp(n.compCode);
    if (comp && noticeRow) {
      await db.insert(nsstaNoticeCompetencies).values({
        noticeId: noticeRow.id,
        competencyId: comp.id,
        relevanceScore: 0.95,
        extractionMethod: "ML_SEMANTIC_MATCH",
        reviewStatus: "APPROVED",
      }).catch(() => {});
    }
  }

  console.log(`✅ Seeded ${noticesList.length} official NSSTA circular notices`);
}
