/**
 * V2 MoSPI Competency Seed — Full FRAC-aligned framework
 * Covers all 4 PS-mandated domains:
 *   1. Statistical Competencies
 *   2. Technical Competencies
 *   3. Digital Governance
 *   4. Behavioural & Managerial
 *
 * Each competency has: code, name, category, competency_type, frac_source, description
 * Sub-competencies and learning objectives are seeded under the authoritative learningObjectives table.
 */
import { db } from '../index.js';
import { competencies, learningObjectives, competencyClaims } from '../schema/index.js';

export async function seedMoSPICompetencies() {
  console.log('🌱 Seeding full MoSPI FRAC competency framework...');

  const compDefs = [
    // ── DOMAIN: Statistical ──────────────────────────────────────────────────
    {
      code: 'SURVEY_DESIGN', name: 'Survey Design & Methodology',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Design of statistical surveys including questionnaire design, pilot testing, CAPI implementation, and sampling frame construction.',
    },
    {
      code: 'SAMPLING_METHODS', name: 'Sampling Theory & Methods',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Probability and non-probability sampling methods, sample size estimation, design effects, and non-response adjustment.',
    },
    {
      code: 'NATIONAL_ACCOUNTS', name: 'National Accounts Statistics (NAS)',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'GDP estimation using production/income/expenditure approaches, SNA 2008, GVA computation, and supply-use tables.',
    },
    {
      code: 'PRICE_STATISTICS', name: 'Price Statistics (CPI/WPI)',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Consumer Price Index and Wholesale Price Index methodology, index number theory, base revision, and deflation techniques.',
    },
    {
      code: 'LABOUR_STATISTICS', name: 'Labour Statistics (PLFS)',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Periodic Labour Force Survey design, employment concepts (UPSS/UPAS/CWS/CDS), LFPR computation, and unemployment analysis.',
    },
    {
      code: 'AGRI_STATISTICS', name: 'Agricultural Statistics',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Area enumeration, crop cutting experiments, Agricultural Census methodology, and MSP data collection.',
    },
    {
      code: 'INDUSTRIAL_STATISTICS', name: 'Industrial Statistics (ASI/IIP)',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Annual Survey of Industries, Index of Industrial Production, enterprise surveys, and NIC classification.',
    },
    {
      code: 'SDG_INDICATORS', name: 'SDG Indicators & Monitoring',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'SDG Tier classification, VNR reporting, India SDG Index, data gap analysis, and international indicator metadata.',
    },
    {
      code: 'METADATA_STANDARDS', name: 'Metadata Standards & SDMX',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'SDMX, DDI, NMDS 2.0 metadata standards, data dictionaries, and inter-agency metadata harmonization.',
    },
    {
      code: 'DATA_QUALITY', name: 'Data Quality Frameworks (NQAF/SQAF)',
      category: 'Statistical', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'National Quality Assurance Framework, Statistical Quality Assessment Framework, validation rules, and error reporting.',
    },

    // ── DOMAIN: Technical ────────────────────────────────────────────────────
    {
      code: 'PYTHON_ANALYTICS', name: 'Python for Data Analytics',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Data wrangling with pandas/numpy, statistical modelling, matplotlib/seaborn visualization, and scripting automation.',
    },
    {
      code: 'R_PROGRAMMING', name: 'R Programming for Statistics',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Base R, Tidyverse, ggplot2 visualization, survey package, and R Markdown reports for official statistics.',
    },
    {
      code: 'SQL_DATABASE', name: 'SQL & Database Management',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'SQL querying, joins, aggregations, ETL pipelines, PostgreSQL administration, and data warehouse basics.',
    },
    {
      code: 'STATA_SPSS', name: 'Statistical Software (Stata/SPSS/SAS)',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Data management, regression, survey analysis, and output interpretation using Stata, SPSS, and SAS.',
    },
    {
      code: 'GIS_SPATIAL', name: 'GIS & Spatial Data Analysis',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'QGIS fundamentals, spatial data types, thematic mapping, and GIS application for census and survey data.',
    },
    {
      code: 'DATA_VISUALIZATION', name: 'Data Visualization & Dashboarding',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Dashboard design principles, chart selection, Tableau/Power BI basics, and data storytelling for government audiences.',
    },
    {
      code: 'AI_ML_FUNDAMENTALS', name: 'AI/ML Fundamentals for Statistics',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Supervised/unsupervised learning concepts, ML applications in official statistics, and AI ethics in government context.',
    },
    {
      code: 'CLOUD_COMPUTING', name: 'Cloud Computing (MeghRaj/GovCloud)',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Government cloud (MeghRaj) deployment models, containerization basics, cloud security, and data storage compliance.',
    },
    {
      code: 'APIS_OPEN_DATA', name: 'APIs & Open Government Data',
      category: 'Technical', competencyType: 'FUNCTIONAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'REST API concepts, SDMX API usage, Government Open Data Portal (data.gov.in), and open data standards.',
    },

    // ── DOMAIN: Digital Governance ───────────────────────────────────────────
    {
      code: 'CYBERSECURITY', name: 'Cybersecurity & Information Security',
      category: 'Digital Governance', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'CERT-In guidelines, access management, phishing awareness, and government IS security policy compliance.',
    },
    {
      code: 'DATA_PRIVACY', name: 'Data Privacy & Protection',
      category: 'Digital Governance', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Personal Data Protection Act, anonymization techniques, statistical disclosure control, and data sharing protocols.',
    },
    {
      code: 'DIGITAL_SIGNATURES', name: 'Digital Signatures & PKI',
      category: 'Digital Governance', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Public Key Infrastructure, DSC usage in government, e-Sign framework, and digital document authentication.',
    },
    {
      code: 'GOVT_CLOUD', name: 'Government Cloud (MeghRaj)',
      category: 'Digital Governance', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'MeghRaj cloud infrastructure, compliance requirements, migration strategies, and GI Cloud services.',
    },
    {
      code: 'DIGITAL_PUBLIC_INFRA', name: 'Digital Public Infrastructure (DPI)',
      category: 'Digital Governance', competencyType: 'DOMAIN', fracSource: 'MoSPI_FRAC_2024',
      description: 'Aadhaar framework, DigiLocker integration, UPI ecosystem, UMANG platform, and India Stack architecture.',
    },

    // ── DOMAIN: Behavioural & Managerial ─────────────────────────────────────
    {
      code: 'LEADERSHIP', name: 'Leadership & Change Management',
      category: 'Behavioural', competencyType: 'BEHAVIOURAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Situational leadership, team building, organizational change management, and strategic vision for statistical systems.',
    },
    {
      code: 'COMMUNICATION', name: 'Communication & Data Storytelling',
      category: 'Behavioural', competencyType: 'BEHAVIOURAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Report writing, presentation skills, stakeholder management, and communicating statistical findings to non-technical audiences.',
    },
    {
      code: 'PROJECT_MANAGEMENT', name: 'Project & Programme Management',
      category: 'Behavioural', competencyType: 'BEHAVIOURAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Project planning, risk management, monitoring & evaluation, and survey programme management.',
    },
    {
      code: 'ETHICS_INTEGRITY', name: 'Ethics, Integrity & Statistical Ethics',
      category: 'Behavioural', competencyType: 'BEHAVIOURAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Civil servant conduct rules, conflict of interest, UN Fundamental Principles of Official Statistics, and data ethics.',
    },
    {
      code: 'DECISION_MAKING', name: 'Evidence-Based Decision Making',
      category: 'Behavioural', competencyType: 'BEHAVIOURAL', fracSource: 'MoSPI_FRAC_2024',
      description: 'Multi-criteria analysis, data-driven governance frameworks, problem solving methodologies, and policy formulation.',
    },
  ];

  for (const c of compDefs) {
    await db.insert(competencies).values({
      code: c.code,
      name: c.name,
      category: c.category,
      description: c.description,
    }).onConflictDoNothing();

    await db.execute(
      `UPDATE competencies SET competency_type = '${c.competencyType}', frac_source = '${c.fracSource}' WHERE code = '${c.code}'`
    ).catch(() => {});
  }

  // Fetch all competencies from DB so we have complete list (including pre-existing rows)
  const allCompRows = await db.select().from(competencies);
  console.log(`✅ Seeded ${allCompRows.length} MoSPI competencies across 4 FRAC domains`);

  // Seed Learning Objectives for key competencies
  await seedKeyLearningObjectives(allCompRows);

  return allCompRows;
}

