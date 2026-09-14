import { db } from "../index.js";
import { learningMaterials } from "../schema/index.js";

/**
 * Authoritative MoSPI & iGOT Karmayogi Learning Materials
 * Mapped to canonical MoSPI FRAC competencies for data-driven recommendation engine.
 */
export const LEARNING_MATERIALS = [
  // SAMPLING_METHODS
  {
    compCode: "SAMPLING_METHODS",
    materialCode: "NSSTA-SAMP-301",
    title: "Advanced Survey Sampling Design & Complex Estimation Techniques",
    provider: "NSSTA Academy",
    durationHours: 8,
    prerequisites: ["BASIC-STAT-101"],
    mappedObjectives: ["Multi-stage stratified sampling", "GREG estimation", "Variance calculation"],
    matchConfidence: 0.96,
  },
  {
    compCode: "SAMPLING_METHODS",
    materialCode: "IGOT-SAMP-202",
    title: "Probability Sampling and Non-Response Imputation for National Surveys",
    provider: "iGOT Karmayogi (MoSPI)",
    durationHours: 6,
    prerequisites: [],
    mappedObjectives: ["Unit non-response", "Weight adjustment", "Sample allocation"],
    matchConfidence: 0.92,
  },

  // SURVEY_DESIGN
  {
    compCode: "SURVEY_DESIGN",
    materialCode: "NSSTA-SURV-401",
    title: "CAPI Architecture, Field Operations & Digital Survey Logistics",
    provider: "NSSTA Academy",
    durationHours: 10,
    prerequisites: ["NSSTA-SAMP-301"],
    mappedObjectives: ["CAPI tablet validation", "ODK/SurveyToGo workflows", "Field supervisory controls"],
    matchConfidence: 0.95,
  },
  {
    compCode: "SURVEY_DESIGN",
    materialCode: "IGOT-SURV-103",
    title: "Questionnaire Design & Cognitive Pretesting for Socio-Economic Surveys",
    provider: "iGOT Karmayogi (DoPT)",
    durationHours: 5,
    prerequisites: [],
    mappedObjectives: ["Survey instrument design", "Measurement error mitigation", "Pilot testing"],
    matchConfidence: 0.89,
  },

  // DATA_QUALITY
  {
    compCode: "DATA_QUALITY",
    materialCode: "MOSPI-SQAF-501",
    title: "National Statistical Quality Assurance Framework (SQAF) Compliance Audit",
    provider: "MoSPI Training Division",
    durationHours: 6,
    prerequisites: [],
    mappedObjectives: ["SQAF dimension indicators", "Data auditing protocols", "Metadata consistency"],
    matchConfidence: 0.98,
  },
  {
    compCode: "DATA_QUALITY",
    materialCode: "IGOT-QUAL-204",
    title: "Statistical Data Cleaning, Outlier Detection and Validation Rules",
    provider: "iGOT Karmayogi (MoSPI)",
    durationHours: 4,
    prerequisites: [],
    mappedObjectives: ["Consistency checks", "Hot-deck imputation", "Logical rule validation"],
    matchConfidence: 0.91,
  },

  // PYTHON_ANALYTICS
  {
    compCode: "PYTHON_ANALYTICS",
    materialCode: "NSSTA-PY-402",
    title: "Python for Large-Scale Survey Microdata Analytics (NSS & PLFS)",
    provider: "NSSTA Academy",
    durationHours: 12,
    prerequisites: ["BASIC-PY-101"],
    mappedObjectives: ["Pandas unit-level data processing", "Survey weight expansion", "Cross-tabulation automation"],
    matchConfidence: 0.97,
  },
  {
    compCode: "PYTHON_ANALYTICS",
    materialCode: "IGOT-PY-105",
    title: "Pandas & NumPy for Official Statistical Computation",
    provider: "iGOT Karmayogi (NIC)",
    durationHours: 8,
    prerequisites: [],
    mappedObjectives: ["DataFrame manipulation", "Aggregation & pivoting", "Data export formats"],
    matchConfidence: 0.90,
  },

  // SQL_DATABASE
  {
    compCode: "SQL_DATABASE",
    materialCode: "NSSTA-SQL-303",
    title: "Relational Database Management & SQL Queries for Statistical Registries",
    provider: "NSSTA Academy",
    durationHours: 10,
    prerequisites: [],
    mappedObjectives: ["Complex JOINs & window functions", "Registry indexing", "ETL query pipelines"],
    matchConfidence: 0.94,
  },
  {
    compCode: "SQL_DATABASE",
    materialCode: "IGOT-SQL-201",
    title: "PostgreSQL for Public Sector Data Management",
    provider: "iGOT Karmayogi (NIC)",
    durationHours: 6,
    prerequisites: [],
    mappedObjectives: ["Schema design", "Query optimization", "Data integrity constraints"],
    matchConfidence: 0.88,
  },

  // NATIONAL_ACCOUNTS
  {
    compCode: "NATIONAL_ACCOUNTS",
    materialCode: "NSSTA-NAS-501",
    title: "System of National Accounts (SNA 2008): GVA, GDP & Supply-Use Tables",
    provider: "MoSPI NAD / NSSTA",
    durationHours: 14,
    prerequisites: ["BASIC-ECON-101"],
    mappedObjectives: ["Gross Value Added estimation", "FISIM allocation", "Supply and Use Framework"],
    matchConfidence: 0.99,
  },
  {
    compCode: "NATIONAL_ACCOUNTS",
    materialCode: "IGOT-NAS-302",
    title: "Double Deflation Methodology & Constant Price Estimation in NAS",
    provider: "iGOT Karmayogi (MoSPI)",
    durationHours: 8,
    prerequisites: [],
    mappedObjectives: ["Price deflators", "Base year revision", "Chain volume measures"],
    matchConfidence: 0.93,
  },

  // PRICE_STATISTICS
  {
    compCode: "PRICE_STATISTICS",
    materialCode: "MOSPI-CPI-401",
    title: "Consumer Price Index (CPI) Compilation, Basket Weighting & Chaining",
    provider: "MoSPI Price Statistics Division",
    durationHours: 8,
    prerequisites: [],
    mappedObjectives: ["Laspeyres & Fisher indices", "Item substitution rules", "Geometric mean pricing"],
    matchConfidence: 0.96,
  },

  // LABOUR_STATISTICS
  {
    compCode: "LABOUR_STATISTICS",
    materialCode: "NSSTA-PLFS-302",
    title: "Periodic Labour Force Survey (PLFS) Concepts, Metrics & Tabulations",
    provider: "NSSTA Academy",
    durationHours: 8,
    prerequisites: [],
    mappedObjectives: ["UPSS & Current Weekly Status", "Worker Population Ratio", "Sectoral classification"],
    matchConfidence: 0.95,
  },

  // METADATA_STANDARDS
  {
    compCode: "METADATA_STANDARDS",
    materialCode: "DIID-SDMX-401",
    title: "National Data Warehouse (NDW) Metadata Cataloguing & SDMX Standards",
    provider: "DIID MoSPI",
    durationHours: 6,
    prerequisites: [],
    mappedObjectives: ["SDMX data structure definitions", "Dublin Core metadata", "Cataloguing APIs"],
    matchConfidence: 0.93,
  },

  // ETHICS_INTEGRITY
  {
    compCode: "ETHICS_INTEGRITY",
    materialCode: "DOPT-ETH-101",
    title: "Code of Conduct & Statistical Integrity for Civil Servants",
    provider: "DoPT / iGOT Karmayogi",
    durationHours: 4,
    prerequisites: [],
    mappedObjectives: ["Official Secrets Act compliance", "Data confidentiality", "Impartiality in dissemination"],
    matchConfidence: 0.98,
  },

  // SDG_INDICATORS
  {
    compCode: "SDG_INDICATORS",
    materialCode: "MOSPI-SDG-301",
    title: "SDG National Indicator Framework (NIF) Monitoring & Tier Reporting",
    provider: "MoSPI Sustainable Development Unit",
    durationHours: 6,
    prerequisites: [],
    mappedObjectives: ["Tier I/II/III classification", "State Indicator Frameworks", "VNR reports"],
    matchConfidence: 0.94,
  },

  // AI_ML_FUNDAMENTALS
  {
    compCode: "AI_ML_FUNDAMENTALS",
    materialCode: "NSSTA-AIML-501",
    title: "Applied Machine Learning & Natural Language Processing in Official Statistics",
    provider: "NSSTA Academy",
    durationHours: 10,
    prerequisites: ["NSSTA-PY-402"],
    mappedObjectives: ["Automated industry/occupation coding", "Supervised classification", "Statistical imputation"],
    matchConfidence: 0.95,
  },

  // DATA_VISUALIZATION
  {
    compCode: "DATA_VISUALIZATION",
    materialCode: "NSSTA-DVIZ-202",
    title: "Official Statistics Dissemination Dashboards using Power BI & Tableau",
    provider: "NSSTA Academy",
    durationHours: 6,
    prerequisites: [],
    mappedObjectives: ["Interactive maps", "Indicator time-series charts", "Public portal dissemination"],
    matchConfidence: 0.91,
  },
];

export async function seedLearningMaterials(competencyRows = []) {
  console.log("🌱 Seeding authoritative MoSPI learning materials...");
  const findComp = (code) => competencyRows.find((c) => c.code === code);

  let insertedCount = 0;
  for (const mat of LEARNING_MATERIALS) {
    const comp = findComp(mat.compCode);
    const [row] = await db.insert(learningMaterials).values({
      competencyId: comp ? comp.id : null,
      materialCode: mat.materialCode,
      title: mat.title,
      provider: mat.provider,
      durationHours: mat.durationHours,
      prerequisites: mat.prerequisites,
      mappedObjectives: mat.mappedObjectives,
      matchConfidence: mat.matchConfidence,
    }).onConflictDoNothing().returning().catch(() => []);

    if (row) insertedCount++;
  }

  console.log(`✅ Seeded ${insertedCount} authoritative MoSPI learning materials`);
}
