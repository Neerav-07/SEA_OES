import { db } from './index.js';
import {
  users,
  officials,
  roles,
  competencies,
  subCompetencies,
  learningObjectives,
  roleCompetencies,
  evidence,
} from './schema/index.js';

export async function seedDatabase() {
  console.log('🌱 Seeding Kshamata MoSPI DIID Competency Database...');

  try {
    // 1. Seed Competencies
    const [compStat] = await db
      .insert(competencies)
      .values([
        {
          code: 'STAT_ANALYSIS',
          name: 'Statistical Analysis & Inference',
          category: 'Statistical',
          description: 'Descriptive, inferential statistics, probability distributions, hypothesis testing, and regression analysis for official surveys.',
        },
        {
          code: 'SAMPLING_DESIGN',
          name: 'Survey Design & Sampling Methodology',
          category: 'Statistical',
          description: 'Stratified sampling, cluster sampling, sample size estimation, non-response adjustments, and weighting in NSS surveys.',
        },
        {
          code: 'NATIONAL_ACCOUNTS',
          name: 'National Accounts & Macroeconomic Stats',
          category: 'Statistical',
          description: 'GDP estimation, GVA, Input-Output tables, System of National Accounts (SNA 2008), and Sectoral Economic Statistics.',
        },
        {
          code: 'PYTHON_R_STATS',
          name: 'Python & R for Data Analytics',
          category: 'Technical',
          description: 'Data wrangling, automated statistical modeling, pandas, numpy, statsmodels, and ggplot visualization.',
        },
        {
          code: 'SQL_DATA_MGMT',
          name: 'SQL & Enterprise Data Management',
          category: 'Technical',
          description: 'Relational database query optimization, indexing, ETL pipelines, and metadata standards.',
        },
        {
          code: 'DATA_QUALITY_GOV',
          name: 'Metadata Standards & Data Governance',
          category: 'Digital Governance',
          description: 'Data quality frameworks, NDSAP alignment, anonymization, privacy preservation, and GIGW compliance.',
        },
      ])
      .onConflictDoNothing()
      .returning();

    console.log('✅ Competencies seeded');

    // 2. Seed Sub-competencies & Learning Objectives
    if (compStat) {
      const [subSamp] = await db
        .insert(subCompetencies)
        .values([
          {
            competencyId: compStat.id,
            code: 'SUB_SAMPLING_METHODS',
            name: 'Sampling Methods Selection',
            description: 'Selecting simple random, stratified, systematic, or cluster sampling based on frame characteristics.',
          },
          {
            competencyId: compStat.id,
            code: 'SUB_BIAS_ESTIMATION',
            name: 'Sampling Bias & Variance Estimation',
            description: 'Calculating design effects, sampling variance, standard error, and non-sampling error corrections.',
          },
        ])
        .onConflictDoNothing()
        .returning();

      if (subSamp) {
        await db
          .insert(learningObjectives)
          .values([
            {
              subCompetencyId: subSamp.id,
              code: 'LO_ID_SAMPLING',
              title: 'Identify probability sampling techniques suitable for household surveys',
              taxonomyLevel: 2,
            },
            {
              subCompetencyId: subSamp.id,
              code: 'LO_CALC_SAMPLE_SIZE',
              title: 'Calculate minimum required sample size for specified margin of error and confidence level',
              taxonomyLevel: 3,
            },
          ])
          .onConflictDoNothing();
      }
    }

    // 3. Seed Roles
    const [roleStatOfficer] = await db
      .insert(roles)
      .values([
        {
          code: 'STAT_OFFICER',
          title: 'Statistical Officer (SO)',
          department: 'Data Informatics & Innovation Division (DIID)',
          description: 'Responsible for survey data collection design, statistical analysis, quality audits, and report generation.',
        },
        {
          code: 'ASST_DIR_SURVEYS',
          title: 'Assistant Director (Surveys)',
          department: 'National Sample Survey Office (NSSO)',
          description: 'Leads field survey operations, sampling validation, data tabulation, and technical survey reports.',
        },
        {
          code: 'DIR_DATA_INFORMATICS',
          title: 'Director (Data Informatics)',
          department: 'MoSPI DIID Headquarters',
          description: 'Strategic oversight of digital data architecture, automated statistical pipelines, and capacity building.',
        },
      ])
      .onConflictDoNothing()
      .returning();

    console.log('✅ Roles seeded');

    // 4. Seed Role Competency Requirements
    if (roleStatOfficer && compStat) {
      await db
        .insert(roleCompetencies)
        .values([
          {
            roleId: roleStatOfficer.id,
            competencyId: compStat.id,
            requiredLevel: 4.0, // Advanced
            priority: 'HIGH',
            isMandatory: true,
          },
        ])
        .onConflictDoNothing();
    }

    // 5. Seed Official & Evidence
    const [sampleUser] = await db
      .insert(users)
      .values([
        {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@mospi.gov.in',
          passwordHash: '$2b$10$e78J7w72/oUa2w.Kq8c.6uE.E6Mh3wWq.uV', // mock hash
          role: 'user',
        },
      ])
      .onConflictDoNothing()
      .returning();

    if (sampleUser && roleStatOfficer) {
      const [official] = await db
        .insert(officials)
        .values([
          {
            userId: sampleUser.id,
            roleId: roleStatOfficer.id,
            designation: 'Senior Statistical Officer',
            department: 'MoSPI DIID',
            cadre: 'ISS',
            experienceYears: 8,
            education: 'Ph.D. in Agricultural Statistics (IASRI)',
            preferredLanguage: 'en',
          },
        ])
        .onConflictDoNothing()
        .returning();

      if (official && compStat) {
        await db
          .insert(evidence)
          .values([
            {
              officialId: official.id,
              competencyId: compStat.id,
              evidenceType: 'KNOWLEDGE',
              score: 3.5,
              maxScore: 5.0,
              weight: 0.4,
              confidence: 0.85,
              provenance: 'NSSTA Diagnostic Assessment 2025 (Attempt #102)',
            },
            {
              officialId: official.id,
              competencyId: compStat.id,
              evidenceType: 'APPLICATION',
              score: 2.8,
              maxScore: 5.0,
              weight: 0.35,
              confidence: 0.78,
              provenance: 'Scenario Assessment: NSS 78th Round Data Audit',
            },
          ])
          .onConflictDoNothing();
      }
    }

    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Database seeding error:', error);
  }
}