async function seedKeyLearningObjectives(competencyRows) {
  const findComp = (code) => competencyRows.find(c => c.code === code);

  const loDefs = [];

  const samplingComp = findComp('SAMPLING_METHODS');
  if (samplingComp) {
    loDefs.push(
      { competencyId: samplingComp.id, code: 'SAMP_LO_01', title: 'Identify probability vs non-probability sampling methods and their appropriate use cases', targetLevel: 2, status: 'ACTIVE', isActive: true },
      { competencyId: samplingComp.id, code: 'SAMP_LO_02', title: 'Calculate minimum required sample size for household surveys with specified margin of error and confidence level', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: samplingComp.id, code: 'SAMP_LO_03', title: 'Apply stratified sampling with proportional and optimal allocation for multi-domain surveys', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: samplingComp.id, code: 'SAMP_LO_04', title: 'Evaluate sampling bias and calculate design effect (DEFF) for complex survey designs', targetLevel: 4, status: 'ACTIVE', isActive: true },
      { competencyId: samplingComp.id, code: 'SAMP_LO_05', title: 'Construct non-response adjustment weights and post-stratification calibration weights', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const surveyComp = findComp('SURVEY_DESIGN');
  if (surveyComp) {
    loDefs.push(
      { competencyId: surveyComp.id, code: 'SURV_LO_01', title: 'Design a household survey questionnaire following cognitive interview principles and skip logic', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: surveyComp.id, code: 'SURV_LO_02', title: 'Implement CAPI (Computer Assisted Personal Interview) using ODK or SurveyToGo platforms', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: surveyComp.id, code: 'SURV_LO_03', title: 'Conduct a pilot test and evaluate questionnaire validity using cognitive debriefing', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: surveyComp.id, code: 'SURV_LO_04', title: 'Construct and validate a sampling frame using administrative records and geographic stratification', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const nasComp = findComp('NATIONAL_ACCOUNTS');
  if (nasComp) {
    loDefs.push(
      { competencyId: nasComp.id, code: 'NAS_LO_01', title: 'Explain the three approaches to GDP estimation (production, income, expenditure) and their reconciliation', targetLevel: 2, status: 'ACTIVE', isActive: true },
      { competencyId: nasComp.id, code: 'NAS_LO_02', title: 'Compute Gross Value Added (GVA) at basic prices for primary, secondary, and tertiary sectors', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: nasComp.id, code: 'NAS_LO_03', title: 'Construct a Supply and Use Table (SUT) and derive an Input-Output table', targetLevel: 4, status: 'ACTIVE', isActive: true },
      { competencyId: nasComp.id, code: 'NAS_LO_04', title: 'Apply appropriate deflators (CPI, WPI, PFCE deflator) to convert nominal to real GDP', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const cpiComp = findComp('PRICE_STATISTICS');
  if (cpiComp) {
    loDefs.push(
      { competencyId: cpiComp.id, code: 'PRICE_LO_01', title: 'Explain the conceptual basis of Laspeyres, Paasche, and Fisher index numbers', targetLevel: 2, status: 'ACTIVE', isActive: true },
      { competencyId: cpiComp.id, code: 'PRICE_LO_02', title: 'Calculate Consumer Price Index for rural, urban, and combined indices using HCES weights', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: cpiComp.id, code: 'PRICE_LO_03', title: 'Perform base year revision for CPI using chain-linking methodology', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const pythonComp = findComp('PYTHON_ANALYTICS');
  if (pythonComp) {
    loDefs.push(
      { competencyId: pythonComp.id, code: 'PY_LO_01', title: 'Perform data cleaning and transformation using pandas DataFrame operations', targetLevel: 2, status: 'ACTIVE', isActive: true },
      { competencyId: pythonComp.id, code: 'PY_LO_02', title: 'Conduct descriptive statistical analysis and hypothesis testing using scipy.stats', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: pythonComp.id, code: 'PY_LO_03', title: 'Build automated data pipelines for processing NSS/PLFS unit-level data files', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: pythonComp.id, code: 'PY_LO_04', title: 'Create publication-quality statistical charts using matplotlib and seaborn', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: pythonComp.id, code: 'PY_LO_05', title: 'Apply regression models and interpret coefficients in a policy context', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const sqlComp = findComp('SQL_DATABASE');
  if (sqlComp) {
    loDefs.push(
      { competencyId: sqlComp.id, code: 'SQL_LO_01', title: 'Write SQL queries with JOINs, GROUP BY, and window functions for statistical data extraction', targetLevel: 2, status: 'ACTIVE', isActive: true },
      { competencyId: sqlComp.id, code: 'SQL_LO_02', title: 'Design normalized database schemas for survey data storage with appropriate constraints', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: sqlComp.id, code: 'SQL_LO_03', title: 'Build ETL pipelines to integrate data from multiple survey rounds into an analytical data warehouse', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const sdgComp = findComp('SDG_INDICATORS');
  if (sdgComp) {
    loDefs.push(
      { competencyId: sdgComp.id, code: 'SDG_LO_01', title: 'Classify SDG indicators into Tier I, II, and III based on data availability and methodology maturity', targetLevel: 2, status: 'ACTIVE', isActive: true },
      { competencyId: sdgComp.id, code: 'SDG_LO_02', title: 'Prepare India SDG Indicator metadata sheets compliant with IAEG-SDGs guidelines', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: sdgComp.id, code: 'SDG_LO_03', title: 'Conduct data gap analysis for SDG monitoring and propose alternative data sources', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const dqComp = findComp('DATA_QUALITY');
  if (dqComp) {
    loDefs.push(
      { competencyId: dqComp.id, code: 'DQ_LO_01', title: 'Apply NQAF principles to assess coverage, accuracy, and timeliness of statistical outputs', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: dqComp.id, code: 'DQ_LO_02', title: 'Conduct a SQAF self-assessment for a survey operation and prepare a quality report', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const cyberComp = findComp('CYBERSECURITY');
  if (cyberComp) {
    loDefs.push(
      { competencyId: cyberComp.id, code: 'CYB_LO_01', title: 'Apply CERT-In guidelines to classify and report cybersecurity incidents in government systems', targetLevel: 2, status: 'ACTIVE', isActive: true },
      { competencyId: cyberComp.id, code: 'CYB_LO_02', title: 'Implement role-based access control (RBAC) and principle of least privilege for data systems', targetLevel: 3, status: 'ACTIVE', isActive: true },
    );
  }

  const privacyComp = findComp('DATA_PRIVACY');
  if (privacyComp) {
    loDefs.push(
      { competencyId: privacyComp.id, code: 'PRIV_LO_01', title: 'Apply k-anonymity and l-diversity techniques to protect respondent identity in microdata releases', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: privacyComp.id, code: 'PRIV_LO_02', title: 'Evaluate data sharing agreements against Personal Data Protection Act requirements', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const leadComp = findComp('LEADERSHIP');
  if (leadComp) {
    loDefs.push(
      { competencyId: leadComp.id, code: 'LEAD_LO_01', title: 'Apply situational leadership model to adapt management style across team maturity levels', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: leadComp.id, code: 'LEAD_LO_02', title: 'Design and lead an organizational change initiative using Kotter\'s 8-step change model', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  const commComp = findComp('COMMUNICATION');
  if (commComp) {
    loDefs.push(
      { competencyId: commComp.id, code: 'COMM_LO_01', title: 'Write a policy brief that translates complex statistical findings into actionable recommendations', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: commComp.id, code: 'COMM_LO_02', title: 'Design a data visualization narrative for a non-technical ministerial audience', targetLevel: 3, status: 'ACTIVE', isActive: true },
    );
  }

  const ethicsComp = findComp('ETHICS_INTEGRITY');
  if (ethicsComp) {
    loDefs.push(
      { competencyId: ethicsComp.id, code: 'ETH_LO_01', title: 'Apply the UN Fundamental Principles of Official Statistics to a real data dissemination decision', targetLevel: 3, status: 'ACTIVE', isActive: true },
      { competencyId: ethicsComp.id, code: 'ETH_LO_02', title: 'Identify and resolve conflicts of interest in official statistical production', targetLevel: 4, status: 'ACTIVE', isActive: true },
    );
  }

  if (loDefs.length > 0) {
    await db.insert(learningObjectives).values(loDefs).onConflictDoNothing();
    console.log(`✅ Seeded ${loDefs.length} learning objectives for key competencies`);
  }
}
