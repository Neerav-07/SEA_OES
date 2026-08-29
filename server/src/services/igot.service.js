/**
 * iGOT Karmayogi Mock Service — Sunbird-Compatible API
 *
 * Implements the exact Sunbird REST API request/response shapes.
 * All course data is based on real courses found on iGOT Karmayogi public portal.
 *
 * To switch to real iGOT:
 *   Set IGOT_BASE_URL and IGOT_API_KEY in server .env
 *   The service automatically routes to real API when IGOT_MOCK=false
 *
 * Sunbird API reference: https://project-sunbird.github.io/sunbird-docs/
 */

const IGOT_BASE_URL = process.env.IGOT_BASE_URL || 'https://igotkarmayogi.gov.in';
const IGOT_API_KEY = process.env.IGOT_API_KEY || '';
const USE_MOCK = process.env.IGOT_MOCK !== 'false'; // default: mock mode

// ── Mock Course Catalogue ──────────────────────────────────────────────────────
// Based on real courses available on iGOT Karmayogi as of 2026.
// Mapped to MoSPI competency codes for recommendation routing.
const MOCK_COURSES = [
  {
    identifier: 'do_11298388341098496001',
    name: 'Statistical Methods for Survey Design and Analysis',
    contentType: 'Course',
    subject: ['Statistics', 'Survey Methodology'],
    duration: '14400', // 4 hours in seconds
    pkgVersion: 2,
    organisation: 'NSSTA',
    language: ['English', 'Hindi'],
    medium: ['English', 'Hindi'],
    description: 'A comprehensive course covering probability sampling, sample size estimation, survey instrument design, and analysis of household survey data using statistical software.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/stats.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['SAMPLING_METHODS', 'SURVEY_DESIGN', 'DATA_QUALITY'],
    batchId: 'batch_11298388341098496001',
  },
  {
    identifier: 'do_11298388341098496002',
    name: 'Python for Data Analysis and Visualization',
    contentType: 'Course',
    subject: ['Data Science', 'Python'],
    duration: '21600', // 6 hours
    pkgVersion: 3,
    organisation: 'MeitY',
    language: ['English'],
    medium: ['English'],
    description: 'Hands-on Python course covering pandas, numpy, scipy.stats, matplotlib, and seaborn for statistical data analysis and visualization of survey datasets.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/python.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['PYTHON_ANALYTICS', 'DATA_VISUALIZATION'],
    batchId: 'batch_11298388341098496002',
  },
  {
    identifier: 'do_11298388341098496003',
    name: 'Introduction to Machine Learning for Government Officials',
    contentType: 'Course',
    subject: ['Artificial Intelligence', 'Machine Learning'],
    duration: '18000', // 5 hours
    pkgVersion: 1,
    organisation: 'NASSCOM',
    language: ['English', 'Hindi'],
    medium: ['English', 'Hindi'],
    description: 'Foundational AI/ML course for civil servants covering supervised learning, NLP basics, responsible AI principles, and ML applications in public service delivery.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/ai.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['AI_ML_FUNDAMENTALS', 'PYTHON_ANALYTICS'],
    batchId: 'batch_11298388341098496003',
  },
  {
    identifier: 'do_11298388341098496004',
    name: 'Cybersecurity Fundamentals for Government Officials (CERT-In)',
    contentType: 'Course',
    subject: ['Cybersecurity', 'Information Security'],
    duration: '10800', // 3 hours
    pkgVersion: 2,
    organisation: 'CERT-In',
    language: ['English', 'Hindi'],
    medium: ['English', 'Hindi'],
    description: 'CERT-In certified course covering cybersecurity threats, incident reporting, access management, phishing awareness, and government IS security policy.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/security.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['CYBERSECURITY', 'DATA_PRIVACY'],
    batchId: 'batch_11298388341098496004',
  },
  {
    identifier: 'do_11298388341098496005',
    name: 'Data Visualization and Dashboarding for Statistical Dissemination',
    contentType: 'Course',
    subject: ['Data Visualization', 'Business Intelligence'],
    duration: '14400', // 4 hours
    pkgVersion: 1,
    organisation: 'NIC',
    language: ['English'],
    medium: ['English'],
    description: 'Covers Power BI and Tableau fundamentals, dashboard design principles, chart selection framework, and creating statistical publications using visualization tools.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/dataviz.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['DATA_VISUALIZATION', 'SQL_DATABASE'],
    batchId: 'batch_11298388341098496005',
  },
  {
    identifier: 'do_11298388341098496006',
    name: 'GIS and Spatial Data Analysis for Census and Surveys',
    contentType: 'Course',
    subject: ['GIS', 'Spatial Analysis'],
    duration: '18000', // 5 hours
    pkgVersion: 1,
    organisation: 'NRSC',
    language: ['English'],
    medium: ['English'],
    description: 'Introduction to QGIS, spatial data types, thematic map creation, and application of GIS for Census delineation, survey frame construction, and agricultural statistics.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/gis.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['GIS_SPATIAL', 'AGRI_STATISTICS'],
    batchId: 'batch_11298388341098496006',
  },
  {
    identifier: 'do_11298388341098496007',
    name: 'Understanding SDG Indicators: India\'s Monitoring Framework',
    contentType: 'Course',
    subject: ['SDG', 'International Statistics'],
    duration: '7200', // 2 hours
    pkgVersion: 1,
    organisation: 'MoSPI',
    language: ['English', 'Hindi'],
    medium: ['English', 'Hindi'],
    description: 'Overview of SDG framework, Tier classification, India SDG Index computation, VNR reporting methodology, and IAEG-SDGs metadata requirements.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/sdg.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['SDG_INDICATORS', 'METADATA_STANDARDS'],
    batchId: 'batch_11298388341098496007',
  },
  {
    identifier: 'do_11298388341098496008',
    name: 'National Accounts Statistics: Concepts and Compilation',
    contentType: 'Course',
    subject: ['National Accounts', 'Macroeconomics'],
    duration: '21600', // 6 hours
    pkgVersion: 2,
    organisation: 'MoSPI',
    language: ['English'],
    medium: ['English'],
    description: 'GDP estimation approaches, SNA 2008 framework, GVA sectoral compilation, Supply-Use Tables, and India-specific NAS methodology with hands-on exercises.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/nas.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['NATIONAL_ACCOUNTS', 'PRICE_STATISTICS'],
    batchId: 'batch_11298388341098496008',
  },
  {
    identifier: 'do_11298388341098496009',
    name: 'Cloud Computing on MeghRaj: Government Cloud Services',
    contentType: 'Course',
    subject: ['Cloud Computing', 'Digital Governance'],
    duration: '10800', // 3 hours
    pkgVersion: 1,
    organisation: 'NIC',
    language: ['English', 'Hindi'],
    medium: ['English', 'Hindi'],
    description: 'MeghRaj government cloud deployment models, compliance requirements, migration strategies, and using GI Cloud services for statistical data storage.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/cloud.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['CLOUD_COMPUTING', 'GOVT_CLOUD', 'CYBERSECURITY'],
    batchId: 'batch_11298388341098496009',
  },
  {
    identifier: 'do_11298388341098496010',
    name: 'Labour Force Survey Methods and PLFS Analysis',
    contentType: 'Course',
    subject: ['Labour Statistics', 'Survey Methodology'],
    duration: '14400', // 4 hours
    pkgVersion: 1,
    organisation: 'NSSO',
    language: ['English', 'Hindi'],
    medium: ['English', 'Hindi'],
    description: 'PLFS design and concepts, employment activity statuses (UPSS/UPAS/CWS/CDS), labour force participation rate computation, and analysis of PLFS unit-level data.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/labour.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['LABOUR_STATISTICS', 'SAMPLING_METHODS', 'STATA_SPSS'],
    batchId: 'batch_11298388341098496010',
  },
  {
    identifier: 'do_11298388341098496011',
    name: 'Ethics and Integrity for Government Officials (Seva Bhav)',
    contentType: 'Course',
    subject: ['Ethics', 'Governance'],
    duration: '5400', // 1.5 hours
    pkgVersion: 3,
    organisation: 'DoPT',
    language: ['English', 'Hindi'],
    medium: ['English', 'Hindi'],
    description: 'Civil servant conduct rules, conflict of interest scenarios, whistleblower protection, statistical ethics (UN Fundamental Principles), and Seva Bhav values.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/ethics.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['ETHICS_INTEGRITY', 'DECISION_MAKING'],
    batchId: 'batch_11298388341098496011',
  },
  {
    identifier: 'do_11298388341098496012',
    name: 'SQL for Data Management and Statistical Analysis',
    contentType: 'Course',
    subject: ['SQL', 'Database Management'],
    duration: '18000', // 5 hours
    pkgVersion: 2,
    organisation: 'NIC',
    language: ['English'],
    medium: ['English'],
    description: 'SQL queries, JOINs, window functions, ETL design, and PostgreSQL administration for managing large survey databases and analytical data warehouses.',
    appIcon: 'https://igotkarmayogi.gov.in/assets/icons/sql.png',
    status: 'Live',
    gradeLevel: ['Professional'],
    competencyCodes: ['SQL_DATABASE', 'PYTHON_ANALYTICS', 'DATA_VISUALIZATION'],
    batchId: 'batch_11298388341098496012',
  },
];

