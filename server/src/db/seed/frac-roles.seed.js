/**
 * V2 FRAC Roles & Activities Seed
 *
 * Seeds MoSPI-specific roles per FRAC framework with their activities.
 * Platform roles (ADMIN/EMPLOYEE) are on the users.platform_role column.
 * FRAC roles define the competency requirements within the domain.
 */
import { db } from '../index.js';
import { roles, competencyRequirements } from '../schema/index.js';

export const FRAC_ROLES = [
  {
    code: 'ISS_SO',
    title: 'Statistical Officer (ISS)',
    department: 'MoSPI / NSSO / NSO',
    description: 'Indian Statistical Service officer responsible for survey design, data collection, statistical analysis, quality audits, and report generation.',
    activities: [
      { code: 'ACT_SO_01', title: 'Design survey instruments and sampling methodology', seq: 1 },
      { code: 'ACT_SO_02', title: 'Supervise field data collection and CAPI operations', seq: 2 },
      { code: 'ACT_SO_03', title: 'Perform statistical analysis and validation of survey data', seq: 3 },
      { code: 'ACT_SO_04', title: 'Prepare statistical reports and publications', seq: 4 },
      { code: 'ACT_SO_05', title: 'Conduct data quality audits and documentation', seq: 5 },
    ],
    // competency code -> required level (1-5)
    requirements: [
      { code: 'SAMPLING_METHODS', level: 4.0, priority: 1, mandatory: true },
      { code: 'SURVEY_DESIGN', level: 4.0, priority: 1, mandatory: true },
      { code: 'NATIONAL_ACCOUNTS', level: 3.0, priority: 2, mandatory: false },
      { code: 'DATA_QUALITY', level: 3.0, priority: 2, mandatory: true },
      { code: 'PYTHON_ANALYTICS', level: 3.0, priority: 2, mandatory: false },
      { code: 'SQL_DATABASE', level: 3.0, priority: 2, mandatory: false },
      { code: 'STATA_SPSS', level: 3.0, priority: 2, mandatory: false },
      { code: 'METADATA_STANDARDS', level: 3.0, priority: 3, mandatory: false },
      { code: 'SDG_INDICATORS', level: 2.0, priority: 3, mandatory: false },
      { code: 'COMMUNICATION', level: 3.0, priority: 2, mandatory: true },
      { code: 'ETHICS_INTEGRITY', level: 3.0, priority: 1, mandatory: true },
    ],
  },
  {
    code: 'ISS_AD',
    title: 'Assistant Director (Surveys)',
    department: 'National Sample Survey Office (NSSO)',
    description: 'Leads field survey operations including sampling validation, data tabulation, technical survey reports, and training of field staff.',
    activities: [
      { code: 'ACT_AD_01', title: 'Plan and coordinate field survey operations', seq: 1 },
      { code: 'ACT_AD_02', title: 'Validate sampling frames and oversee sample selection', seq: 2 },
      { code: 'ACT_AD_03', title: 'Tabulate and analyse survey data using statistical software', seq: 3 },
      { code: 'ACT_AD_04', title: 'Prepare technical reports and present findings to senior management', seq: 4 },
      { code: 'ACT_AD_05', title: 'Train and mentor field investigators and enumerators', seq: 5 },
    ],
    requirements: [
      { code: 'SAMPLING_METHODS', level: 4.0, priority: 1, mandatory: true },
      { code: 'SURVEY_DESIGN', level: 4.0, priority: 1, mandatory: true },
      { code: 'LABOUR_STATISTICS', level: 3.0, priority: 2, mandatory: false },
      { code: 'AGRI_STATISTICS', level: 3.0, priority: 2, mandatory: false },
      { code: 'DATA_QUALITY', level: 4.0, priority: 1, mandatory: true },
      { code: 'PYTHON_ANALYTICS', level: 3.0, priority: 2, mandatory: false },
      { code: 'STATA_SPSS', level: 3.0, priority: 2, mandatory: true },
      { code: 'LEADERSHIP', level: 3.0, priority: 2, mandatory: true },
      { code: 'COMMUNICATION', level: 4.0, priority: 1, mandatory: true },
      { code: 'PROJECT_MANAGEMENT', level: 3.0, priority: 2, mandatory: true },
      { code: 'ETHICS_INTEGRITY', level: 4.0, priority: 1, mandatory: true },
    ],
  },
  {
    code: 'SSS_ANALYST',
    title: 'Statistical Analyst (SSS)',
    department: 'Data Informatics & Innovation Division (DIID)',
    description: 'Subordinate Statistical Service analyst handling data entry, validation, preliminary analysis, and report compilation.',
    activities: [
      { code: 'ACT_SSS_01', title: 'Enter and validate survey data using CAPI/CATI tools', seq: 1 },
      { code: 'ACT_SSS_02', title: 'Perform basic statistical analysis and cross-tabulations', seq: 2 },
      { code: 'ACT_SSS_03', title: 'Compile data tables and graphs for reports', seq: 3 },
      { code: 'ACT_SSS_04', title: 'Maintain data documentation and metadata records', seq: 4 },
    ],
    requirements: [
      { code: 'SAMPLING_METHODS', level: 2.0, priority: 2, mandatory: false },
      { code: 'SURVEY_DESIGN', level: 2.0, priority: 2, mandatory: false },
      { code: 'DATA_QUALITY', level: 3.0, priority: 1, mandatory: true },
      { code: 'PYTHON_ANALYTICS', level: 2.0, priority: 2, mandatory: false },
      { code: 'SQL_DATABASE', level: 2.0, priority: 2, mandatory: false },
      { code: 'STATA_SPSS', level: 2.0, priority: 2, mandatory: false },
      { code: 'METADATA_STANDARDS', level: 2.0, priority: 2, mandatory: false },
      { code: 'DATA_VISUALIZATION', level: 2.0, priority: 3, mandatory: false },
      { code: 'COMMUNICATION', level: 2.0, priority: 3, mandatory: false },
      { code: 'ETHICS_INTEGRITY', level: 2.0, priority: 1, mandatory: true },
    ],
  },
  {
    code: 'DIR_DIID',
    title: 'Director (Data Informatics)',
    department: 'MoSPI DIID Headquarters',
    description: 'Strategic oversight of digital data architecture, automated statistical pipelines, SDG monitoring, and national capacity building programmes.',
    activities: [
      { code: 'ACT_DIR_01', title: 'Define digital data architecture strategy for MoSPI', seq: 1 },
      { code: 'ACT_DIR_02', title: 'Oversee AI/ML integration in official statistical production', seq: 2 },
      { code: 'ACT_DIR_03', title: 'Monitor SDG indicator compilation and reporting', seq: 3 },
      { code: 'ACT_DIR_04', title: 'Lead national capacity building programmes (NSSTA TPAC)', seq: 4 },
      { code: 'ACT_DIR_05', title: 'Represent India in international statistical forums (UNSC, IMF)', seq: 5 },
    ],
    requirements: [
      { code: 'NATIONAL_ACCOUNTS', level: 4.0, priority: 1, mandatory: true },
      { code: 'SDG_INDICATORS', level: 4.0, priority: 1, mandatory: true },
      { code: 'AI_ML_FUNDAMENTALS', level: 3.0, priority: 2, mandatory: false },
      { code: 'CLOUD_COMPUTING', level: 3.0, priority: 2, mandatory: false },
      { code: 'DATA_PRIVACY', level: 4.0, priority: 1, mandatory: true },
      { code: 'CYBERSECURITY', level: 3.0, priority: 2, mandatory: true },
      { code: 'LEADERSHIP', level: 5.0, priority: 1, mandatory: true },
      { code: 'COMMUNICATION', level: 5.0, priority: 1, mandatory: true },
      { code: 'PROJECT_MANAGEMENT', level: 4.0, priority: 1, mandatory: true },
      { code: 'DECISION_MAKING', level: 5.0, priority: 1, mandatory: true },
      { code: 'ETHICS_INTEGRITY', level: 5.0, priority: 1, mandatory: true },
    ],
  },
  {
    code: 'DATA_SCIENTIST',
    title: 'Data Scientist / Analyst',
    department: 'Data Informatics & Innovation Division (DIID)',
    description: 'Applies AI/ML, big data analytics, and advanced visualization to transform statistical data into actionable insights.',
    activities: [
      { code: 'ACT_DS_01', title: 'Build ML models for survey imputation and outlier detection', seq: 1 },
      { code: 'ACT_DS_02', title: 'Design interactive dashboards for statistical dissemination', seq: 2 },
      { code: 'ACT_DS_03', title: 'Integrate administrative and big data sources with official statistics', seq: 3 },
      { code: 'ACT_DS_04', title: 'Publish datasets via Government Open Data Portal APIs', seq: 4 },
    ],
    requirements: [
      { code: 'PYTHON_ANALYTICS', level: 4.0, priority: 1, mandatory: true },
      { code: 'R_PROGRAMMING', level: 3.0, priority: 2, mandatory: false },
      { code: 'SQL_DATABASE', level: 4.0, priority: 1, mandatory: true },
      { code: 'AI_ML_FUNDAMENTALS', level: 4.0, priority: 1, mandatory: true },
      { code: 'DATA_VISUALIZATION', level: 4.0, priority: 1, mandatory: true },
      { code: 'GIS_SPATIAL', level: 3.0, priority: 2, mandatory: false },
      { code: 'CLOUD_COMPUTING', level: 3.0, priority: 2, mandatory: false },
      { code: 'APIS_OPEN_DATA', level: 4.0, priority: 1, mandatory: true },
      { code: 'CYBERSECURITY', level: 2.0, priority: 3, mandatory: false },
      { code: 'DATA_PRIVACY', level: 3.0, priority: 2, mandatory: true },
      { code: 'ETHICS_INTEGRITY', level: 3.0, priority: 1, mandatory: true },
    ],
  },
];

