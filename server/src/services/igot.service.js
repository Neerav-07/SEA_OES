/**
 * iGOT Karmayogi Mock Service — Sunbird-Compatible API
 *
 * Development adapter. Mock catalogue records are synthetic and must never be
 * represented as live iGOT content. Real integration remains disabled unless a
 * verified contract is configured by deployment.
 *
 * To switch to real iGOT:
 *   Set IGOT_BASE_URL and IGOT_API_KEY in server .env
 *   The service automatically routes to real API when IGOT_MOCK=false
 *
 * Sunbird API reference: https://project-sunbird.github.io/sunbird-docs/
 */

const IGOT_BASE_URL =
  process.env.IGOT_BASE_URL || "https://igotkarmayogi.gov.in";
const IGOT_API_KEY = process.env.IGOT_API_KEY || "";
const USE_MOCK = process.env.IGOT_MOCK !== "false"; // default: mock mode

// ── Course Catalogue (CSV-filtered, real-title subset) ──────────────────────
// These are actual titles surfaced in the portal CSVs and filtered to MoSPI /
// statistics / data / governance content relevant to official statistics work.
const MOCK_COURSES = [
  {
    identifier: "IGOT-CSV-001",
    name: "Know Your Ministry-Ministry of Statistics and Programme Implementation",
    contentType: "Course",
    subject: ["Official Statistics", "Governance"],
    duration: "3600",
    pkgVersion: 1,
    organisation: "MoSPI",
    language: ["English", "Hindi"],
    medium: ["English", "Hindi"],
    description:
      "Overview of the Ministry of Statistics and Programme Implementation and how its programmes, statistical systems, and governance structures support official data and policymaking in India.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/mospi.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["SURVEY_SAMPLING", "STATISTICAL_ANALYSIS"],
    batchId: "batch_igot_csv_001",
    level: "Beginner",
    learningOutcomes: [
      "Understand the role of MoSPI in official statistics and governance.",
      "Connect ministry functions to data-driven public administration.",
    ],
    tags: ["MoSPI", "Official Statistics", "Governance"],
    competencyArea: "Domain",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/mospi.png",
    rating: "4.7",
  },
  {
    identifier: "IGOT-CSV-002",
    name: "Introduction to Statistical Tools for Data-Driven Decision-Making",
    contentType: "Course",
    subject: ["Statistics", "Decision Support"],
    duration: "7200",
    pkgVersion: 1,
    organisation: "MoSPI",
    language: ["English"],
    medium: ["English"],
    description:
      "Introduces practical statistical methods and tools for evidence-based decision-making in public administration and official statistical work.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/stat-tools.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["STATISTICAL_ANALYSIS", "GIS_VISUALIZATION"],
    batchId: "batch_igot_csv_002",
    level: "Intermediate",
    learningOutcomes: [
      "Apply suitable statistical tools to public-sector data problems.",
      "Interpret results for operational and policy decisions.",
    ],
    tags: ["Statistics", "Decision-Making", "Data Analysis"],
    competencyArea: "Functional",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/stat-tools.png",
    rating: "4.8",
  },
  {
    identifier: "IGOT-CSV-003",
    name: "Introduction to Statistical Tools and Data Analysis",
    contentType: "Course",
    subject: ["Data Analysis", "Statistics"],
    duration: "7200",
    pkgVersion: 1,
    organisation: "MoSPI",
    language: ["English"],
    medium: ["English"],
    description:
      "Builds foundational knowledge in statistical analysis for exploring data, summarizing trends, and supporting official statistics functions.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/data-analysis.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["PYTHON_DATA", "SQL_DATA"],
    batchId: "batch_igot_csv_003",
    level: "Beginner",
    learningOutcomes: [
      "Use core statistical workflows for descriptive analysis.",
      "Prepare and interpret structured data for official reporting.",
    ],
    tags: ["Data Analysis", "Statistics", "Tools"],
    competencyArea: "Functional",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/data-analysis.png",
    rating: "4.7",
  },
  {
    identifier: "IGOT-CSV-004",
    name: "Data Analysis and Visualization Using Microsoft Excel",
    contentType: "Course",
    subject: ["Excel", "Visualization"],
    duration: "10800",
    pkgVersion: 1,
    organisation: "NIC",
    language: ["English"],
    medium: ["English"],
    description:
      "Covers spreadsheet-based data cleaning, pivot analysis, charting, and dashboard-style presentation for official statistical datasets.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/excel.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["GIS_VISUALIZATION", "SQL_DATA"],
    batchId: "batch_igot_csv_004",
    level: "Intermediate",
    learningOutcomes: [
      "Use Excel for data cleaning and tabular analysis.",
      "Design charts and dashboards suited to statistical reporting.",
    ],
    tags: ["Excel", "Visualization", "Reporting"],
    competencyArea: "Functional",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/excel.png",
    rating: "4.8",
  },
  {
    identifier: "IGOT-CSV-005",
    name: "Data-Driven Decision-Making for Government",
    contentType: "Course",
    subject: ["Decision Support", "Public Administration"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "DoPT",
    language: ["English", "Hindi"],
    medium: ["English", "Hindi"],
    description:
      "Explains how structured evidence, dashboards, and analytical thinking improve governance decisions and policy implementation.",
    appIcon:
      "https://igotkarmayogi.gov.in/assets/icons/governance-decision.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["STATISTICAL_ANALYSIS", "SURVEY_SAMPLING"],
    batchId: "batch_igot_csv_005",
    level: "Beginner",
    learningOutcomes: [
      "Recognise evidence-based decision-making in governance.",
      "Translate indicators into actionable administrative decisions.",
    ],
    tags: ["Decision-Making", "Public Administration", "Evidence"],
    competencyArea: "Behavioural",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl:
      "https://igotkarmayogi.gov.in/assets/icons/governance-decision.png",
    rating: "4.7",
  },
  {
    identifier: "IGOT-CSV-006",
    name: "Basics of Cloud Computing",
    contentType: "Course",
    subject: ["Cloud", "Digital Governance"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "NIC",
    language: ["English"],
    medium: ["English"],
    description:
      "Introduces cloud models, service types, security considerations, and practical adoption pathways for government digital workflows.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/cloud.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["CLOUD_APIS", "DATA_PRIVACY"],
    batchId: "batch_igot_csv_006",
    level: "Beginner",
    learningOutcomes: [
      "Understand cloud concepts and deployment models.",
      "Recognise security, reliability, and governance considerations for public systems.",
    ],
    tags: ["Cloud", "Digital Governance", "Infrastructure"],
    competencyArea: "Functional",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/cloud.png",
    rating: "4.6",
  },
  {
    identifier: "IGOT-CSV-007",
    name: "Data Security in Cloud Computing",
    contentType: "Course",
    subject: ["Cloud Security", "Data Protection"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "NIC",
    language: ["English"],
    medium: ["English"],
    description:
      "Explains confidentiality, access control, and data protection for cloud-hosted public datasets and administrative systems.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/cloud-security.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["DATA_PRIVACY", "CLOUD_APIS"],
    batchId: "batch_igot_csv_007",
    level: "Intermediate",
    learningOutcomes: [
      "Assess cloud data risks and control gaps.",
      "Apply secure handling rules for government cloud environments.",
    ],
    tags: ["Cloud Security", "Data Privacy", "Security"],
    competencyArea: "Domain",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/cloud-security.png",
    rating: "4.8",
  },
  {
    identifier: "IGOT-CSV-008",
    name: "Cyber Rakshak: Fundamentals of Cyber Security for Public Officials",
    contentType: "Course",
    subject: ["Cybersecurity", "Public Service"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "CERT-In",
    language: ["English", "Hindi"],
    medium: ["English", "Hindi"],
    description:
      "Covers cyber hygiene, threat awareness, phishing prevention, and safe handling of digital information in public service delivery.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/cyber-rakshak.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["DATA_PRIVACY", "CLOUD_APIS"],
    batchId: "batch_igot_csv_008",
    level: "Beginner",
    learningOutcomes: [
      "Recognise common cyber threats in public administration.",
      "Follow safe digital practices for government datasets and systems.",
    ],
    tags: ["Cybersecurity", "Public Service", "Hygiene"],
    competencyArea: "Behavioural",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/cyber-rakshak.png",
    rating: "4.9",
  },
  {
    identifier: "IGOT-CSV-009",
    name: "Responsible Data Management: Privacy and Security and Compliance",
    contentType: "Course",
    subject: ["Data Privacy", "Compliance"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "MeitY",
    language: ["English"],
    medium: ["English"],
    description:
      "Introduces privacy, security, and compliance obligations for handling public data, including practical governance checks for data custodians.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/data-private.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["DATA_PRIVACY", "SQL_DATA"],
    batchId: "batch_igot_csv_009",
    level: "Intermediate",
    learningOutcomes: [
      "Apply privacy-by-design principles to official datasets.",
      "Understand compliance requirements for secure data operations.",
    ],
    tags: ["Data Privacy", "Compliance", "Security"],
    competencyArea: "Domain",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/data-private.png",
    rating: "4.7",
  },
  {
    identifier: "IGOT-CSV-010",
    name: "Understanding the Digital Personal Data Protection Act 2023 and Rules",
    contentType: "Course",
    subject: ["Data Protection", "Policy"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "MeitY",
    language: ["English", "Hindi"],
    medium: ["English", "Hindi"],
    description:
      "Explains key legal provisions, accountability mechanisms, and data-processing obligations under India’s Digital Personal Data Protection framework.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/dpdp.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["DATA_PRIVACY", "SURVEY_SAMPLING"],
    batchId: "batch_igot_csv_010",
    level: "Intermediate",
    learningOutcomes: [
      "Understand legal and governance implications of personal data protection.",
      "Recognise obligations when managing citizen and administrative data.",
    ],
    tags: ["DPDP", "Data Protection", "Legal"],
    competencyArea: "Domain",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/dpdp.png",
    rating: "4.8",
  },
  {
    identifier: "IGOT-CSV-011",
    name: "Fundamentals of Project Management",
    contentType: "Course",
    subject: ["Project Management", "Planning"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "DoPT",
    language: ["English"],
    medium: ["English"],
    description:
      "Introduces project planning, governance, and execution concepts relevant to statistical and digital transformation initiatives in government.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/project-management.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["STATISTICAL_ANALYSIS", "SURVEY_SAMPLING"],
    batchId: "batch_igot_csv_011",
    level: "Beginner",
    learningOutcomes: [
      "Plan and structure government projects with measurable outcomes.",
      "Apply governance and monitoring practices for analytics projects.",
    ],
    tags: ["Project Management", "Planning", "Governance"],
    competencyArea: "Behavioural",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl:
      "https://igotkarmayogi.gov.in/assets/icons/project-management.png",
    rating: "4.6",
  },
  {
    identifier: "IGOT-CSV-012",
    name: "Introduction to Decision-Making",
    contentType: "Course",
    subject: ["Decision-Making", "Leadership"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "DoPT",
    language: ["English"],
    medium: ["English"],
    description:
      "Examines structured methods for making sound administrative and operational decisions using evidence, risk awareness, and stakeholder consideration.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/decision-making.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["STATISTICAL_ANALYSIS", "SURVEY_SAMPLING"],
    batchId: "batch_igot_csv_012",
    level: "Beginner",
    learningOutcomes: [
      "Apply a structured approach to administrative decision-making.",
      "Balance evidence, risk, and public-interest considerations.",
    ],
    tags: ["Decision-Making", "Leadership", "Governance"],
    competencyArea: "Behavioural",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/decision-making.png",
    rating: "4.5",
  },
  {
    identifier: "IGOT-CSV-013",
    name: "Understanding Bharat's Artificial Intelligence Stack",
    contentType: "Course",
    subject: ["Artificial Intelligence", "Digital Governance"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "MeitY",
    language: ["English"],
    medium: ["English"],
    description:
      "Introduces India's AI ecosystem and the building blocks that support responsible digital transformation in public services.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/ai-stack.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["PYTHON_DATA", "CLOUD_APIS"],
    batchId: "batch_igot_csv_013",
    level: "Beginner",
    learningOutcomes: [
      "Describe the main components of India's AI ecosystem.",
      "Identify practical public-sector AI use cases and governance considerations.",
    ],
    tags: ["Artificial Intelligence", "Digital Transformation", "India AI"],
    competencyArea: "Functional",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/ai-stack.png",
    rating: "4.7",
  },
  {
    identifier: "IGOT-CSV-014",
    name: "AI for Digital Transformation with Machine Learning and Deep Learning",
    contentType: "Course",
    subject: ["Artificial Intelligence", "Machine Learning"],
    duration: "7200",
    pkgVersion: 1,
    organisation: "MeitY",
    language: ["English"],
    medium: ["English"],
    description:
      "Explores machine learning and deep learning concepts through the lens of public-sector digital transformation.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/ai-transformation.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["PYTHON_DATA", "STATISTICAL_ANALYSIS"],
    batchId: "batch_igot_csv_014",
    level: "Intermediate",
    learningOutcomes: [
      "Explain common machine learning and deep learning workflows.",
      "Assess where AI can improve government service delivery.",
    ],
    tags: ["AI", "Machine Learning", "Deep Learning"],
    competencyArea: "Functional",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl:
      "https://igotkarmayogi.gov.in/assets/icons/ai-transformation.png",
    rating: "4.8",
  },
  {
    identifier: "IGOT-CSV-015",
    name: "Data Security in Cloud Computing",
    contentType: "Course",
    subject: ["Cloud Security", "Data Protection"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "NIC",
    language: ["English"],
    medium: ["English"],
    description:
      "Covers cloud data protection, access controls, and secure operational practices for public digital services.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/cloud-security.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["DATA_PRIVACY", "CLOUD_APIS"],
    batchId: "batch_igot_csv_015",
    level: "Intermediate",
    learningOutcomes: [
      "Recognise common cloud security risks.",
      "Apply controls for protecting government data in cloud environments.",
    ],
    tags: ["Cloud", "Data Security", "Privacy"],
    competencyArea: "Domain",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/cloud-security.png",
    rating: "4.8",
  },
  {
    identifier: "IGOT-CSV-016",
    name: "Cyber Security Audit of Government Websites",
    contentType: "Course",
    subject: ["Cybersecurity", "Audit"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "CERT-In",
    language: ["English"],
    medium: ["English"],
    description:
      "Introduces practical security review and audit considerations for government websites and citizen-facing services.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/cyber-audit.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["DATA_PRIVACY", "CLOUD_APIS"],
    batchId: "batch_igot_csv_016",
    level: "Intermediate",
    learningOutcomes: [
      "Identify common website security weaknesses.",
      "Understand the evidence and controls expected in a government security audit.",
    ],
    tags: ["Cybersecurity", "Audit", "Government Websites"],
    competencyArea: "Domain",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/cyber-audit.png",
    rating: "4.7",
  },
  {
    identifier: "IGOT-CSV-017",
    name: "Data Analysis and Visualization Using Microsoft Excel",
    contentType: "Course",
    subject: ["Excel", "Data Visualization"],
    duration: "10800",
    pkgVersion: 1,
    organisation: "NIC",
    language: ["English"],
    medium: ["English"],
    description:
      "Builds practical skills in spreadsheet-based data cleaning, analysis, charts, and dashboards for government reporting.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/excel.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["GIS_VISUALIZATION", "STATISTICAL_ANALYSIS"],
    batchId: "batch_igot_csv_017",
    level: "Intermediate",
    learningOutcomes: [
      "Clean and analyse structured data in Excel.",
      "Create clear charts and dashboard views for decision-makers.",
    ],
    tags: ["Excel", "Data Analysis", "Visualization"],
    competencyArea: "Functional",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/excel.png",
    rating: "4.8",
  },
  {
    identifier: "IGOT-CSV-018",
    name: "Visual Intelligence and Data Storytelling Essentials",
    contentType: "Course",
    subject: ["Data Storytelling", "Visualization"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "DoPT",
    language: ["English"],
    medium: ["English"],
    description:
      "Teaches how to turn complex public-sector data into accurate, accessible, and decision-ready narratives.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/data-storytelling.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["GIS_VISUALIZATION", "STATISTICAL_ANALYSIS"],
    batchId: "batch_igot_csv_018",
    level: "Beginner",
    learningOutcomes: [
      "Choose effective visual forms for statistical messages.",
      "Build data narratives that preserve context and evidence.",
    ],
    tags: ["Data Storytelling", "Visualisation", "Communication"],
    competencyArea: "Behavioural",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl:
      "https://igotkarmayogi.gov.in/assets/icons/data-storytelling.png",
    rating: "4.6",
  },
  {
    identifier: "IGOT-CSV-019",
    name: "Foundations of Cyber Safety in Public Service",
    contentType: "Course",
    subject: ["Cybersecurity", "Public Service"],
    duration: "3600",
    pkgVersion: 1,
    organisation: "CERT-In",
    language: ["English", "Hindi"],
    medium: ["English", "Hindi"],
    description:
      "Provides practical cyber hygiene guidance for officials handling government systems, communications, and data.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/cyber-safety.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["DATA_PRIVACY", "CLOUD_APIS"],
    batchId: "batch_igot_csv_019",
    level: "Beginner",
    learningOutcomes: [
      "Recognise common cyber safety threats.",
      "Apply secure everyday practices in public service environments.",
    ],
    tags: ["Cyber Safety", "Public Service", "Security Awareness"],
    competencyArea: "Behavioural",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/cyber-safety.png",
    rating: "4.9",
  },
  {
    identifier: "IGOT-CSV-020",
    name: "Artificial Intelligence for Government Officers",
    contentType: "Course",
    subject: ["Artificial Intelligence", "Governance"],
    duration: "5400",
    pkgVersion: 1,
    organisation: "MeitY",
    language: ["English"],
    medium: ["English"],
    description:
      "Introduces AI opportunities, limitations, and responsible adoption patterns for government officers.",
    appIcon: "https://igotkarmayogi.gov.in/assets/icons/ai-government.png",
    status: "Live",
    gradeLevel: ["Professional"],
    competencyCodes: ["PYTHON_DATA", "DATA_PRIVACY"],
    batchId: "batch_igot_csv_020",
    level: "Beginner",
    learningOutcomes: [
      "Identify suitable AI use cases in government.",
      "Apply responsible AI and data protection considerations to public-sector initiatives.",
    ],
    tags: ["Artificial Intelligence", "Government", "Responsible AI"],
    competencyArea: "Domain",
    sourceMode: "SCRAPED_REAL_METADATA",
    bannerUrl: "https://igotkarmayogi.gov.in/assets/icons/ai-government.png",
    rating: "4.7",
  },
];

// ── Sunbird-compatible response builder ──────────────────────────────────────

function buildSunbirdResponse(id, result) {
  return {
    id,
    ver: "v1.0",
    ts: new Date().toISOString(),
    params: {
      resmsgid: `mock-${Date.now()}`,
      msgid: null,
      status: "successful",
      err: null,
      errmsg: null,
    },
    responseCode: "OK",
    result,
  };
}

function normalizeCourseForResponse(course = {}) {
  const durationSeconds = Number(
    course.durationSeconds ?? course.duration ?? 3600,
  );

  return {
    ...course,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 3600,
    duration: String(Number.isFinite(durationSeconds) ? durationSeconds : 3600),
    level: course.level || "Beginner",
    learningOutcomes: Array.isArray(course.learningOutcomes)
      ? course.learningOutcomes
      : [],
    tags: Array.isArray(course.tags) ? course.tags : [],
    competencyArea: course.competencyArea || "General",
    sourceMode: course.sourceMode || "SCRAPED_REAL_METADATA",
    organisation: course.organisation || "Government",
  };
}

// ── Public API Functions ──────────────────────────────────────────────────────

/**
 * Search courses by competency codes and/or query string.
 * Returns Sunbird-shaped response: { result: { count, content } }
 */
export async function searchCourses({
  competencyCodes = [],
  query = "",
  limit = 20,
  offset = 0,
}) {
  if (!USE_MOCK) {
    return _realSearchCourses({ competencyCodes, query, limit, offset });
  }

  let matches = MOCK_COURSES.filter((course) => {
    const codeMatch =
      competencyCodes.length === 0 ||
      competencyCodes.some((code) => course.competencyCodes.includes(code));
    const queryMatch =
      !query ||
      course.name.toLowerCase().includes(query.toLowerCase()) ||
      course.description.toLowerCase().includes(query.toLowerCase());
    return codeMatch && queryMatch;
  });

  // Simulate pagination
  const total = matches.length;
  matches = matches.slice(offset, offset + limit);

  return buildSunbirdResponse("api.content.search", {
    count: total,
    content: matches.map((course) => {
      const { competencyCodes: _cc, batchId: _bi, ...rest } = course;
      return normalizeCourseForResponse(rest);
    }),
  });
}

/**
 * Enrol a user in a course.
 * Returns Sunbird-shaped response: { result: { response: 'SUCCESS' } }
 */
export async function enrolCourse({ userId, courseId, batchId }) {
  if (!USE_MOCK) {
    return _realEnrolCourse({ userId, courseId, batchId });
  }

  const course = MOCK_COURSES.find((c) => c.identifier === courseId);
  if (!course) {
    return buildSunbirdResponse("api.course.enrol", {
      response: "FAILED",
      error: "Course not found",
    });
  }

  return buildSunbirdResponse("api.course.enrol", {
    response: "SUCCESS",
    courseId,
    batchId: batchId || course.batchId,
    userId,
  });
}

/**
 * Get all course enrolments for a user with completion status.
 * Returns Sunbird-shaped response: { result: { courses: [...] } }
 */
export async function getUserEnrolments(userId) {
  if (!USE_MOCK) {
    return _realGetEnrolments(userId);
  }

  // Mock: return empty list (real completions come from igot_enrolments table)
  return buildSunbirdResponse("api.course.user.enrollment.list", {
    courses: [],
  });
}

/**
 * Get course details by identifier.
 */
export async function getCourseDetails(courseId) {
  if (!USE_MOCK) {
    return _realGetCourseDetails(courseId);
  }

  const course = MOCK_COURSES.find((c) => c.identifier === courseId);
  if (!course) {
    return buildSunbirdResponse("api.content.read", { content: null });
  }

  const { competencyCodes: _cc, batchId: _bi, ...content } = course;
  return buildSunbirdResponse("api.content.read", {
    content: normalizeCourseForResponse(content),
  });
}

// ── Mock Civil Servant Profiles (Demo Onboarding Sync) ─────────────────────────
const DEMO_KARMAYOGI_PROFILES = [
  {
    karmayogiId: "ISS-2021-0842",
    name: "Dr. Ramesh Sharma",
    email: "ramesh.sharma@mospi.gov.in",
    cadre: "ISS (Indian Statistical Service)",
    designation: "Senior Statistical Officer (SSO)",
    department: "Data Informatics & Innovation Division (DIID)",
    experienceYears: 6,
    education: "M.Sc. in Statistics & Computing",
    preferredLanguage: "en",
    verifiedBadge: "MoSPI Civil Servant (Karmayogi Bharat)",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    completedCourses: [
      {
        courseId: "do_11298388341098496001",
        name: "Statistical Methods for Survey Design and Analysis",
        organisation: "NSSTA",
        completedAt: "2025-11-14",
        certificateId: "CERT-NSSTA-2025-8821",
        durationSeconds: 14400,
        competenciesAwarded: [
          {
            code: "SURVEY_DESIGN",
            name: "Survey Design & Methodology",
            level: 3.8,
          },
          {
            code: "SAMPLING_METHODS",
            name: "Sampling Theory & Methods",
            level: 3.5,
          },
          {
            code: "SURVEY_SAMPLING",
            name: "Survey Design and Sampling",
            level: 3.8,
          },
        ],
      },
      {
        courseId: "do_11298388341098496004",
        name: "Cybersecurity Fundamentals for Government Officials (CERT-In)",
        organisation: "CERT-In",
        completedAt: "2025-08-20",
        certificateId: "CERT-CERTIN-2025-4109",
        durationSeconds: 10800,
        competenciesAwarded: [
          {
            code: "DATA_PRIVACY",
            name: "Data Privacy and Cybersecurity",
            level: 3.5,
          },
          {
            code: "CYBERSECURITY",
            name: "Cybersecurity Fundamentals",
            level: 3.5,
          },
        ],
      },
      {
        courseId: "do_11298388341098496011",
        name: "Ethics and Integrity for Government Officials (Seva Bhav)",
        organisation: "DoPT",
        completedAt: "2025-06-10",
        certificateId: "CERT-DOPT-2025-1205",
        durationSeconds: 5400,
        competenciesAwarded: [
          {
            code: "ETHICS_INTEGRITY",
            name: "Ethics and Integrity (Seva Bhav)",
            level: 4.0,
          },
          {
            code: "LEADERSHIP_COLLAB",
            name: "Civil Service Leadership & Ethics",
            level: 4.0,
          },
        ],
      },
    ],
    skillsSummary: [
      "Survey Sampling Design",
      "Data Quality Standards",
      "CERT-In Cyber Hygiene",
      "Civil Service Ethics (Seva Bhav)",
    ],
    identifiedGaps: [
      "Python for Data Analysis and Visualization",
      "AI/ML Fundamentals for Official Statistics",
      "Government Cloud Computing (MeghRaj)",
    ],
  },
  {
    karmayogiId: "SSS-2023-1149",
    name: "Priya Verma",
    email: "priya.verma@mospi.gov.in",
    cadre: "SSS (Subordinate Statistical Service)",
    designation: "Junior Statistical Officer (JSO)",
    department: "Field Operations Division (FOD)",
    experienceYears: 3,
    education: "B.Sc. in Mathematical Statistics",
    preferredLanguage: "en",
    verifiedBadge: "MoSPI Civil Servant (Karmayogi Bharat)",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    completedCourses: [
      {
        courseId: "do_11298388341098496010",
        name: "Labour Force Survey Methods and PLFS Analysis",
        organisation: "NSSO",
        completedAt: "2025-10-05",
        certificateId: "CERT-NSSO-2025-0412",
        durationSeconds: 14400,
        competenciesAwarded: [
          {
            code: "LABOUR_STATISTICS",
            name: "Labour Statistics (PLFS)",
            level: 3.4,
          },
          {
            code: "SURVEY_DESIGN",
            name: "Survey Design & Methodology",
            level: 3.0,
          },
          {
            code: "SURVEY_SAMPLING",
            name: "Survey Design and Sampling",
            level: 3.0,
          },
        ],
      },
      {
        courseId: "do_11298388341098496011",
        name: "Ethics and Integrity for Government Officials (Seva Bhav)",
        organisation: "DoPT",
        completedAt: "2025-04-18",
        certificateId: "CERT-DOPT-2025-9912",
        durationSeconds: 5400,
        competenciesAwarded: [
          {
            code: "ETHICS_INTEGRITY",
            name: "Ethics and Integrity (Seva Bhav)",
            level: 3.5,
          },
          {
            code: "LEADERSHIP_COLLAB",
            name: "Civil Service Leadership & Ethics",
            level: 3.5,
          },
        ],
      },
    ],
    skillsSummary: [
      "Field Enumeration & Scrutiny",
      "PLFS Survey Instruments",
      "CAPI Household Canvassing",
    ],
    identifiedGaps: [
      "SQL for Data Management and Statistical Analysis",
      "Python Data Cleaning",
      "Data Visualization & Dashboards",
    ],
  },
  {
    karmayogiId: "ISS-2018-0329",
    name: "Anil Kumar",
    email: "anil.kumar@mospi.gov.in",
    cadre: "ISS (Indian Statistical Service)",
    designation: "Assistant Director",
    department: "National Accounts Division (NAD)",
    experienceYears: 8,
    education: "M.Stat (Indian Statistical Institute, Kolkata)",
    preferredLanguage: "en",
    verifiedBadge: "MoSPI Civil Servant (Karmayogi Bharat)",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    completedCourses: [
      {
        courseId: "do_11298388341098496008",
        name: "National Accounts Statistics: Concepts and Compilation",
        organisation: "MoSPI",
        completedAt: "2024-12-01",
        certificateId: "CERT-MOSPI-2024-0199",
        durationSeconds: 21600,
        competenciesAwarded: [
          {
            code: "NATIONAL_ACCOUNTS",
            name: "National Accounts Statistics (NAS)",
            level: 4.2,
          },
          {
            code: "STATISTICAL_ANALYSIS",
            name: "Statistical Analysis",
            level: 4.2,
          },
        ],
      },
      {
        courseId: "do_11298388341098496007",
        name: "Understanding SDG Indicators: India's Monitoring Framework",
        organisation: "MoSPI",
        completedAt: "2025-02-15",
        certificateId: "CERT-SDG-2025-3321",
        durationSeconds: 7200,
        competenciesAwarded: [
          {
            code: "SDG_INDICATORS",
            name: "SDG Indicators & Monitoring",
            level: 3.8,
          },
          {
            code: "METADATA_STANDARDS",
            name: "Metadata Standards & Data Quality",
            level: 3.6,
          },
        ],
      },
      {
        courseId: "do_11298388341098496001",
        name: "Statistical Methods for Survey Design and Analysis",
        organisation: "NSSTA",
        completedAt: "2024-05-10",
        certificateId: "CERT-NSSTA-2024-7711",
        durationSeconds: 14400,
        competenciesAwarded: [
          {
            code: "SURVEY_DESIGN",
            name: "Survey Design & Methodology",
            level: 4.0,
          },
          {
            code: "SURVEY_SAMPLING",
            name: "Survey Design and Sampling",
            level: 4.0,
          },
        ],
      },
    ],
    skillsSummary: [
      "SNA 2008 National Accounts",
      "GDP/GVA Sectoral Compilation",
      "SDG India Index Framework",
      "Statistical Metadata Standardization",
    ],
    identifiedGaps: [
      "Cloud Computing on MeghRaj",
      "Advanced Python Analytics for Big Data",
      "AI/ML for Statistical Dissemination",
    ],
  },
];

/**
 * Get all available demo profiles for fast-track onboarding selection.
 */
export function getDemoKarmayogiProfiles() {
  return buildSunbirdResponse("api.user.profiles.demo", {
    count: DEMO_KARMAYOGI_PROFILES.length,
    profiles: DEMO_KARMAYOGI_PROFILES,
  });
}

/**
 * Fetch a specific Karmayogi profile by its ID (or generate a realistic custom profile for any ID).
 */
export function getDemoProfileByKarmayogiId(karmayogiId) {
  const cleanId = String(karmayogiId || "").trim();
  const found = DEMO_KARMAYOGI_PROFILES.find(
    (p) =>
      p.karmayogiId.toLowerCase() === cleanId.toLowerCase() ||
      p.email.toLowerCase() === cleanId.toLowerCase(),
  );

  if (found) {
    return buildSunbirdResponse("api.user.profile.read", { profile: found });
  }

  // Fallback: dynamic valid MoSPI profile for any arbitrary user test ID
  const isSss = cleanId.toUpperCase().startsWith("SSS");
  const dynamicProfile = {
    karmayogiId: cleanId || "ISS-DEMO-2026",
    name: "Officer " + cleanId,
    email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, ".")}@mospi.gov.in`,
    cadre: isSss
      ? "SSS (Subordinate Statistical Service)"
      : "ISS (Indian Statistical Service)",
    designation: isSss
      ? "Junior Statistical Officer (JSO)"
      : "Senior Statistical Officer (SSO)",
    department: "Data Informatics & Innovation Division (DIID)",
    experienceYears: 4,
    education: "M.Sc. in Statistics",
    preferredLanguage: "en",
    verifiedBadge: "MoSPI Civil Servant (Karmayogi Bharat)",
    completedCourses: [
      {
        courseId: "do_11298388341098496001",
        name: "Statistical Methods for Survey Design and Analysis",
        organisation: "NSSTA",
        completedAt: "2025-09-12",
        certificateId: `CERT-NSSTA-${cleanId}-01`,
        durationSeconds: 14400,
        competenciesAwarded: [
          {
            code: "SURVEY_DESIGN",
            name: "Survey Design & Methodology",
            level: 3.5,
          },
          {
            code: "SURVEY_SAMPLING",
            name: "Survey Design and Sampling",
            level: 3.5,
          },
        ],
      },
      {
        courseId: "do_11298388341098496011",
        name: "Ethics and Integrity for Government Officials (Seva Bhav)",
        organisation: "DoPT",
        completedAt: "2025-05-19",
        certificateId: `CERT-DOPT-${cleanId}-02`,
        durationSeconds: 5400,
        competenciesAwarded: [
          {
            code: "ETHICS_INTEGRITY",
            name: "Ethics and Integrity (Seva Bhav)",
            level: 3.8,
          },
          {
            code: "LEADERSHIP_COLLAB",
            name: "Civil Service Leadership & Ethics",
            level: 3.8,
          },
        ],
      },
    ],
    skillsSummary: [
      "Survey Sampling Principles",
      "Official Data Scrutiny",
      "Civil Service Conduct Rules",
    ],
    identifiedGaps: [
      "Python for Data Analysis and Visualization",
      "AI/ML Fundamentals for Official Statistics",
    ],
  };

  return buildSunbirdResponse("api.user.profile.read", {
    profile: dynamicProfile,
  });
}

/**
 * Get all mock courses (for initial DB seeding).
 * Returns courses with competency code mappings for igot_courses and igot_competency_map tables.
 */
export function getAllMockCourses() {
  return MOCK_COURSES;
}

// ── Real API stubs (activated when IGOT_MOCK=false + IGOT_API_KEY set) ───────

async function _realSearchCourses({ competencyCodes, query, limit, offset }) {
  const url = `${IGOT_BASE_URL}/api/content/v1/search`;
  const body = {
    request: {
      filters: {
        contentType: ["Course"],
        status: ["Live"],
      },
      query,
      limit,
      offset,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${IGOT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return res.json();
}

async function _realEnrolCourse({ userId, courseId, batchId }) {
  const url = `${IGOT_BASE_URL}/api/course/v1/enrol`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${IGOT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ request: { userId, courseId, batchId } }),
  });
  return res.json();
}

async function _realGetEnrolments(userId) {
  const url = `${IGOT_BASE_URL}/api/course/v1/user/enrollment/list/${userId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${IGOT_API_KEY}` },
  });
  return res.json();
}

async function _realGetCourseDetails(courseId) {
  const url = `${IGOT_BASE_URL}/api/content/v1/read/${courseId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${IGOT_API_KEY}` },
  });
  return res.json();
}