// ── Sunbird-compatible response builder ──────────────────────────────────────

function buildSunbirdResponse(id, result) {
  return {
    id,
    ver: 'v1.0',
    ts: new Date().toISOString(),
    params: {
      resmsgid: `mock-${Date.now()}`,
      msgid: null,
      status: 'successful',
      err: null,
      errmsg: null,
    },
    responseCode: 'OK',
    result,
  };
}

// ── Public API Functions ──────────────────────────────────────────────────────

/**
 * Search courses by competency codes and/or query string.
 * Returns Sunbird-shaped response: { result: { count, content } }
 */
export async function searchCourses({ competencyCodes = [], query = '', limit = 20, offset = 0 }) {
  if (!USE_MOCK) {
    return _realSearchCourses({ competencyCodes, query, limit, offset });
  }

  let matches = MOCK_COURSES.filter(course => {
    const codeMatch = competencyCodes.length === 0 || competencyCodes.some(code => course.competencyCodes.includes(code));
    const queryMatch = !query || course.name.toLowerCase().includes(query.toLowerCase()) || course.description.toLowerCase().includes(query.toLowerCase());
    return codeMatch && queryMatch;
  });

  // Simulate pagination
  const total = matches.length;
  matches = matches.slice(offset, offset + limit);

  return buildSunbirdResponse('api.content.search', {
    count: total,
    content: matches.map(({ competencyCodes: _cc, batchId: _bi, ...c }) => c),
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

  const course = MOCK_COURSES.find(c => c.identifier === courseId);
  if (!course) {
    return buildSunbirdResponse('api.course.enrol', {
      response: 'FAILED',
      error: 'Course not found',
    });
  }

  return buildSunbirdResponse('api.course.enrol', {
    response: 'SUCCESS',
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
  return buildSunbirdResponse('api.course.user.enrollment.list', {
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

  const course = MOCK_COURSES.find(c => c.identifier === courseId);
  if (!course) {
    return buildSunbirdResponse('api.content.read', { content: null });
  }

  const { competencyCodes: _cc, batchId: _bi, ...content } = course;
  return buildSunbirdResponse('api.content.read', { content });
}

// ── Mock Civil Servant Profiles (Demo Onboarding Sync) ─────────────────────────
const DEMO_KARMAYOGI_PROFILES = [
  {
    karmayogiId: 'ISS-2021-0842',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@mospi.gov.in',
    cadre: 'ISS (Indian Statistical Service)',
    designation: 'Senior Statistical Officer (SSO)',
    department: 'Data Informatics & Innovation Division (DIID)',
    experienceYears: 6,
    education: 'M.Sc. in Statistics & Computing',
    preferredLanguage: 'en',
    verifiedBadge: 'MoSPI Civil Servant (Karmayogi Bharat)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    completedCourses: [
      {
        courseId: 'do_11298388341098496001',
        name: 'Statistical Methods for Survey Design and Analysis',
        organisation: 'NSSTA',
        completedAt: '2025-11-14',
        certificateId: 'CERT-NSSTA-2025-8821',
        durationSeconds: 14400,
        competenciesAwarded: [
          { code: 'SURVEY_DESIGN', name: 'Survey Design & Methodology', level: 3.8 },
          { code: 'SAMPLING_METHODS', name: 'Sampling Theory & Methods', level: 3.5 },
          { code: 'SURVEY_SAMPLING', name: 'Survey Design and Sampling', level: 3.8 },
        ],
      },
      {
        courseId: 'do_11298388341098496004',
        name: 'Cybersecurity Fundamentals for Government Officials (CERT-In)',
        organisation: 'CERT-In',
        completedAt: '2025-08-20',
        certificateId: 'CERT-CERTIN-2025-4109',
        durationSeconds: 10800,
        competenciesAwarded: [
          { code: 'DATA_PRIVACY', name: 'Data Privacy and Cybersecurity', level: 3.5 },
          { code: 'CYBERSECURITY', name: 'Cybersecurity Fundamentals', level: 3.5 },
        ],
      },
      {
        courseId: 'do_11298388341098496011',
        name: 'Ethics and Integrity for Government Officials (Seva Bhav)',
        organisation: 'DoPT',
        completedAt: '2025-06-10',
        certificateId: 'CERT-DOPT-2025-1205',
        durationSeconds: 5400,
        competenciesAwarded: [
          { code: 'ETHICS_INTEGRITY', name: 'Ethics and Integrity (Seva Bhav)', level: 4.0 },
          { code: 'LEADERSHIP_COLLAB', name: 'Civil Service Leadership & Ethics', level: 4.0 },
        ],
      },
    ],
    skillsSummary: [
      'Survey Sampling Design',
      'Data Quality Standards',
      'CERT-In Cyber Hygiene',
      'Civil Service Ethics (Seva Bhav)',
    ],
    identifiedGaps: [
      'Python for Data Analysis and Visualization',
      'AI/ML Fundamentals for Official Statistics',
      'Government Cloud Computing (MeghRaj)',
    ],
  },
  {
    karmayogiId: 'SSS-2023-1149',
    name: 'Priya Verma',
    email: 'priya.verma@mospi.gov.in',
    cadre: 'SSS (Subordinate Statistical Service)',
    designation: 'Junior Statistical Officer (JSO)',
    department: 'Field Operations Division (FOD)',
    experienceYears: 3,
    education: 'B.Sc. in Mathematical Statistics',
    preferredLanguage: 'en',
    verifiedBadge: 'MoSPI Civil Servant (Karmayogi Bharat)',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    completedCourses: [
      {
        courseId: 'do_11298388341098496010',
        name: 'Labour Force Survey Methods and PLFS Analysis',
        organisation: 'NSSO',
        completedAt: '2025-10-05',
        certificateId: 'CERT-NSSO-2025-0412',
        durationSeconds: 14400,
        competenciesAwarded: [
          { code: 'LABOUR_STATISTICS', name: 'Labour Statistics (PLFS)', level: 3.4 },
          { code: 'SURVEY_DESIGN', name: 'Survey Design & Methodology', level: 3.0 },
          { code: 'SURVEY_SAMPLING', name: 'Survey Design and Sampling', level: 3.0 },
        ],
      },
      {
        courseId: 'do_11298388341098496011',
        name: 'Ethics and Integrity for Government Officials (Seva Bhav)',
        organisation: 'DoPT',
        completedAt: '2025-04-18',
        certificateId: 'CERT-DOPT-2025-9912',
        durationSeconds: 5400,
        competenciesAwarded: [
          { code: 'ETHICS_INTEGRITY', name: 'Ethics and Integrity (Seva Bhav)', level: 3.5 },
          { code: 'LEADERSHIP_COLLAB', name: 'Civil Service Leadership & Ethics', level: 3.5 },
        ],
      },
    ],
    skillsSummary: [
      'Field Enumeration & Scrutiny',
      'PLFS Survey Instruments',
      'CAPI Household Canvassing',
    ],
    identifiedGaps: [
      'SQL for Data Management and Statistical Analysis',
      'Python Data Cleaning',
      'Data Visualization & Dashboards',
    ],
  },
  {
    karmayogiId: 'ISS-2018-0329',
    name: 'Anil Kumar',
    email: 'anil.kumar@mospi.gov.in',
    cadre: 'ISS (Indian Statistical Service)',
    designation: 'Assistant Director',
    department: 'National Accounts Division (NAD)',
    experienceYears: 8,
    education: 'M.Stat (Indian Statistical Institute, Kolkata)',
    preferredLanguage: 'en',
    verifiedBadge: 'MoSPI Civil Servant (Karmayogi Bharat)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    completedCourses: [
      {
        courseId: 'do_11298388341098496008',
        name: 'National Accounts Statistics: Concepts and Compilation',
        organisation: 'MoSPI',
        completedAt: '2024-12-01',
        certificateId: 'CERT-MOSPI-2024-0199',
        durationSeconds: 21600,
        competenciesAwarded: [
          { code: 'NATIONAL_ACCOUNTS', name: 'National Accounts Statistics (NAS)', level: 4.2 },
          { code: 'STATISTICAL_ANALYSIS', name: 'Statistical Analysis', level: 4.2 },
        ],
      },
      {
        courseId: 'do_11298388341098496007',
        name: 'Understanding SDG Indicators: India\'s Monitoring Framework',
        organisation: 'MoSPI',
        completedAt: '2025-02-15',
        certificateId: 'CERT-SDG-2025-3321',
        durationSeconds: 7200,
        competenciesAwarded: [
          { code: 'SDG_INDICATORS', name: 'SDG Indicators & Monitoring', level: 3.8 },
          { code: 'METADATA_STANDARDS', name: 'Metadata Standards & Data Quality', level: 3.6 },
        ],
      },
      {
        courseId: 'do_11298388341098496001',
        name: 'Statistical Methods for Survey Design and Analysis',
        organisation: 'NSSTA',
        completedAt: '2024-05-10',
        certificateId: 'CERT-NSSTA-2024-7711',
        durationSeconds: 14400,
        competenciesAwarded: [
          { code: 'SURVEY_DESIGN', name: 'Survey Design & Methodology', level: 4.0 },
          { code: 'SURVEY_SAMPLING', name: 'Survey Design and Sampling', level: 4.0 },
        ],
      },
    ],
    skillsSummary: [
      'SNA 2008 National Accounts',
      'GDP/GVA Sectoral Compilation',
      'SDG India Index Framework',
      'Statistical Metadata Standardization',
    ],
    identifiedGaps: [
      'Cloud Computing on MeghRaj',
      'Advanced Python Analytics for Big Data',
      'AI/ML for Statistical Dissemination',
    ],
  },
];

/**
 * Get all available demo profiles for fast-track onboarding selection.
 */
export function getDemoKarmayogiProfiles() {
  return buildSunbirdResponse('api.user.profiles.demo', {
    count: DEMO_KARMAYOGI_PROFILES.length,
    profiles: DEMO_KARMAYOGI_PROFILES,
  });
}

/**
 * Fetch a specific Karmayogi profile by its ID (or generate a realistic custom profile for any ID).
 */
export function getDemoProfileByKarmayogiId(karmayogiId) {
  const cleanId = String(karmayogiId || '').trim();
  const found = DEMO_KARMAYOGI_PROFILES.find(
    (p) =>
      p.karmayogiId.toLowerCase() === cleanId.toLowerCase() ||
      p.email.toLowerCase() === cleanId.toLowerCase(),
  );

  if (found) {
    return buildSunbirdResponse('api.user.profile.read', { profile: found });
  }

  // Fallback: dynamic valid MoSPI profile for any arbitrary user test ID
  const isSss = cleanId.toUpperCase().startsWith('SSS');
  const dynamicProfile = {
    karmayogiId: cleanId || 'ISS-DEMO-2026',
    name: 'Officer ' + cleanId,
    email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mospi.gov.in`,
    cadre: isSss ? 'SSS (Subordinate Statistical Service)' : 'ISS (Indian Statistical Service)',
    designation: isSss ? 'Junior Statistical Officer (JSO)' : 'Senior Statistical Officer (SSO)',
    department: 'Data Informatics & Innovation Division (DIID)',
    experienceYears: 4,
    education: 'M.Sc. in Statistics',
    preferredLanguage: 'en',
    verifiedBadge: 'MoSPI Civil Servant (Karmayogi Bharat)',
    completedCourses: [
      {
        courseId: 'do_11298388341098496001',
        name: 'Statistical Methods for Survey Design and Analysis',
        organisation: 'NSSTA',
        completedAt: '2025-09-12',
        certificateId: `CERT-NSSTA-${cleanId}-01`,
        durationSeconds: 14400,
        competenciesAwarded: [
          { code: 'SURVEY_DESIGN', name: 'Survey Design & Methodology', level: 3.5 },
          { code: 'SURVEY_SAMPLING', name: 'Survey Design and Sampling', level: 3.5 },
        ],
      },
      {
        courseId: 'do_11298388341098496011',
        name: 'Ethics and Integrity for Government Officials (Seva Bhav)',
        organisation: 'DoPT',
        completedAt: '2025-05-19',
        certificateId: `CERT-DOPT-${cleanId}-02`,
        durationSeconds: 5400,
        competenciesAwarded: [
          { code: 'ETHICS_INTEGRITY', name: 'Ethics and Integrity (Seva Bhav)', level: 3.8 },
          { code: 'LEADERSHIP_COLLAB', name: 'Civil Service Leadership & Ethics', level: 3.8 },
        ],
      },
    ],
    skillsSummary: [
      'Survey Sampling Principles',
      'Official Data Scrutiny',
      'Civil Service Conduct Rules',
    ],
    identifiedGaps: [
      'Python for Data Analysis and Visualization',
      'AI/ML Fundamentals for Official Statistics',
    ],
  };

  return buildSunbirdResponse('api.user.profile.read', { profile: dynamicProfile });
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
        contentType: ['Course'],
        status: ['Live'],
      },
      query,
      limit,
      offset,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${IGOT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return res.json();
}

async function _realEnrolCourse({ userId, courseId, batchId }) {
  const url = `${IGOT_BASE_URL}/api/course/v1/enrol`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${IGOT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ request: { userId, courseId, batchId } }),
  });
  return res.json();
}

async function _realGetEnrolments(userId) {
  const url = `${IGOT_BASE_URL}/api/course/v1/user/enrollment/list/${userId}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${IGOT_API_KEY}` },
  });
  return res.json();
}

async function _realGetCourseDetails(courseId) {
  const url = `${IGOT_BASE_URL}/api/content/v1/read/${courseId}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${IGOT_API_KEY}` },
  });
  return res.json();
}