export async function seedFracRoles(competencyRows) {
  console.log('🌱 Seeding FRAC roles and activities...');

  const insertedRoles = [];

  for (const role of FRAC_ROLES) {
    const [row] = await db.insert(roles).values({
      code: role.code,
      title: role.title,
      department: role.department,
      description: role.description,
    }).onConflictDoNothing().returning();

    const roleRow = row ?? (await db.select().from(roles).where({ code: role.code }))?.[0];
    if (!roleRow) continue;
    insertedRoles.push(roleRow);

    // Seed activities via raw SQL (activities table is V2-only)
    for (const act of role.activities) {
      await db.execute(
        `INSERT INTO activities (role_id, code, title, sequence)
         VALUES ('${roleRow.id}', '${act.code}', '${act.title.replace(/'/g, "''")}', ${act.seq})
         ON CONFLICT DO NOTHING`
      );
    }

    // Seed competency requirements
    for (const req of role.requirements) {
      const comp = competencyRows.find(c => c.code === req.code);
      if (!comp) continue;
      await db.insert(competencyRequirements).values({
        roleId: roleRow.id,
        competencyId: comp.id,
        requiredLevel: req.level,
        priority: req.priority,
        urgency: req.priority,
        mandatory: req.mandatory,
        frameworkVersion: 'FRAC_v1',
        sourceReference: 'MoSPI FRAC 2024',
      }).onConflictDoNothing();
    }
  }

  console.log(`✅ Seeded ${insertedRoles.length} FRAC roles with activities and competency requirements`);
  return insertedRoles;
}
