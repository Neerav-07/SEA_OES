/**
 * Kshamata Unified Master Database Seed Orchestrator
 *
 * Execution stages:
 *   1. Preserves and seeds official credentials across all MoSPI divisions & cadres
 *   2. Safely clears operational and transactional tables
 *   3. Seeds MoSPI Competency Framework across all 4 FRAC domains
 *   4. Seeds FRAC roles, activities, and competency requirements
 *   5. Links official profiles with designations, cadres and divisions
 *   6. Seeds multi-source verified evidence and calculates Bayesian skill gaps
 *   7. Seeds authoritative MoSPI source manuals, chunks, grounded assessments & review items
 *   8. Seeds realistic MoSPI assessment blueprints with claims & objectives
 *   9. Seeds realistic completed assessment attempts with genuine past timestamps
 *  10. Seeds iGOT course catalogue and active official enrolments
 *  11. Seeds NSSTA TPAC programme catalogue and circular notices
 *  12. Seeds longitudinal competency history for analytics & predictive forecasts
 *  13. Seeds institutional governance audit logs
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";
import { connectDatabase, getDb } from "../../config/database.js";
import {
  users,
  roles,
  officials,
  evidence,
  igotCourses,
  igotEnrolments,
  auditLogs,
  assessments,
} from "../schema/index.js";
import { seedMoSPICompetencies } from "./competencies.seed.js";
import { seedFracRoles } from "./roles.seed.js";
import { seedMoSPISources } from "./sources.seed.js";
import { seedAssessmentBlueprints } from "./blueprints.seed.js";
import { seedNsstaProgrammes, seedNsstaNotices } from "./programmes.seed.js";
import { seedCompetencyHistory } from "./history.seed.js";
import { seedLearningMaterials } from "./materials.seed.js";
import { getAllMockCourses } from "../../services/igot.service.js";
import { recalculateSkillGaps } from "../../services/skillGap.service.js";
import { triggerAutoGapAndRecommendations } from "../../services/autoAutomation.service.js";
import { refreshNoticeRecommendations } from "../../services/noticeRecommendation.service.js";

export async function seedDatabase() {
  console.log("\n=======================================================");
  console.log("  Kshamata V2 — Unified Master Database Seed Pipeline");
  console.log("=======================================================\n");

  await connectDatabase();
  const db = getDb();

  // ── Step 1: Preserve and Confirm Official User Credentials ──
  console.log("[1/13] Verifying user credentials across MoSPI divisions...");
  const saltRounds = 12;
  const adminHash = await bcrypt.hash("Admin@123!", saltRounds);
  const employeeHash = await bcrypt.hash("Test@123!", saltRounds);

  const officialAccounts = [
    {
      email: "admin@nssta.gov.in",
      fullName: "Dr. Alok Verma",
      platformRole: "ADMIN",
      designation: "Director General & Head of Training",
      department: "National Statistical Systems Training Academy (NSSTA)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: adminHash,
    },
    // DIID (Data Informatics & Innovation Division)
    {
      email: "rajesh.kumar@mospi.gov.in",
      fullName: "Rajesh Kumar",
      platformRole: "EMPLOYEE",
      designation: "Senior Statistical Officer (SSO)",
      department: "Data Informatics & Innovation Division (DIID)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: employeeHash,
    },
    {
      email: "sunita.rao@mospi.gov.in",
      fullName: "Sunita Rao",
      platformRole: "EMPLOYEE",
      designation: "Director (Data Architecture & Big Data)",
      department: "Data Informatics & Innovation Division (DIID)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: employeeHash,
    },
    {
      email: "deepak.joshi@mospi.gov.in",
      fullName: "Deepak Joshi",
      platformRole: "EMPLOYEE",
      designation: "Junior Statistical Officer (JSO)",
      department: "Data Informatics & Innovation Division (DIID)",
      cadre: "SSS (Subordinate Statistical Service)",
      passwordHash: employeeHash,
    },
    // NSSO & FOD (Field Operations Division)
    {
      email: "priya.sharma@nsso.gov.in",
      fullName: "Priya Sharma",
      platformRole: "EMPLOYEE",
      designation: "Assistant Director (Surveys)",
      department: "National Sample Survey Office (NSSO)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: employeeHash,
    },
    {
      email: "manoj.tiwari@nsso.gov.in",
      fullName: "Manoj Tiwari",
      platformRole: "EMPLOYEE",
      designation: "Senior Statistical Officer (Field Scrutiny)",
      department: "Field Operations Division (FOD)",
      cadre: "SSS (Subordinate Statistical Service)",
      passwordHash: employeeHash,
    },
    {
      email: "ananya.roy@nsso.gov.in",
      fullName: "Ananya Roy",
      platformRole: "EMPLOYEE",
      designation: "Junior Statistical Officer (CAPI Operations)",
      department: "Field Operations Division (FOD)",
      cadre: "SSS (Subordinate Statistical Service)",
      passwordHash: employeeHash,
    },
    // NAD (National Accounts Division)
    {
      email: "amit.verma@mospi.gov.in",
      fullName: "Amit Verma",
      platformRole: "EMPLOYEE",
      designation: "Junior Statistical Officer (JSO)",
      department: "National Accounts Division (NAD)",
      cadre: "SSS (Subordinate Statistical Service)",
      passwordHash: employeeHash,
    },
    {
      email: "dr.ramesh.chandra@mospi.gov.in",
      fullName: "Dr. Ramesh Chandra",
      platformRole: "EMPLOYEE",
      designation: "Joint Director (GVA & SUT Compilation)",
      department: "National Accounts Division (NAD)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: employeeHash,
    },
    {
      email: "kavita.meena@mospi.gov.in",
      fullName: "Kavita Meena",
      platformRole: "EMPLOYEE",
      designation: "Senior Statistical Officer (Input-Output Matrices)",
      department: "National Accounts Division (NAD)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: employeeHash,
    },
    // ESD (Economic Statistics Division)
    {
      email: "vikram.singh@mospi.gov.in",
      fullName: "Vikram Singh",
      platformRole: "EMPLOYEE",
      designation: "Deputy Director (Annual Survey of Industries)",
      department: "Economic Statistics Division (ESD)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: employeeHash,
    },
    {
      email: "pooja.patel@mospi.gov.in",
      fullName: "Pooja Patel",
      platformRole: "EMPLOYEE",
      designation: "Senior Statistical Officer (CPI/WPI Pricing)",
      department: "Economic Statistics Division (ESD)",
      cadre: "SSS (Subordinate Statistical Service)",
      passwordHash: employeeHash,
    },
    // SDRD (Survey Design & Research Division)
    {
      email: "dr.sanjay.m@mospi.gov.in",
      fullName: "Dr. Sanjay Mukhopadhyay",
      platformRole: "EMPLOYEE",
      designation: "Director (Sampling Methodology)",
      department: "Survey Design & Research Division (SDRD)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: employeeHash,
    },
    {
      email: "neha.gupta@mospi.gov.in",
      fullName: "Neha Gupta",
      platformRole: "EMPLOYEE",
      designation: "Assistant Director (Questionnaire Design)",
      department: "Survey Design & Research Division (SDRD)",
      cadre: "ISS (Indian Statistical Service)",
      passwordHash: employeeHash,
    },
    // DPD (Data Processing Division)
    {
      email: "arun.nair@mospi.gov.in",
      fullName: "Arun Nair",
      platformRole: "EMPLOYEE",
      designation: "Senior Statistical Officer (Microdata Tabulation)",
      department: "Data Processing Division (DPD)",
      cadre: "SSS (Subordinate Statistical Service)",
      passwordHash: employeeHash,
    },
  ];

  const userMap = {};
  for (const acc of officialAccounts) {
    const [existing] = await db.select().from(users).where(eq(users.email, acc.email));
    if (!existing) {
      const [created] = await db.insert(users).values({
        email: acc.email,
        passwordHash: acc.passwordHash,
        name: acc.fullName,
        platformRole: acc.platformRole,
        designation: acc.designation,
        department: acc.department,
        cadre: acc.cadre,
      }).returning();
      userMap[acc.email] = created.id;
    } else {
      userMap[acc.email] = existing.id;
    }
  }
  console.log(`  -> User credentials confirmed for ${officialAccounts.length} official accounts`);

  // ── Step 2: Clear Operational and Transactional Tables ──
  console.log("[2/13] Clearing operational tables...");
  const tablesToClear = [
    "evidence",
    "competency_estimates",
    "sub_competency_estimates",
    "skill_gaps",
    "recommendations",
    "notice_course_recommendations",
    "assessment_attempts",
    "question_review_queue",
    "question_source_provenance",
    "question_validation_results",
    "question_versions",
    "questions",
    "assessments",
    "assessment_blueprint_claims",
    "assessment_blueprint_objectives",
    "assessment_blueprints",
    "source_chunks",
    "source_document_versions",
    "source_documents",
    "igot_enrolments",
    "igot_courses",
    "learning_materials",
    "nssta_notice_competencies",
    "nssta_notices",
    "nssta_competency_map",
    "nssta_programmes",
    "competency_requirements",
    "activities",
    "competency_claims",
    "learning_objectives",
    "audit_logs",
    "competency_history",
  ];

  for (const tbl of tablesToClear) {
    try {
      await db.execute(sql.raw(`DELETE FROM ${tbl}`));
    } catch (e) {
      // Table may not exist in some environments; ignore safely
    }
  }
  console.log("  -> Operational tables cleared successfully");

  // ── Step 3: Seed MoSPI Competencies ──
  console.log("[3/13] Seeding MoSPI Competency Framework...");
  const competencyRows = await seedMoSPICompetencies();
  const findComp = (code) => competencyRows.find((c) => c.code === code);

  // ── Step 4: Seed FRAC Roles & Requirements ──
  console.log("[4/13] Seeding FRAC roles, activities & competency requirements...");
  const roleRows = await seedFracRoles(competencyRows);
  const roleMap = {};
  for (const r of roleRows) roleMap[r.code] = r;

  // ── Step 5: Link Official Profiles to Users ──
  console.log("[5/13] Linking official profiles to users across MoSPI divisions...");
  const officialProfiles = [
    {
      email: "rajesh.kumar@mospi.gov.in",
      roleCode: "ISS_SO",
      designation: "Senior Statistical Officer (SSO)",
      department: "Data Informatics & Innovation Division (DIID)",
      cadre: "ISS (Indian Statistical Service)",
      experienceYears: 7,
      education: "M.Sc. in Statistics (Delhi University)",
    },
    {
      email: "sunita.rao@mospi.gov.in",
      roleCode: "DATA_SCIENTIST",
      designation: "Director (Data Architecture & Big Data)",
      department: "Data Informatics & Innovation Division (DIID)",
      cadre: "ISS (Indian Statistical Service)",
      experienceYears: 16,
      education: "Ph.D. in Computer Science & Statistics (IIT Delhi)",
    },
    {
      email: "deepak.joshi@mospi.gov.in",
      roleCode: "SSS_JSO",
      designation: "Junior Statistical Officer (JSO)",
      department: "Data Informatics & Innovation Division (DIID)",
      cadre: "SSS (Subordinate Statistical Service)",
      experienceYears: 2,
      education: "B.Sc. (Hons) Statistics (Rajasthan University)",
    },
    {
      email: "priya.sharma@nsso.gov.in",
      roleCode: "ISS_AD",
      designation: "Assistant Director (Surveys)",
      department: "National Sample Survey Office (NSSO)",
      cadre: "ISS (Indian Statistical Service)",
      experienceYears: 10,
      education: "M.Stat. (Indian Statistical Institute, Kolkata)",
    },
    {
      email: "manoj.tiwari@nsso.gov.in",
      roleCode: "ISS_SO",
      designation: "Senior Statistical Officer (Field Scrutiny)",
      department: "Field Operations Division (FOD)",
      cadre: "SSS (Subordinate Statistical Service)",
      experienceYears: 8,
      education: "M.Sc. Mathematical Statistics (Lucknow University)",
    },
    {
      email: "ananya.roy@nsso.gov.in",
      roleCode: "SSS_JSO",
      designation: "Junior Statistical Officer (CAPI Operations)",
      department: "Field Operations Division (FOD)",
      cadre: "SSS (Subordinate Statistical Service)",
      experienceYears: 3,
      education: "B.Stat. (Indian Statistical Institute)",
    },
    {
      email: "amit.verma@mospi.gov.in",
      roleCode: "SSS_JSO",
      designation: "Junior Statistical Officer (JSO)",
      department: "National Accounts Division (NAD)",
      cadre: "SSS (Subordinate Statistical Service)",
      experienceYears: 2,
      education: "B.Sc. (Hons) Statistics & Mathematics (BHU)",
    },
    {
      email: "dr.ramesh.chandra@mospi.gov.in",
      roleCode: "ISS_DD",
      designation: "Joint Director (GVA & SUT Compilation)",
      department: "National Accounts Division (NAD)",
      cadre: "ISS (Indian Statistical Service)",
      experienceYears: 18,
      education: "Ph.D. in Econometrics (Delhi School of Economics)",
    },
    {
      email: "kavita.meena@mospi.gov.in",
      roleCode: "ISS_SO",
      designation: "Senior Statistical Officer (Input-Output Matrices)",
      department: "National Accounts Division (NAD)",
      cadre: "ISS (Indian Statistical Service)",
      experienceYears: 6,
      education: "M.Sc. Applied Statistics (IIT Kanpur)",
    },
    {
      email: "vikram.singh@mospi.gov.in",
      roleCode: "ISS_DD",
      designation: "Deputy Director (Annual Survey of Industries)",
      department: "Economic Statistics Division (ESD)",
      cadre: "ISS (Indian Statistical Service)",
      experienceYears: 12,
      education: "M.A. Economics & Statistics (JNU New Delhi)",
    },
    {
      email: "pooja.patel@mospi.gov.in",
      roleCode: "ISS_SO",
      designation: "Senior Statistical Officer (CPI/WPI Pricing)",
      department: "Economic Statistics Division (ESD)",
      cadre: "SSS (Subordinate Statistical Service)",
      experienceYears: 7,
      education: "M.Sc. Statistics (Gujarat University)",
    },
    {
      email: "dr.sanjay.m@mospi.gov.in",
      roleCode: "ISS_DIR",
      designation: "Director (Sampling Methodology)",
      department: "Survey Design & Research Division (SDRD)",
      cadre: "ISS (Indian Statistical Service)",
      experienceYears: 20,
      education: "Ph.D. in Sampling Theory (ISI Kolkata)",
    },
    {
      email: "neha.gupta@mospi.gov.in",
      roleCode: "ISS_AD",
      designation: "Assistant Director (Questionnaire Design)",
      department: "Survey Design & Research Division (SDRD)",
      cadre: "ISS (Indian Statistical Service)",
      experienceYears: 9,
      education: "M.Stat. (Indian Statistical Institute)",
    },
    {
      email: "arun.nair@mospi.gov.in",
      roleCode: "ISS_SO",
      designation: "Senior Statistical Officer (Microdata Tabulation)",
      department: "Data Processing Division (DPD)",
      cadre: "SSS (Subordinate Statistical Service)",
      experienceYears: 8,
      education: "MCA & P.G. Diploma in Statistical Methods (Kerala University)",
    },
  ];

  const officialRows = [];
  const officialByEmail = {};

  for (const prof of officialProfiles) {
    const userId = userMap[prof.email];
    if (!userId) continue;

    const roleId = roleMap[prof.roleCode]?.id || roleMap["ISS_SO"]?.id;
    const [existing] = await db.select().from(officials).where(eq(officials.userId, userId));

    if (existing) {
      const [updated] = await db.update(officials).set({
        roleId,
        designation: prof.designation,
        department: prof.department,
        cadre: prof.cadre,
        experienceYears: prof.experienceYears,
        education: prof.education,
      }).where(eq(officials.id, existing.id)).returning();
      officialRows.push(updated);
      officialByEmail[prof.email] = updated;
    } else {
      const [created] = await db.insert(officials).values({
        userId,
        roleId,
        designation: prof.designation,
        department: prof.department,
        cadre: prof.cadre,
        experienceYears: prof.experienceYears,
        education: prof.education,
      }).returning();
      officialRows.push(created);
      officialByEmail[prof.email] = created;
    }
  }
  console.log(`  -> ${officialRows.length} official profiles linked across 7 divisions`);

  // ── Step 6: Seed Verified Multi-Source Evidence & Calculate Skill Gaps ──
  console.log("[6/13] Seeding multi-source verified evidence & calculating skill gaps...");

  const officialEvidenceMap = {
    "rajesh.kumar@mospi.gov.in": [
      { code: "SAMPLING_METHODS", type: "KNOWLEDGE", score: 4.0, prov: "NSSTA Mid-Career Examination 2024" },
      { code: "SAMPLING_METHODS", type: "APPLICATION", score: 3.8, prov: "NSS 79th Round Domestic Tourism Survey Sampling Design" },
      { code: "SURVEY_DESIGN", type: "APPLICATION", score: 4.2, prov: "Periodic Labour Force Survey (PLFS) CAPI Questionnaire Audit" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 3.5, prov: "MoSPI SQAF Data Audit Certification 2024" },
      { code: "PYTHON_ANALYTICS", type: "KNOWLEDGE", score: 2.2, prov: "Online Python Data Structures Assessment" },
      { code: "PYTHON_ANALYTICS", type: "APPLICATION", score: 2.0, prov: "Pandas Survey Microdata Pipeline Lab Exercise" },
      { code: "COMMUNICATION", type: "OBSERVATION", score: 4.5, prov: "Annual Confidential Report (ACR/APAR) Evaluation" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.8, prov: "iGOT Karmayogi Code of Conduct Certification" },
      { code: "METADATA_STANDARDS", type: "APPLICATION", score: 2.4, prov: "National Data Warehouse Cataloguing Workshop" },
      { code: "SQL_DATABASE", type: "KNOWLEDGE", score: 2.8, prov: "Database Queries Diagnostic 2025" },
    ],
    "sunita.rao@mospi.gov.in": [
      { code: "PYTHON_ANALYTICS", type: "APPLICATION", score: 4.6, prov: "Large-Scale Microdata Vectorized Pipelines Lab" },
      { code: "SQL_DATABASE", type: "APPLICATION", score: 4.5, prov: "National Data Warehouse High-Concurrency Queries" },
      { code: "AI_ML_FUNDAMENTALS", type: "APPLICATION", score: 4.2, prov: "MoSPI Automated Imputation & Outlier Detection Model" },
      { code: "DATA_VISUALIZATION", type: "APPLICATION", score: 4.4, prov: "Public Dissemination Dashboard Certification" },
      { code: "DATA_PRIVACY", type: "KNOWLEDGE", score: 4.0, prov: "Statistical Disclosure Control (SDC) Framework Audit" },
      { code: "LEADERSHIP", type: "OBSERVATION", score: 4.2, prov: "DIID Innovation Team Direction Review" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 4.3, prov: "NQAF Core Metadata Quality Review" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.8, prov: "National Academy Senior Officer Ethics Certification" },
    ],
    "deepak.joshi@mospi.gov.in": [
      { code: "METADATA_STANDARDS", type: "APPLICATION", score: 3.2, prov: "National Data Warehouse SDMX Metadata Mapping" },
      { code: "SQL_DATABASE", type: "APPLICATION", score: 3.0, prov: "Data Cataloguing and Schema Documentation" },
      { code: "DATA_QUALITY", type: "KNOWLEDGE", score: 3.1, prov: "Catalog Integrity Verification" },
      { code: "PYTHON_ANALYTICS", type: "APPLICATION", score: 2.5, prov: "Python Data Wrangling Fundamentals" },
      { code: "COMMUNICATION", type: "OBSERVATION", score: 3.4, prov: "Inter-departmental Data Exchange Liaison" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.0, prov: "Karmayogi Digital Data Governance Module" },
    ],
    "priya.sharma@nsso.gov.in": [
      { code: "SAMPLING_METHODS", type: "APPLICATION", score: 4.2, prov: "NSSTA IST-2024-003 Course Completion" },
      { code: "SURVEY_DESIGN", type: "APPLICATION", score: 3.8, prov: "PLFS CAPI Schedule Field Trial & Validation" },
      { code: "LABOUR_STATISTICS", type: "KNOWLEDGE", score: 3.8, prov: "PLFS Round 2024 Field Supervision" },
      { code: "AGRI_STATISTICS", type: "KNOWLEDGE", score: 3.2, prov: "NSS 77th Round SAS Land & Livestock Holding Survey" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 3.6, prov: "NSSO Regional Office Data Scrutiny Audit" },
      { code: "LEADERSHIP", type: "OBSERVATION", score: 3.5, prov: "Field Survey Team Supervisory Review" },
      { code: "PROJECT_MANAGEMENT", type: "APPLICATION", score: 3.0, prov: "NSS 80th Round Operations Management" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.8, prov: "DoPT Ethics Course — iGOT 2023" },
    ],
    "manoj.tiwari@nsso.gov.in": [
      { code: "SURVEY_DESIGN", type: "APPLICATION", score: 3.9, prov: "FOD Northern Zone CAPI Supervision Audit" },
      { code: "SAMPLING_METHODS", type: "APPLICATION", score: 3.7, prov: "Village FSU Boundary Demarcation & Listing Audit" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 4.0, prov: "First-Stage Field Scrutiny Certification" },
      { code: "COMMUNICATION", type: "OBSERVATION", score: 3.8, prov: "Field Enumerator Training & Guidance" },
      { code: "LABOUR_STATISTICS", type: "APPLICATION", score: 3.5, prov: "PLFS Quarterly Urban Household Scrutiny" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.5, prov: "Karmayogi Public Service Ethics Course" },
    ],
    "ananya.roy@nsso.gov.in": [
      { code: "SURVEY_DESIGN", type: "APPLICATION", score: 3.2, prov: "PLFS Tablet Field Entry & CAPI Validation" },
      { code: "DATA_QUALITY", type: "KNOWLEDGE", score: 3.0, prov: "Schedule Scrutiny Checklist Evaluation" },
      { code: "SAMPLING_METHODS", type: "KNOWLEDGE", score: 2.8, prov: "Sample Household Selection Training" },
      { code: "COMMUNICATION", type: "OBSERVATION", score: 3.5, prov: "Household Respondent Engagement Review" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.2, prov: "Induction Course on Statistical Objectivity" },
    ],
    "amit.verma@mospi.gov.in": [
      { code: "DATA_QUALITY", type: "KNOWLEDGE", score: 2.8, prov: "In-house NSSO Training 2025" },
      { code: "SQL_DATABASE", type: "KNOWLEDGE", score: 2.4, prov: "Online Self-Assessment Quiz" },
      { code: "PYTHON_ANALYTICS", type: "APPLICATION", score: 1.8, prov: "Python Basics Lab Exercise" },
      { code: "COMMUNICATION", type: "OBSERVATION", score: 3.2, prov: "Technical Summary Drafting Review" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 3.8, prov: "DoPT Induction Training 2024" },
      { code: "NATIONAL_ACCOUNTS", type: "APPLICATION", score: 2.6, prov: "NAD GVA SUT Working Group Exercise" },
      { code: "PRICE_STATISTICS", type: "KNOWLEDGE", score: 2.4, prov: "CPI/WPI Price Collection Pilot Review" },
    ],
    "dr.ramesh.chandra@mospi.gov.in": [
      { code: "NATIONAL_ACCOUNTS", type: "APPLICATION", score: 4.8, prov: "System of National Accounts 2008 Working Group" },
      { code: "PRICE_STATISTICS", type: "APPLICATION", score: 4.5, prov: "Double Deflation Protocol & Constant Price Methodology" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 4.4, prov: "Annual National Accounts Release Peer Review" },
      { code: "STRATEGIC_PLANNING", type: "OBSERVATION", score: 4.6, prov: "MoSPI Advisory Board on Macroeconomic Statistics" },
      { code: "LEADERSHIP", type: "OBSERVATION", score: 4.5, prov: "National Accounts Compilation Division Leadership" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.9, prov: "Central Civil Services Code of Conduct" },
    ],
    "kavita.meena@mospi.gov.in": [
      { code: "NATIONAL_ACCOUNTS", type: "APPLICATION", score: 3.8, prov: "Supply and Use Table (SUT) Commodity Balancing" },
      { code: "PRICE_STATISTICS", type: "KNOWLEDGE", score: 3.5, prov: "Producer Price Deflator Assignment Exercise" },
      { code: "SQL_DATABASE", type: "APPLICATION", score: 3.2, prov: "Corporate Balance Sheet Database (MCA-21) Extraction" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 3.7, prov: "GVA Sectoral Reconciliation Audit" },
      { code: "COMMUNICATION", type: "OBSERVATION", score: 3.8, prov: "Inter-ministerial Data Reconciliation Meeting" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.4, prov: "iGOT Karmayogi Public Finance Integrity" },
    ],
    "vikram.singh@mospi.gov.in": [
      { code: "INDUSTRIAL_STATISTICS", type: "APPLICATION", score: 4.4, prov: "Annual Survey of Industries (ASI) Frame Update 2024" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 4.1, prov: "Factory Register Scrutiny and Imputation Review" },
      { code: "PRICE_STATISTICS", type: "APPLICATION", score: 3.8, prov: "Index of Industrial Production (IIP) Base Revision" },
      { code: "LEADERSHIP", type: "OBSERVATION", score: 4.0, prov: "Industrial Statistics Unit Supervision" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.6, prov: "National Productivity Council Ethical Standards" },
    ],
    "pooja.patel@mospi.gov.in": [
      { code: "PRICE_STATISTICS", type: "APPLICATION", score: 4.0, prov: "CPI Urban/Rural Weekly Market Price Scrutiny" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 3.8, prov: "Elementary Aggregate Price Outlier Detection" },
      { code: "SAMPLING_METHODS", type: "KNOWLEDGE", score: 3.4, prov: "Sample Market Quotation Representative Audit" },
      { code: "COMMUNICATION", type: "OBSERVATION", score: 3.9, prov: "State Price Collection Cell Coordination" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.5, prov: "Consumer Affairs & Price Reporting Ethics" },
    ],
    "dr.sanjay.m@mospi.gov.in": [
      { code: "SAMPLING_METHODS", type: "APPLICATION", score: 4.9, prov: "NSS 80th Round Multi-Stage Stratification Formulation" },
      { code: "SURVEY_DESIGN", type: "APPLICATION", score: 4.7, prov: "SDRD Questionnaire Design & Cognitive Testing" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 4.6, prov: "Non-Sampling Variance Analysis & Weight Estimation" },
      { code: "LEADERSHIP", type: "OBSERVATION", score: 4.5, prov: "Survey Design & Research Division Directorate" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.9, prov: "Senior Government Statistician Ethics Oath" },
    ],
    "neha.gupta@mospi.gov.in": [
      { code: "SURVEY_DESIGN", type: "APPLICATION", score: 4.1, prov: "Time Use Survey Schedule Pre-testing & Validation" },
      { code: "SAMPLING_METHODS", type: "APPLICATION", score: 3.8, prov: "Sub-sample Replicate Multiplier Verification" },
      { code: "DATA_QUALITY", type: "APPLICATION", score: 3.9, prov: "Field Pilot Questionnaire Quality Assessment" },
      { code: "COMMUNICATION", type: "OBSERVATION", score: 4.2, prov: "Technical Working Group Presentation" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.7, prov: "Karmayogi Gender Inclusivity & Survey Ethics" },
    ],
    "arun.nair@mospi.gov.in": [
      { code: "DATA_QUALITY", type: "APPLICATION", score: 4.2, prov: "DPD Large-Scale Household Data Cleaning Lab" },
      { code: "STATA_SPSS", type: "APPLICATION", score: 4.0, prov: "NSS Unit-Level Data Tabulation & Batch Scripting" },
      { code: "PYTHON_ANALYTICS", type: "APPLICATION", score: 3.4, prov: "Automated Data Validation Scripts" },
      { code: "METADATA_STANDARDS", type: "APPLICATION", score: 3.5, prov: "Microdata Anonymised Public Use Files (PUF) Creation" },
      { code: "ETHICS_INTEGRITY", type: "KNOWLEDGE", score: 4.4, prov: "Public Use Microdata Confidentiality Compliance" },
    ],
  };

  const evidenceRecords = [];
  for (const [email, defs] of Object.entries(officialEvidenceMap)) {
    const off = officialByEmail[email];
    if (!off) continue;
    for (const d of defs) {
      const c = findComp(d.code);
      if (c) {
        evidenceRecords.push({
          officialId: off.id,
          competencyId: c.id,
          evidenceType: d.type,
          score: d.score,
          maxScore: 5.0,
          weight: 0.4,
          confidence: 0.88,
          provenance: d.prov,
        });
      }
    }
  }

  if (evidenceRecords.length) {
    await db.insert(evidence).values(evidenceRecords);
  }

  // Seed authoritative MoSPI learning materials
  await seedLearningMaterials(competencyRows);

  for (const off of officialRows) {
    await recalculateSkillGaps({
      userId: off.userId,
      officialId: off.id,
      roleId: off.roleId,
    }).catch((err) => console.warn(`  Warning calculating skill gaps: ${err.message}`));
  }
  console.log(`  -> Evidence seeded (${evidenceRecords.length} records) and skill gaps calculated for ${officialRows.length} officials`);

  // ── Step 7: Seed Authoritative MoSPI Sources, Assessments & Review Items ──
  console.log("[7/13] Seeding authoritative MoSPI sources, assessments & grounded questions...");
  const { assessmentMap } = await seedMoSPISources(competencyRows);

  // ── Step 8: Seed MoSPI Assessment Blueprints ──
  console.log("[8/13] Seeding MoSPI assessment blueprints for Assessment Studio...");
  await seedAssessmentBlueprints(competencyRows);

  // ── Step 9: Seed Realistic Completed Assessment Attempts with Genuine Past Dates ──
  console.log("[9/13] Seeding realistic completed assessment attempts with past timestamps...");
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const offRajesh = officialByEmail["rajesh.kumar@mospi.gov.in"];
  const offPriya = officialByEmail["priya.sharma@nsso.gov.in"];
  const offAmit = officialByEmail["amit.verma@mospi.gov.in"];
  const offManoj = officialByEmail["manoj.tiwari@nsso.gov.in"];
  const offPooja = officialByEmail["pooja.patel@mospi.gov.in"];

  const attemptDefs = [];

  if (offRajesh) {
    attemptDefs.push(
      {
        officialId: offRajesh.id,
        compCode: "SAMPLING_METHODS",
        startedAt: new Date(now - 1 * dayMs - 3600 * 1000 * 3),
        submittedAt: new Date(now - 1 * dayMs - 3600 * 1000 * 3 + 1800 * 1000),
        score: 4,
        maxScore: 5,
        responses: [
          { questionId: "q1", selectedAnswer: "A", isCorrect: true },
          { questionId: "q2", selectedAnswer: "B", isCorrect: true },
          { questionId: "q3", selectedAnswer: "A", isCorrect: true },
          { questionId: "q4", selectedAnswer: "C", isCorrect: false },
          { questionId: "q5", selectedAnswer: "D", isCorrect: true },
        ],
      },
      {
        officialId: offRajesh.id,
        compCode: "DATA_QUALITY",
        startedAt: new Date(now - 3 * dayMs),
        submittedAt: new Date(now - 3 * dayMs + 1200 * 1000),
        score: 5,
        maxScore: 5,
        responses: [
          { questionId: "q1", selectedAnswer: "A", isCorrect: true },
          { questionId: "q2", selectedAnswer: "B", isCorrect: true },
          { questionId: "q3", selectedAnswer: "C", isCorrect: true },
          { questionId: "q4", selectedAnswer: "A", isCorrect: true },
          { questionId: "q5", selectedAnswer: "B", isCorrect: true },
        ],
      },
      {
        officialId: offRajesh.id,
        compCode: "PYTHON_ANALYTICS",
        startedAt: new Date(now - 5 * dayMs),
        submittedAt: new Date(now - 5 * dayMs + 1500 * 1000),
        score: 2,
        maxScore: 5,
        responses: [
          { questionId: "q1", selectedAnswer: "A", isCorrect: true },
          { questionId: "q2", selectedAnswer: "C", isCorrect: false },
          { questionId: "q3", selectedAnswer: "D", isCorrect: false },
          { questionId: "q4", selectedAnswer: "A", isCorrect: true },
          { questionId: "q5", selectedAnswer: "B", isCorrect: false },
        ],
      }
    );
  }

  if (offPriya) {
    attemptDefs.push({
      officialId: offPriya.id,
      compCode: "SAMPLING_METHODS",
      startedAt: new Date(now - 2 * dayMs),
      submittedAt: new Date(now - 2 * dayMs + 1400 * 1000),
      score: 5,
      maxScore: 5,
      responses: [
        { questionId: "q1", selectedAnswer: "A", isCorrect: true },
        { questionId: "q2", selectedAnswer: "B", isCorrect: true },
        { questionId: "q3", selectedAnswer: "A", isCorrect: true },
        { questionId: "q4", selectedAnswer: "A", isCorrect: true },
        { questionId: "q5", selectedAnswer: "D", isCorrect: true },
      ],
    });
  }

  if (offAmit) {
    attemptDefs.push({
      officialId: offAmit.id,
      compCode: "DATA_QUALITY",
      startedAt: new Date(now - 4 * dayMs),
      submittedAt: new Date(now - 4 * dayMs + 1600 * 1000),
      score: 3,
      maxScore: 5,
      responses: [
        { questionId: "q1", selectedAnswer: "A", isCorrect: true },
        { questionId: "q2", selectedAnswer: "B", isCorrect: false },
        { questionId: "q3", selectedAnswer: "C", isCorrect: true },
        { questionId: "q4", selectedAnswer: "A", isCorrect: true },
        { questionId: "q5", selectedAnswer: "D", isCorrect: false },
      ],
    });
  }

  if (offManoj) {
    attemptDefs.push({
      officialId: offManoj.id,
      compCode: "SURVEY_DESIGN",
      startedAt: new Date(now - 2 * dayMs - 5 * 3600 * 1000),
      submittedAt: new Date(now - 2 * dayMs - 4 * 3600 * 1000),
      score: 4,
      maxScore: 5,
      responses: [
        { questionId: "q1", selectedAnswer: "A", isCorrect: true },
        { questionId: "q2", selectedAnswer: "B", isCorrect: true },
        { questionId: "q3", selectedAnswer: "A", isCorrect: true },
        { questionId: "q4", selectedAnswer: "A", isCorrect: true },
        { questionId: "q5", selectedAnswer: "C", isCorrect: false },
      ],
    });
  }

  if (offPooja) {
    attemptDefs.push({
      officialId: offPooja.id,
      compCode: "PRICE_STATISTICS",
      startedAt: new Date(now - 3 * dayMs - 2 * 3600 * 1000),
      submittedAt: new Date(now - 3 * dayMs - 1 * 3600 * 1000),
      score: 4,
      maxScore: 5,
      responses: [
        { questionId: "q1", selectedAnswer: "A", isCorrect: true },
        { questionId: "q2", selectedAnswer: "B", isCorrect: true },
        { questionId: "q3", selectedAnswer: "C", isCorrect: false },
        { questionId: "q4", selectedAnswer: "A", isCorrect: true },
        { questionId: "q5", selectedAnswer: "A", isCorrect: true },
      ],
    });
  }

  for (const att of attemptDefs) {
    const ass =
      assessmentMap[att.compCode] ||
      Object.values(assessmentMap).find((a) => a?.id) ||
      (await db.select().from(assessments).limit(1))[0];
    if (!ass?.id) continue;
    await db.execute(sql`
      INSERT INTO assessment_attempts (
        assessment_id, official_id, status, started_at, submitted_at,
        time_limit_seconds, current_question_index, responses, score, max_score, created_at
      ) VALUES (
        ${ass.id}, ${att.officialId}, 'COMPLETED', ${att.startedAt}, ${att.submittedAt},
        600, ${att.responses.length}, ${JSON.stringify(att.responses)}::jsonb, ${att.score}, ${att.maxScore}, ${att.startedAt}
      )
    `);
  }
  console.log(`  -> ${attemptDefs.length} realistic completed assessment attempts seeded`);

  // ── Step 10: Seed iGOT Course Catalogue & Enrolments ──
  console.log("[10/13] Seeding iGOT course catalogue & active enrolments...");
  const courses = getAllMockCourses();
  const courseRows = [];
  for (const course of courses) {
    const [row] = await db.insert(igotCourses).values({
      igotIdentifier: course.identifier,
      name: course.name,
      description: course.description,
      contentType: course.contentType,
      durationSeconds: parseInt(course.duration) || 3600,
      organisation: course.organisation,
      status: course.status,
      pkgVersion: course.pkgVersion || 1,
      level: course.level,
      learningOutcomes: course.learningOutcomes,
      tags: course.tags,
      competencyArea: course.competencyArea,
      sourceMode: course.sourceMode,
      bannerUrl: course.bannerUrl,
      rating: course.rating,
    }).returning().catch(() => []);
    if (row) courseRows.push(row);
  }

  if (courseRows.length >= 3 && offRajesh) {
    await db.insert(igotEnrolments).values([
      {
        officialId: offRajesh.id,
        igotCourseId: courseRows[0].id,
        enrolledAt: new Date(now - 7 * dayMs),
        completionPercentage: 45,
        status: "ENROLLED",
        evidenceCreated: false,
      },
      {
        officialId: offRajesh.id,
        igotCourseId: courseRows[1].id,
        enrolledAt: new Date(now - 14 * dayMs),
        completedAt: new Date(now - 2 * dayMs),
        completionPercentage: 100,
        status: "COMPLETED",
        evidenceCreated: true,
      },
      {
        officialId: offPriya?.id || offRajesh.id,
        igotCourseId: courseRows[2].id,
        enrolledAt: new Date(now - 10 * dayMs),
        completionPercentage: 60,
        status: "ENROLLED",
        evidenceCreated: false,
      },
    ]).catch(() => {});
  }
  console.log(`  -> ${courseRows.length} iGOT courses and active enrolments seeded`);

  // ── Step 11: Seed NSSTA TPAC Programmes & Circular Notices ──
  console.log("[11/13] Seeding NSSTA TPAC programmes & circular notices...");
  await seedNsstaProgrammes(competencyRows);
  await seedNsstaNotices(competencyRows);

  for (const off of officialRows) {
    // Generate real-time recommendations (iGOT + NSSTA) mapped to active skill gaps
    await triggerAutoGapAndRecommendations(off.id).catch((err) =>
      console.warn(`  Warning generating recommendations for official ${off.id}: ${err.message}`)
    );

    // Score and rank NSSTA circular notice opportunities
    await refreshNoticeRecommendations({ officialId: off.id }).catch((err) =>
      console.warn(`  Warning generating notice recommendations for official ${off.id}: ${err.message}`)
    );
  }
  console.log("  -> Real iGOT, NSSTA and Circular notice recommendations populated for all officials");

  // ── Step 12: Seed Longitudinal History for Analytics & Forecasts ──
  console.log("[12/13] Seeding historical competency observations across departments...");
  await seedCompetencyHistory(officialRows, competencyRows);

  // ── Step 13: Seed Institutional Governance Audit Logs ──
  console.log("[13/13] Seeding institutional governance audit logs...");
  await db.insert(auditLogs).values([
    {
      actorId: userMap["admin@nssta.gov.in"] || "admin-nssta",
      actionType: "RECALIBRATION_BATCH_RUN",
      targetEntity: "WORKFORCE_COMPETENCIES",
      metadata: {
        affectedOfficials: officialRows.length,
        adjustedScores: 28,
        policy: "NQAF-Decay-Rule-v2",
        reason: "Annual statutory competency staleness audit",
      },
    },
    {
      actorId: userMap["admin@nssta.gov.in"] || "admin-nssta",
      actionType: "QUESTION_APPROVED",
      targetEntity: "QUESTION_BANK",
      metadata: {
        competency: "SAMPLING_METHODS",
        questionsApproved: 5,
      },
    },
  ]).catch(() => {});
  console.log("  -> Audit logs seeded");

  console.log("\n=======================================================");
  console.log("  Master Database Seeding Completed Successfully!");
  console.log("  Admin Login: admin@nssta.gov.in / Admin@123!");
  console.log("  Officer 1 (DIID): rajesh.kumar@mospi.gov.in / Test@123!");
  console.log("  Officer 2 (NSSO): priya.sharma@nsso.gov.in / Test@123!");
  console.log("  Officer 3 (NAD):  amit.verma@mospi.gov.in / Test@123!");
  console.log(`  Total Official Accounts Tracked: ${officialRows.length}`);
  console.log("=======================================================\n");
}

// Auto-execute if invoked directly
if (process.argv[1]?.endsWith("index.js")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("FATAL Seeding Error:", err);
      process.exit(1);
    });
}
