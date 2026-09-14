/**
 * How It Works Registry
 * Personally guided, step-by-step system workflows for Kshamata.
 * Aligned with Smart India Hackathon (SIH) 2026 Problem Statement 26101
 * (MoSPI DIID & NSSTA: AI-enabled Skill Intelligence & Capacity Building Platform).
 *
 * Each workflow connects steps in a natural, guiding story that matches the real UI.
 */

export const howItWorksTabs = {
  // Officer / Learner tabs
  'officer-overview': {
    title: 'How Your Officer Dashboard Works',
    role: 'Statistical Officer / Field Cadre',
    badge: 'Official Statistics Dashboard',
    summary:
      'A guided walkthrough of your personal command center — helping you track your role baseline, check live competency readiness, spot skill gaps, and take recommended learning actions.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Profile & Cadre Baseline',
        title: 'Start with your post and cadre baseline',
        description:
          'When you sign in, your dashboard automatically reflects your official MoSPI designation, department (such as NSSO, FOD, DIID, or NAD), and cadre baseline so all evaluations match your specific job role.',
      },
      {
        stepNumber: 2,
        tag: 'Readiness Meter',
        title: 'Next, check your overall competency score',
        description:
          'The readiness meter on top calculates your live score across 4 statutory domains: Statistical Methods, Technical Tools (Python, R, SQL, GIS), Digital Governance, and Management Ethics.',
      },
      {
        stepNumber: 3,
        tag: 'Spotting Deficits',
        title: 'Notice any flagged skill gaps below',
        description:
          'Directly beneath your score, the system alerts you if any competency falls below the target proficiency level required for your post, highlighting exactly where upskilling is needed.',
      },
      {
        stepNumber: 4,
        tag: 'Recommended Actions',
        title: 'Now, take action using your recommendation cards',
        description:
          'From here, you can click straight into recommended iGOT Karmayogi online courses, view upcoming NSSTA residential workshop circulars, or launch a quick diagnostic test to bridge those gaps.',
      },
      {
        stepNumber: 5,
        tag: 'Progress Ledger',
        title: 'Finally, watch your score and training hours update',
        description:
          'Every completed quiz, verified certificate, and iGOT course automatically updates your competency meter and logs credit towards the mandatory 50-hour annual training quota for civil servants.',
      },
    ],
    callout:
      'Mission Karmayogi Objective: This dashboard ensures ongoing, verifiable capacity building so officers stay continuously prepared for upcoming national survey rounds and departmental responsibilities.',
  },

  competencies: {
    title: 'How Your Competency Profile Works',
    role: 'Statistical Officer / Field Cadre',
    badge: 'MoSPI FRAC Framework',
    summary:
      'Learn how your skills are mapped against official MoSPI standards, verified through real evidence, and organized across the 5 proficiency levels.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Target Benchmarks',
        title: 'Start by viewing required benchmarks for your role',
        description:
          'Every competency in Kshamata follows the official MoSPI FRAC dictionary. Your specific cadre and posting define your required target proficiency level on a scale from Level 1 (Basic Awareness) to Level 5 (Expert Authority).',
      },
      {
        stepNumber: 2,
        tag: 'Domain Exploration',
        title: 'Next, explore across the 4 key competency domains',
        description:
          'Use the domain tabs and search bar to navigate between Statistical Methods (Survey Design, Sampling, National Accounts), Technical Tools (Python, R, SQL, Stata, GIS), Digital Governance, and Managerial Ethics.',
      },
      {
        stepNumber: 3,
        tag: 'Level Assessment',
        title: 'Review your current assessed level on each card',
        description:
          'Each card clearly displays your assessed level alongside your required target, showing at a glance where you are proficient and where further training is recommended.',
      },
      {
        stepNumber: 4,
        tag: 'Inspect Evidence',
        title: 'Click any competency card to inspect the proof',
        description:
          'Opening a card reveals your evidence ledger — showing completed iGOT courses, training certificates, and diagnostic quiz scores that back up your rating.',
      },
      {
        stepNumber: 5,
        tag: 'Diagnostic Retest',
        title: 'Now, raise your level with a quick self-evaluation test',
        description:
          'Whenever you acquire new skills or want to raise your level, click "Take Assessment" on the card to launch a short diagnostic test and refresh your official record.',
      },
    ],
    callout:
      'Evidence-Backed Integrity: Competency ratings are never based on guesswork. Every rating is supported by verifiable evidence from completed courses, official training, and diagnostic assessments.',
  },

  'skill-gaps': {
    title: 'How Automated Skill-Gap Analysis Works',
    role: 'Statistical Officer / Field Cadre',
    badge: 'Skill Deficit Analysis',
    summary:
      'Understand how the system automatically compares your current skills with your official job requirements, categorizes training urgency, and helps you close every gap.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Role Comparison',
        title: 'First, the system compares your assessed level with your job role',
        description:
          'Kshamata calculates the difference between what your MoSPI post requires and your current verified level for every competency. If your level meets or exceeds the benchmark, you are certified as Proficient.',
      },
      {
        stepNumber: 2,
        tag: 'Severity Sorting',
        title: 'Next, review your gaps sorted by priority',
        description:
          'Deficits are grouped clearly so you know what needs attention first: Critical Gaps (2 or more levels below requirement in core tasks), Moderate Gaps (1 level deficit), and Proficient.',
      },
      {
        stepNumber: 3,
        tag: 'Fieldwork Impact',
        title: 'Understand the operational impact on your surveys',
        description:
          'Gaps in high-priority operational tasks — such as CAPI digital survey enumeration, National Accounts compilation, or PLFS sampling — receive extra visibility to safeguard national statistical data.',
      },
      {
        stepNumber: 4,
        tag: 'Bridge This Gap',
        title: 'Now, take direct action with one click',
        description:
          'On any deficit card, click "Bridge This Gap". The system immediately presents matched iGOT Karmayogi online courses and upcoming NSSTA residential workshop circulars designed specifically for that skill.',
      },
      {
        stepNumber: 5,
        tag: 'Automatic Resolution',
        title: 'Finally, watch the gap resolve on your profile',
        description:
          'Once you complete the recommended module or pass a diagnostic re-test, the system recalculates your score and automatically marks the gap as "Resolved" on your official record.',
      },
    ],
    callout:
      'Career & Survey Preparedness: Resolving critical competency deficits helps ensure smooth survey operations, qualifies officers for specialized statistical assignments, and strengthens annual performance appraisals (APAR).',
  },

  'igot-explore': {
    title: 'How the iGOT Karmayogi Explorer Works',
    role: 'Statistical Officer / Field Cadre',
    badge: 'iGOT Karmayogi Catalog',
    summary:
      'Discover how to find, filter, and enroll in accredited government training courses that directly target your skill gaps and count toward your annual training quota.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Government Catalog',
        title: 'Start by browsing accredited government courses',
        description:
          'Explore an extensive catalog of accredited courses published by DoPT, MoSPI, NSSTA, and premier national training academies available on the official iGOT Karmayogi platform.',
      },
      {
        stepNumber: 2,
        tag: 'Deficit Filter',
        title: 'Next, turn on "Filter by My Skill Gaps"',
        description:
          'Instead of searching manually through hundreds of courses, toggle this switch to instantly filter the catalog down to only those courses that directly address your active competency deficits.',
      },
      {
        stepNumber: 3,
        tag: 'Course Details',
        title: 'Review syllabus, duration, and accredited hours',
        description:
          'Check the syllabus breakdown, estimated completion time, mapped FRAC competency code, and the accredited training hours you will earn upon completion.',
      },
      {
        stepNumber: 4,
        tag: 'Direct Enrollment',
        title: 'Now, click "Enroll on iGOT"',
        description:
          'You will be launched directly into the course on the official iGOT Karmayogi portal via government Single Sign-On (SSO) to complete the self-paced digital modules.',
      },
      {
        stepNumber: 5,
        tag: 'Automatic Sync',
        title: 'Finally, your certificate synchronizes automatically',
        description:
          'When you finish the course, your completion record, earned certificate, and training hours automatically sync back into Kshamata, updating your competency profile and counting toward your mandatory 50-hour annual quota.',
      },
    ],
    callout:
      'Statutory Learning Quota: Every accredited iGOT course completed through Kshamata counts directly toward the Government of India mandatory 50-hour annual capacity building requirement under Mission Karmayogi.',
  },

  'learning-paths': {
    title: 'How Personalized Learning Pathways Work',
    role: 'Statistical Officer / Field Cadre',
    badge: 'Step-by-Step Curricula',
    summary:
      'Follow structured, step-by-step training paths that combine online iGOT courses with NSSTA residential workshops to guide your professional growth from start to finish.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Tailored Curriculum',
        title: 'Start with a path built for your specific posting',
        description:
          'The system organizes training into a coherent, step-by-step curriculum based on your official cadre, current skill level, and identified gaps.',
      },
      {
        stepNumber: 2,
        tag: 'Logical Sequence',
        title: 'Follow the natural, progressive learning sequence',
        description:
          'Modules are arranged pedagogically so you master foundational concepts (such as Sampling Theory and Data Validation) first, before progressing to advanced statistical tools and automated pipelines.',
      },
      {
        stepNumber: 3,
        tag: 'Dual-Stream Training',
        title: 'Experience blended online and residential training',
        description:
          'Pathways combine flexible online modules from iGOT Karmayogi with in-person training workshop circulars issued by NSSTA Training Programme Advisory Committee (TPAC).',
      },
      {
        stepNumber: 4,
        tag: 'Milestone Checkpoints',
        title: 'Advance through milestones with quick check-ins',
        description:
          'As you complete each stage, short diagnostic checkpoints help you verify what you have learned and ensure you are confident before higher-level modules unlock.',
      },
      {
        stepNumber: 5,
        tag: 'Profile Upgrade',
        title: 'Finally, graduate the pathway and raise your official level',
        description:
          'Completing all milestones upgrades your verified competency level in the system and logs an accredited achievement in your official training dossier.',
      },
    ],
    callout:
      'Aligned with MoSPI Annual Capacity Building: These guided pathways support MoSPI’s Annual Capacity Building Plan (ACBP), ensuring targeted learning directly enhances operational statistical capabilities.',
  },

  'assessment-history': {
    title: 'How Assessment History & Evidence Works',
    role: 'Statistical Officer / Field Cadre',
    badge: 'Official Assessment Ledger',
    summary:
      'Learn how your completed diagnostic tests and quizzes are logged as verifiable proof of your skills, complete with official citations and score progression.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Chronological Record',
        title: 'First, view your chronological test history',
        description:
          'Every diagnostic assessment and self-evaluation quiz you take is permanently recorded with the date, exact time, time taken, percentage score, and target competency.',
      },
      {
        stepNumber: 2,
        tag: 'Evidence Drawer',
        title: 'Next, click "View Details" on any test card',
        description:
          'This opens the Evidence Provenance Drawer, giving you a complete breakdown of the questions asked, your selected answers, and the correct keys.',
      },
      {
        stepNumber: 3,
        tag: 'Official Citations',
        title: 'Check the exact government source for each question',
        description:
          'Every question is linked to an authentic MoSPI survey manual, field instruction, or statistical codebook citation, showing exactly where the answer comes from.',
      },
      {
        stepNumber: 4,
        tag: 'Competency Updates',
        title: 'See how your test updates your profile',
        description:
          'When you achieve a passing score, the system automatically creates a verified evidence entry that raises your assessed proficiency level in that competency.',
      },
      {
        stepNumber: 5,
        tag: 'APAR Documentation',
        title: 'Finally, use your verified record for official reviews',
        description:
          'Monitor your score improvement over time and reference your completed assessments as documented training evidence during your Annual Performance Assessment Report (APAR).',
      },
    ],
    callout:
      'Zero Guesswork & Full Transparency: Every quiz item is directly grounded in official MoSPI documentation, giving you full confidence in the fairness, accuracy, and official validity of your scores.',
  },

  // Admin & Governance tabs
  'admin-overview': {
    title: 'How the Admin Governance Dashboard Works',
    role: 'NSSTA / MoSPI Admin',
    badge: 'Administrative Command Center',
    summary:
      'A comprehensive overview of how administrators monitor cadre-wide readiness, handle urgent action queues, and manage workforce capacity building.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Cadre Readiness',
        title: 'Start with the workforce readiness overview',
        description:
          'Get an instant macro view of competency levels across all key divisions, including NSSO, Field Operations (FOD), DIID, and National Accounts (NAD).',
      },
      {
        stepNumber: 2,
        tag: 'Action Queues',
        title: 'Next, review pending administrative tasks',
        description:
          'The top alert banner immediately flags items requiring attention: questions in the review queue, newly ingested training circulars, or critical skill gaps ahead of upcoming survey rounds.',
      },
      {
        stepNumber: 3,
        tag: 'Quick Navigation',
        title: 'Use quick shortcuts to key tools',
        description:
          'Jump directly into creating tests in Assessment Studio, adjudicating questions in Review Queue, inspecting NSSTA circulars, or running workforce audits.',
      },
      {
        stepNumber: 4,
        tag: 'Distribution Trends',
        title: 'Review proficiency trends across divisions',
        description:
          'Visual charts show the distribution of officers across Basic, Intermediate, and Advanced proficiency levels in Statistical, Technical, and Governance domains.',
      },
      {
        stepNumber: 5,
        tag: 'Batch Planning',
        title: 'Proactively schedule workshops before major surveys',
        description:
          'Use detected workforce skill bottlenecks to allocate seats and schedule NSSTA residential training batches ahead of nationwide operations like PLFS, ASI, or Economic Census.',
      },
    ],
    callout:
      'Human-in-the-Loop Governance: While AI assists with question drafting and gap identification, MoSPI and NSSTA administrators hold full control and final approval before any content reaches officers.',
  },

  analytics: {
    title: 'How Workforce Analytics & Recalibration Works',
    role: 'NSSTA / MoSPI Admin',
    badge: 'Workforce Intelligence & Auditing',
    summary:
      'Understand how administrators analyze capability trends across divisions, monitor skill decay over time, and execute transparent recalibration audits.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Division Comparison',
        title: 'Start by comparing divisional capability',
        description:
          'Review side-by-side performance indicators for DIID, NSSO, FOD, and NAD to identify which cadres are meeting targets and which require training support.',
      },
      {
        stepNumber: 2,
        tag: 'Domain Heatmaps',
        title: 'Next, explore domain-level heatmaps',
        description:
          'Inspect collective workforce strengths and gaps across all 4 statutory domains: Statistical Methods, Technical Tools (Python/R/SQL), Digital Governance, and Management.',
      },
      {
        stepNumber: 3,
        tag: 'Freshness & Decay',
        title: 'Track when skills need refreshing',
        description:
          'The system tracks evidence age and flags competencies where certifications or test records have aged past recommended validity periods without recent refresher training.',
      },
      {
        stepNumber: 4,
        tag: 'Batch Audit',
        title: 'Execute a workforce audit with full transparency',
        description:
          'When needed, click "Run Recalibration Audit". The system evaluates evidence age across the workforce, updates decayed scores gradually, and logs official reason codes.',
      },
      {
        stepNumber: 5,
        tag: 'Audit History',
        title: 'Review the permanent audit history',
        description:
          'Every audit run is logged with the timestamp, executing administrator, number of officers affected, and specific adjustments made for full administrative accountability.',
      },
    ],
    callout:
      'Fast & Reliable Data Projections: Analytics views use optimized background projections, ensuring lightning-fast page loading while reflecting live assessment updates and audit adjustments immediately.',
  },

  assessments: {
    title: 'How Assessment Studio Works',
    role: 'NSSTA / MoSPI Admin',
    badge: 'Source-Grounded Test Creation',
    summary:
      'Learn how to create and generate authentic diagnostic quizzes and objective tests that are 100% grounded in official MoSPI survey manuals and guidelines.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Assessment Blueprint',
        title: 'Start by setting up the test parameters',
        description:
          'Select the test title, target FRAC competency, difficulty level, target cadre (such as Field Investigator or Senior Statistical Officer), and the desired number of questions.',
      },
      {
        stepNumber: 2,
        tag: 'Official Sources',
        title: 'Next, pick your authoritative source',
        description:
          'Choose verified MoSPI survey manuals, NSSO field instructions, or NSSTA training materials from the Knowledge Vault to serve as the factual baseline.',
      },
      {
        stepNumber: 3,
        tag: 'Question Drafting',
        title: 'Let the system extract verified questions',
        description:
          'The AI processes the selected text and drafts multiple-choice questions (MCQs) where every question stem, correct answer, and explanation is directly supported by specific clauses.',
      },
      {
        stepNumber: 4,
        tag: 'Anti-Hallucination Guard',
        title: 'Ensure strict factual integrity',
        description:
          'Built-in quality checks verify that every drafted item has a verbatim source citation and that distractors are plausible yet distinctly incorrect based on official rules.',
      },
      {
        stepNumber: 5,
        tag: 'Publish or Review',
        title: 'Finally, choose how to release the assessment',
        description:
          'You can publish approved tests directly into the officer assessment catalog, or route questions to the Review Queue for multi-expert review.',
      },
    ],
    callout:
      'Zero-Hallucination Guarantee: No question can be generated without a direct, verifiable paragraph citation from an authentic government document, guaranteeing legal defensibility and objective testing.',
  },

  'review-queue': {
    title: 'How the Question Review Queue Works',
    role: 'NSSTA / MoSPI Admin',
    badge: 'Expert Verification & Approval',
    summary:
      'Discover how MoSPI and NSSTA subject-matter experts review, refine, and approve AI-generated assessment questions before they are delivered to officers.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Subject Filters',
        title: 'Start by browsing the pending queue',
        description:
          'Filter questions awaiting review by competency domain, difficulty level, upload document, or AI confidence score to focus on your area of expertise.',
      },
      {
        stepNumber: 2,
        tag: 'Side-by-Side Check',
        title: 'Next, verify the factual basis side-by-side',
        description:
          'Inspect the drafted question, options, and correct key alongside the highlighted original paragraph from the official MoSPI survey manual.',
      },
      {
        stepNumber: 3,
        tag: 'Direct Editing',
        title: 'Refine and polish the question on screen',
        description:
          'As an expert reviewer, you can adjust question phrasing, edit options, improve explanations, or re-tag competencies directly in the queue.',
      },
      {
        stepNumber: 4,
        tag: 'Adjudication',
        title: 'Approve or reject with clear feedback',
        description:
          'Click "Approve" to immediately add verified questions to the active test bank, or click "Reject" with feedback notes to discard unsuitable items.',
      },
      {
        stepNumber: 5,
        tag: 'Permanent Audit',
        title: 'Every decision is permanently recorded',
        description:
          'Your approval or rejection is logged with your admin identity, timestamp, and review comments, ensuring full compliance with official quality assurance standards.',
      },
    ],
    callout:
      'Administrative Safeguard: Officers only ever encounter questions that have been verified and approved by human subject-matter experts, ensuring 100% curriculum and policy alignment.',
  },

  'nssta-notices': {
    title: 'How NSSTA Training Circulars Work',
    role: 'NSSTA / MoSPI Admin',
    badge: 'Training Circular Intelligence',
    summary:
      'See how training circulars and workshop schedules from NSSTA are ingested, mapped to competencies, and automatically connected to officers who need them.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Notice Scanning',
        title: 'Start by monitoring new circulars',
        description:
          'The system automatically scans official NSSTA notice boards to ingest newly issued residential training circulars, annual calendars, and workshop announcements.',
      },
      {
        stepNumber: 2,
        tag: 'Direct Upload',
        title: 'Upload circulars manually anytime',
        description:
          'Administrators can also upload official circular PDFs directly, with automatic deduplication using SHA-256 integrity checks.',
      },
      {
        stepNumber: 3,
        tag: 'Smart Parsing',
        title: 'Extract key details with smart parsing',
        description:
          'The system reads the notice text to identify workshop dates, target cadres, eligibility criteria, and automatically maps topics to official MoSPI competencies.',
      },
      {
        stepNumber: 4,
        tag: 'Gap Matching',
        title: 'Automatically bridge circulars into officer pathways',
        description:
          'Approved notices appear directly on the dashboards and learning pathways of officers who have matching skill deficits, streamlining nominations.',
      },
      {
        stepNumber: 5,
        tag: 'Portal Sync',
        title: 'Keep records updated in real time',
        description:
          'Click "Refresh Notices" at any time to re-sync with the latest circular updates and ensure training schedules remain current.',
      },
    ],
    callout:
      'Connecting In-Person Training with Digital Learning: This feature bridges NSSTA’s Training Programme Advisory Committee (TPAC) residential workshops directly into digital learning paths alongside iGOT courses.',
  },

  predictions: {
    title: 'How Predictive Workforce Insights Work',
    role: 'NSSTA / MoSPI Admin',
    badge: 'Workforce Risk Signals',
    summary:
      'Learn how the platform forecasts future skill shortages, tracks technology transitions, and identifies skill decay to help leadership plan capacity building well in advance.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Cadre Targeting',
        title: 'Start by selecting your target division',
        description:
          'Focus your analysis on DIID, NSSO, FOD, or NAD to examine specific capability trajectories for particular cadres and field postings.',
      },
      {
        stepNumber: 2,
        tag: 'Statutory Grounding',
        title: 'Rely on verified data, not guesswork',
        description:
          'The system only generates trend forecasts for competencies that have sufficient diagnostic assessment data, ensuring projections are statistically sound.',
      },
      {
        stepNumber: 3,
        tag: 'Decay Detection',
        title: 'Detect which skills are fading over time',
        description:
          'Spot competencies (such as specialized CAPI digital tools or econometric packages) where infrequent field use is leading to skill atrophy across the cadre.',
      },
      {
        stepNumber: 4,
        tag: 'Modernization Models',
        title: 'Anticipate modernization requirements',
        description:
          'Forecast upcoming training needs related to modern statistical practices, including geospatial GIS mapping, big data pipelines, and automated survey validation.',
      },
      {
        stepNumber: 5,
        tag: 'Calendar Planning',
        title: 'Translate insights into actionable plans',
        description:
          'Export predictive findings to prioritize high-demand subjects in the upcoming NSSTA annual calendar and allocate training budgets effectively.',
      },
    ],
    callout:
      'Statistically Defensible Planning: If historical assessment data is limited for a skill, the system transparently indicates "Data Insufficient" rather than producing speculative projections.',
  },

  'acbp-report': {
    title: 'How the ACBP Report Export Works',
    role: 'NSSTA / MoSPI Admin',
    badge: 'CBC Statutory Dossier',
    summary:
      'Discover how the platform compiles ministry-wide competency assessments and training data into the official Annual Capacity Building Plan (ACBP) mandated by the Capacity Building Commission.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Workforce Aggregation',
        title: 'Start by compiling department-wide data',
        description:
          'The platform aggregates verified competency ratings, active skill deficits, completed training hours, and assessment records across all MoSPI divisions.',
      },
      {
        stepNumber: 2,
        tag: 'Three CBC Pillars',
        title: 'Organize interventions across mandatory pillars',
        description:
          'In accordance with Capacity Building Commission (CBC) guidelines, training needs are grouped into Domain Competencies (Statistical), Behavioral Leadership, and Functional Rules.',
      },
      {
        stepNumber: 3,
        tag: 'Quota Allocation',
        title: 'Review recommended training allocations',
        description:
          'The report automatically computes target participant-days and balanced delivery across NSSTA residential workshops, iGOT online courses, and academic partnerships.',
      },
      {
        stepNumber: 4,
        tag: 'Executive Trends',
        title: 'Inspect charts and executive summaries',
        description:
          'High-level visualizations and briefing notes help Ministry leadership review progress and prioritize interventions before formal submission.',
      },
      {
        stepNumber: 5,
        tag: 'PDF Export',
        title: 'Export your official dossier with one click',
        description:
          'Click "Export Dossier (PDF)" to generate a formatted, publication-ready document conforming to CBC national training standards ready for submission.',
      },
    ],
    callout:
      'Mandated by Mission Karmayogi: The generated ACBP dossier provides the empirical, data-driven foundation required for MoSPI’s statutory reporting to the Capacity Building Commission (CBC).',
  },

  sources: {
    title: 'How the Source Library & Knowledge Vault Works',
    role: 'NSSTA / MoSPI Admin',
    badge: 'Knowledge Vault & Grounding',
    summary:
      'Learn how official MoSPI survey manuals and guidelines are securely stored, processed into searchable clauses, and used to ground AI question generation with zero hallucination.',
    steps: [
      {
        stepNumber: 1,
        tag: 'Document Ingestion',
        title: 'Start by adding authentic source materials',
        description:
          'Upload official survey manuals (PDF), field instructions, statistical codebooks (CSV/JSON), and NSSTA training syllabi to build your knowledge library.',
      },
      {
        stepNumber: 2,
        tag: 'Security Checks',
        title: 'Verify files safely upon upload',
        description:
          'Each document undergoes automated integrity verification using SHA-256 checksums, basic format checks, and duplicate detection.',
      },
      {
        stepNumber: 3,
        tag: 'Semantic Chunking',
        title: 'Break documents into structured clauses',
        description:
          'The system parses and chunks the text while preserving chapter titles, section numbers, and paragraph references for exact traceability.',
      },
      {
        stepNumber: 4,
        tag: 'Competency Tagging',
        title: 'Tag content with competency standards',
        description:
          'Extracted clauses are mapped to corresponding MoSPI competencies, making them easily searchable and retrievable during test authoring.',
      },
      {
        stepNumber: 5,
        tag: 'Factual Grounding',
        title: 'Power zero-hallucination question synthesis',
        description:
          'Ingested documents serve as the exclusive knowledge base for AI Assessment Studio, ensuring every generated question is anchored in real official text.',
      },
    ],
    callout:
      'Auditability & Provenance: Every document in the Knowledge Vault maintains an immutable record, ensuring any question generated can always be traced directly back to its authentic government source.',
  },
};

