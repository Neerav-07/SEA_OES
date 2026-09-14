import { db } from "../index.js";
import { competencies, learningObjectives, competencyClaims } from "../schema/index.js";

// Full MoSPI FRAC Competency Framework across 4 domains
export const MOSPI_COMPETENCIES = [
  // Statistical Competencies
  {
    code: "SURVEY_DESIGN",
    name: "Survey Design & Methodology",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Design of statistical surveys including questionnaire design, pilot testing, CAPI implementation, and sampling frame construction.",
  },
  {
    code: "SAMPLING_METHODS",
    name: "Sampling Theory & Methods",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Probability and non-probability sampling methods, sample size estimation, design effects, and non-response adjustment.",
  },
  {
    code: "NATIONAL_ACCOUNTS",
    name: "National Accounts Statistics (NAS)",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "GDP estimation using production/income/expenditure approaches, SNA 2008, GVA computation, and supply-use tables.",
  },
  {
    code: "PRICE_STATISTICS",
    name: "Price Statistics (CPI/WPI)",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Consumer Price Index and Wholesale Price Index methodology, index number theory, base revision, and deflation techniques.",
  },
  {
    code: "LABOUR_STATISTICS",
    name: "Labour Statistics (PLFS)",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Periodic Labour Force Survey design, employment concepts (UPSS/UPAS/CWS/CDS), LFPR computation, and unemployment analysis.",
  },
  {
    code: "AGRI_STATISTICS",
    name: "Agricultural Statistics",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Area enumeration, crop cutting experiments, Agricultural Census methodology, and MSP data collection.",
  },
  {
    code: "INDUSTRIAL_STATISTICS",
    name: "Industrial Statistics (ASI/IIP)",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Annual Survey of Industries, Index of Industrial Production, enterprise surveys, and NIC classification.",
  },
  {
    code: "SDG_INDICATORS",
    name: "SDG Indicators & Monitoring",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "SDG Tier classification, VNR reporting, India SDG Index, data gap analysis, and international indicator metadata.",
  },
  {
    code: "DATA_QUALITY",
    name: "Data Quality Assessment & SQAF",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "National Quality Assurance Framework (NQAF), Statistical Quality Assessment Framework (SQAF), error identification, and validation.",
  },
  {
    code: "DEMOGRAPHIC_STATS",
    name: "Demographic & Social Statistics",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Vital statistics, census operations, migration analysis, health/education indicators, and social statistics compilation.",
  },
  {
    code: "METADATA_STANDARDS",
    name: "Statistical Metadata & Standards (SDMX)",
    category: "Statistical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "SDMX implementation, DDI standard, metadata registries, statistical classification systems (NIC/NCO/NPC), and data documentation.",
  },

  // Technical Competencies
  {
    code: "PYTHON_ANALYTICS",
    name: "Python for Statistical Computing",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Data manipulation with pandas/numpy, statistical modeling with scipy/statsmodels, survey data processing, and automation scripts.",
  },
  {
    code: "R_PROGRAMMING",
    name: "R for Statistical Analysis",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Survey analysis using survey/srvyr packages, tidyverse data manipulation, ggplot2 visualization, and R Markdown reporting.",
  },
  {
    code: "SQL_DATABASE",
    name: "SQL & Relational Database Management",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Complex SQL queries, database design, query optimization, indexing strategies, PostgreSQL administration, and ETL pipelines.",
  },
  {
    code: "BIG_DATA_ANALYTICS",
    name: "Big Data & High Performance Computing",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Apache Spark, distributed computing, handling large-scale administrative datasets, data lakes, and Hadoop ecosystem.",
  },
  {
    code: "AI_ML_FUNDAMENTALS",
    name: "AI & Machine Learning for Official Statistics",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Supervised and unsupervised learning, NLP for survey text classification, ML-based data imputation, and predictive modeling for statistics.",
  },
  {
    code: "DATA_VISUALIZATION",
    name: "Data Visualization & Dashboard Design",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Power BI, Tableau, D3.js, interactive dashboards for dissemination, geospatial mapping, and publication graphics.",
  },
  {
    code: "GIS_SPATIAL",
    name: "GIS & Spatial Analytics for Surveys",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "QGIS/ArcGIS, spatial sampling frames, satellite imagery for crop estimation, geotagged survey validation, and thematic mapping.",
  },
  {
    code: "CLOUD_COMPUTING",
    name: "Cloud Infrastructure & MeghRaj",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "MeghRaj government cloud, containerization with Docker, scalable data pipelines, cloud security, and serverless architectures.",
  },
  {
    code: "APIS_OPEN_DATA",
    name: "APIs & Open Data Dissemination",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "RESTful API design, data.gov.in integration, automated data feeds, NDAP platform, and machine-readable data publishing.",
  },
  {
    code: "CYBERSECURITY",
    name: "Cybersecurity & Information Assurance",
    category: "Technical",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "CERT-In guidelines, secure coding practices, data encryption at rest and in transit, access control policies, and incident response.",
  },

  // Digital Governance
  {
    code: "DATA_GOVERNANCE",
    name: "Data Governance & Policy Frameworks",
    category: "Digital Governance",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "National Data Governance Framework Policy (NDGFP), data lineage, data cataloguing, inter-departmental data sharing protocols.",
  },
  {
    code: "DATA_PRIVACY",
    name: "Data Privacy & Anonymisation (DPDP Act)",
    category: "Digital Governance",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "Digital Personal Data Protection Act 2023 compliance, statistical disclosure control (SDC), differential privacy, and de-identification.",
  },
  {
    code: "OPEN_DATA_STANDARDS",
    name: "National Open Data Policy & Standards",
    category: "Digital Governance",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "NDSAL policy compliance, open licenses (GODL-India), metadata standards for public data, and FAIR data principles.",
  },
  {
    code: "AI_ETHICS_GOVERNANCE",
    name: "AI Ethics & Responsible AI in Government",
    category: "Digital Governance",
    competencyType: "DOMAIN",
    fracSource: "MoSPI_FRAC_2024",
    description: "NITI Aayog Responsible AI principles, algorithmic bias mitigation, fairness in public sector AI, and explainable AI (XAI).",
  },

  // Behavioural & Managerial
  {
    code: "PROJECT_MANAGEMENT",
    name: "Project & Programme Management",
    category: "Behavioural",
    competencyType: "BEHAVIOURAL",
    fracSource: "MoSPI_FRAC_2024",
    description: "Project planning, risk management, monitoring & evaluation, survey logistics, and resource management.",
  },
  {
    code: "STRATEGIC_PLANNING",
    name: "Strategic Planning & Policy Formulation",
    category: "Behavioural",
    competencyType: "BEHAVIOURAL",
    fracSource: "MoSPI_FRAC_2024",
    description: "Long-term statistical capacity planning, stakeholder coordination, policy impact evaluation, and resource allocation.",
  },
  {
    code: "LEADERSHIP",
    name: "Leadership & Change Management",
    category: "Behavioural",
    competencyType: "BEHAVIOURAL",
    fracSource: "MoSPI_FRAC_2024",
    description: "Situational leadership, team building, organizational change management, and strategic vision for statistical systems.",
  },
  {
    code: "COMMUNICATION",
    name: "Communication & Data Storytelling",
    category: "Behavioural",
    competencyType: "BEHAVIOURAL",
    fracSource: "MoSPI_FRAC_2024",
    description: "Report writing, presentation skills, stakeholder management, and communicating statistical findings to policy makers.",
  },
  {
    code: "ETHICS_INTEGRITY",
    name: "Ethics, Integrity & Statistical Ethics",
    category: "Behavioural",
    competencyType: "BEHAVIOURAL",
    fracSource: "MoSPI_FRAC_2024",
    description: "Civil servant conduct rules, conflict of interest, UN Fundamental Principles of Official Statistics, and data ethics.",
  },
];