/**
 * Helper to resolve the correct tab key from route pathname and user role.
 */
export function resolveTabKey(pathname, isAdmin = false) {
  if (!pathname) return isAdmin ? 'admin-overview' : 'officer-overview';

  const cleanPath = pathname.toLowerCase().replace(/\/$/, '');

  // Settings page does not show How It Works guide
  if (cleanPath.includes('/dashboard/settings')) {
    return null;
  }

  if (cleanPath === '/dashboard' || cleanPath === '') {
    return isAdmin ? 'admin-overview' : 'officer-overview';
  }

  if (cleanPath.includes('/dashboard/competencies')) return 'competencies';
  if (cleanPath.includes('/dashboard/skill-gaps')) return 'skill-gaps';
  if (cleanPath.includes('/dashboard/igot-explore')) return 'igot-explore';
  if (cleanPath.includes('/dashboard/learning-paths')) return 'learning-paths';
  if (cleanPath.includes('/dashboard/assessment-history')) return 'assessment-history';
  if (cleanPath.includes('/dashboard/analytics')) return 'analytics';
  if (cleanPath.includes('/dashboard/assessments')) return 'assessments';
  if (cleanPath.includes('/dashboard/sources')) return 'sources';
  if (cleanPath.includes('/dashboard/admin/review-queue') || cleanPath.includes('/dashboard/review-queue')) return 'review-queue';
  if (cleanPath.includes('/dashboard/admin/predictions')) return 'predictions';
  if (cleanPath.includes('/dashboard/admin/acbp-report')) return 'acbp-report';
  if (cleanPath.includes('/dashboard/admin/nssta-notices') || cleanPath.includes('/dashboard/nssta-notices')) return 'nssta-notices';

  return isAdmin ? 'admin-overview' : 'officer-overview';
}