// Seeds all 29 MoSPI competencies, learning objectives, and competency claims
export async function seedMoSPICompetencies() {
  console.log("🌱 Seeding MoSPI FRAC competency framework...");

  // Insert competencies
  for (const c of MOSPI_COMPETENCIES) {
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

  const allCompRows = await db.select().from(competencies);
  console.log(`✅ Seeded ${allCompRows.length} MoSPI competencies across 4 FRAC domains`);

  // Seed Learning Objectives for each competency
  const loDefs = [];
  for (const comp of allCompRows) {
    loDefs.push(
      {
        competencyId: comp.id,
        code: `${comp.code}_LO_01`,
        title: `Apply core concepts and operational methodology of ${comp.name}`,
        description: `Official understands and implements foundational protocols in accordance with MoSPI standards for ${comp.name}.`,
        targetLevel: 3,
        status: "ACTIVE",
        isActive: true,
      },
      {
        competencyId: comp.id,
        code: `${comp.code}_LO_02`,
        title: `Audit, troubleshoot, and ensure statistical quality compliance for ${comp.name}`,
        description: `Official conducts quality reviews, identifies non-sampling errors, and ensures compliance with NQAF guidelines for ${comp.name}.`,
        targetLevel: 4,
        status: "ACTIVE",
        isActive: true,
      }
    );
  }

  if (loDefs.length > 0) {
    await db.insert(learningObjectives).values(loDefs).onConflictDoNothing();
    console.log(`✅ Seeded ${loDefs.length} learning objectives`);
  }

  // Seed Competency Claims for all competencies
  const claimDefs = [];
  for (const comp of allCompRows) {
    claimDefs.push(
      {
        competencyId: comp.id,
        code: `${comp.code}_CLAIM_01`,
        statement: `Official demonstrates direct ability to execute ${comp.name} in accordance with official MoSPI guidelines and procedures.`,
        status: "ACTIVE",
      },
      {
        competencyId: comp.id,
        code: `${comp.code}_CLAIM_02`,
        statement: `Official demonstrates capacity to audit, validate, and troubleshoot complex issues arising within ${comp.name}.`,
        status: "ACTIVE",
      }
    );
  }

  if (claimDefs.length > 0) {
    await db.insert(competencyClaims).values(claimDefs).onConflictDoNothing();
    console.log(`✅ Seeded ${claimDefs.length} competency claims`);
  }

  return allCompRows;
}
