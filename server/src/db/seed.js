/**
 * V2 Main Database Seed Orchestrator
 *
 * Execution order:
 *   1. MoSPI competency framework (all 4 FRAC domains)
 *   2. FRAC roles, activities, and competency requirements
 *   3. NSSTA TPAC programme catalogue
 *   4. iGOT course catalogue (into igot_courses + igot_competency_map)
 *   5. Demo users: 1 ADMIN + 3 EMPLOYEE officials
 *   6. Demo evidence for officials
 *
 * All inserts use ON CONFLICT DO NOTHING — safe to run multiple times.
 */
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { users, officials, evidence } from './schema/index.js';
import { seedMoSPICompetencies } from './seed/mospi-competencies.seed.js';
import { seedFracRoles } from './seed/frac-roles.seed.js';
import { seedNsstaProgrammes } from './seed/nssta-programmes.seed.js';
import { getAllMockCourses } from '../services/igot.service.js';
import { recalculateSkillGaps } from '../services/skillGap.service.js';

export async function seedDatabase() {
  console.log('\n🌱 ════════════════════════════════════════════════════');
  console.log('🌱  Kshamata V2 — MoSPI FRAC Database Seed Starting...');
  console.log('🌱 ════════════════════════════════════════════════════\n');

  try {
    // ── Step 1: Full MoSPI Competency Framework ─────────────────────────────
    const competencyRows = await seedMoSPICompetencies();

    // ── Step 2: FRAC Roles, Activities & Requirements ───────────────────────
    const roleRows = await seedFracRoles(competencyRows);

    // ── Step 3: NSSTA TPAC Programme Catalogue ──────────────────────────────
    await seedNsstaProgrammes(competencyRows);

    // ── Step 4: iGOT Course Catalogue ───────────────────────────────────────
    await seedIGOTCourses(competencyRows);

    // ── Step 5: Demo Users (ADMIN + EMPLOYEE) ───────────────────────────────
    const { adminUser, employeeUsers } = await seedDemoUsers();

    // ── Step 6: Demo Officials (linked to employees + FRAC roles) ───────────
    const officials_ = await seedDemoOfficials(employeeUsers, roleRows, competencyRows);

    // ── Step 7: Demo Evidence ───────────────────────────────────────────────
    await seedDemoEvidence(officials_, competencyRows);

    // ── Step 8: Calculate & Seed Initial Skill Gaps ────────────────────────
    console.log('🌱 Calculating initial skill gaps for demo officials...');
    for (const off of officials_) {
      const [u] = await db.select({ userId: officials.userId }).from(officials).where(eq(officials.id, off.id));
      if (u?.userId) {
        await recalculateSkillGaps({ userId: u.userId, officialId: off.id, roleId: off.roleId }).catch((err) => {
          console.warn(`  ⚠️ Could not calculate initial skill gaps for official ${off.id}:`, err.message);
        });
      }
    }
    console.log('✅ Initial skill gaps calculated for demo officials.');

    console.log('\n🎉 ════════════════════════════════════════════════════');
    console.log('🎉  V2 Database seeding complete!');
    console.log('🎉  Admin: admin@nssta.gov.in / Admin@123!');
    console.log('🎉  Employee: rajesh.kumar@mospi.gov.in / Test@123!');
    console.log('🎉  Employee: priya.sharma@nsso.gov.in / Test@123!');
    console.log('🎉  Employee: amit.verma@mospi.gov.in / Test@123!');
    console.log('🎉 ════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Database seeding error:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error(error.stack);
    }
  }
}

// ── iGOT Course Seeder ─────────────────────────────────────────────────────

async function seedIGOTCourses(competencyRows = []) {
  console.log('🌱 Seeding iGOT course catalogue...');
  const courses = getAllMockCourses();
  let seeded = 0;

  for (const course of courses) {
    const rawRes = await db.execute(`
      INSERT INTO igot_courses (igot_identifier, name, description, content_type, subject, language, duration_seconds, organisation, status, pkg_version)
      VALUES (
        '${course.identifier}',
        '${course.name.replace(/'/g, "''")}',
        '${(course.description || '').replace(/'/g, "''")}',
        '${course.contentType}',
        '${JSON.stringify(course.subject || [])}'::jsonb,
        '${JSON.stringify(course.language || [])}'::jsonb,
        ${parseInt(course.duration) || 3600},
        '${(course.organisation || '').replace(/'/g, "''")}',
        '${course.status}',
        ${course.pkgVersion || 1}
      )
      ON CONFLICT (igot_identifier) DO NOTHING
      RETURNING id
    `).catch(() => null);

    const rows = rawRes?.rows || (Array.isArray(rawRes) ? rawRes : []);
    let courseDbId = rows?.[0]?.id;

    if (!courseDbId) {
      const existingRes = await db.execute(`SELECT id FROM igot_courses WHERE igot_identifier = '${course.identifier}'`).catch(() => null);
      const existingRows = existingRes?.rows || (Array.isArray(existingRes) ? existingRes : []);
      courseDbId = existingRows?.[0]?.id;
    }

    if (courseDbId) {
      seeded++;
      for (const compCode of (course.competencyCodes || [])) {
        const comp = (competencyRows || []).find(c => c.code === compCode);
        if (!comp) continue;
        await db.execute(`
          INSERT INTO igot_competency_map (igot_course_id, competency_id, relevance_score)
          VALUES ('${courseDbId}', '${comp.id}', 0.9)
          ON CONFLICT DO NOTHING
        `).catch(() => {});
      }
    }
  }

  console.log(`✅ Seeded ${seeded} iGOT courses`);
}

// ── Demo Users ─────────────────────────────────────────────────────────────

async function seedDemoUsers() {
  console.log('🌱 Seeding demo users (1 ADMIN + 3 EMPLOYEE)...');

  const adminHash = await bcrypt.hash('Admin@123!', 12);
  const empHash = await bcrypt.hash('Test@123!', 12);

  const demoUsersList = [
    {
      name: 'Dr. Sunita Rao',
      email: 'admin@nssta.gov.in',
      passwordHash: adminHash,
      platformRole: 'ADMIN',
      designation: 'Director (Capacity Building)',
      department: 'NSSTA, MoSPI',
      cadre: 'ISS',
    },
    {
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@mospi.gov.in',
      passwordHash: empHash,
      platformRole: 'EMPLOYEE',
      designation: 'Senior Statistical Officer',
      department: 'DIID, MoSPI',
      cadre: 'ISS',
    },
    {
      name: 'Ms. Priya Sharma',
      email: 'priya.sharma@nsso.gov.in',
      passwordHash: empHash,
      platformRole: 'EMPLOYEE',
      designation: 'Assistant Director (Surveys)',
      department: 'NSSO, MoSPI',
      cadre: 'ISS',
    },
    {
      name: 'Mr. Amit Verma',
      email: 'amit.verma@mospi.gov.in',
      passwordHash: empHash,
      platformRole: 'EMPLOYEE',
      designation: 'Statistical Analyst',
      department: 'DIID, MoSPI',
      cadre: 'SSS',
    },
  ];

  let adminUserRow = null;
  const employeeUsers = [];

  for (const u of demoUsersList) {
    const [existing] = await db.select().from(users).where(eq(users.email, u.email));
    let userRow = null;

    if (existing) {
      await db.update(users).set({
        passwordHash: u.passwordHash,
        platformRole: u.platformRole,
        name: u.name,
        designation: u.designation,
        department: u.department,
        cadre: u.cadre,
      }).where(eq(users.id, existing.id));
      userRow = { ...existing, ...u };
    } else {
      const [inserted] = await db.insert(users).values(u).returning();
      userRow = inserted;
    }

    if (u.platformRole === 'ADMIN') {
      adminUserRow = userRow;
    } else {
      employeeUsers.push(userRow);
    }
  }

  console.log(`✅ Seeded 1 ADMIN + ${employeeUsers.length} EMPLOYEE demo users`);
  return { adminUser: adminUserRow, employeeUsers };
}

// ── Demo Officials ─────────────────────────────────────────────────────────

async function seedDemoOfficials(employeeUsers, roleRows, competencyRows) {
  if (!employeeUsers.length || !roleRows.length) return [];
  console.log('🌱 Seeding demo officials...');

  const issSORole = roleRows.find(r => r.code === 'ISS_SO');
  const issADRole = roleRows.find(r => r.code === 'ISS_AD');
  const sssRole = roleRows.find(r => r.code === 'SSS_ANALYST');

  const [emp1, emp2, emp3] = employeeUsers;
  const officialDefs = [
    emp1 && issSORole ? { userId: emp1.id, roleId: issSORole.id, designation: 'Senior Statistical Officer', department: 'DIID, MoSPI', cadre: 'ISS', experienceYears: 8, education: 'Ph.D. Agricultural Statistics (IASRI)' } : null,
    emp2 && issADRole ? { userId: emp2.id, roleId: issADRole.id, designation: 'Assistant Director (Surveys)', department: 'NSSO, MoSPI', cadre: 'ISS', experienceYears: 5, education: 'M.Stat. (ISI Kolkata)' } : null,
    emp3 && sssRole ? { userId: emp3.id, roleId: sssRole.id, designation: 'Statistical Analyst', department: 'DIID, MoSPI', cadre: 'SSS', experienceYears: 3, education: 'B.Sc. Statistics (DU)' } : null,
  ].filter(Boolean);

  const inserted = [];
  for (const off of officialDefs) {
    const [existing] = await db.select().from(officials).where(eq(officials.userId, off.userId));
    let row = null;
    if (existing) {
      await db.update(officials).set(off).where(eq(officials.id, existing.id));
      row = { ...existing, ...off };
    } else {
      [row] = await db.insert(officials).values(off).returning();
    }
    if (row) inserted.push(row);
  }

  console.log(`✅ Seeded ${inserted.length} demo officials`);
  return inserted;
}

// ── Demo Evidence ──────────────────────────────────────────────────────────

async function seedDemoEvidence(officialRows, competencyRows) {
  if (!officialRows.length || !competencyRows.length) return;
  console.log('🌱 Seeding demo evidence...');

  const findComp = (code) => competencyRows.find(c => c.code === code);
  const [off1, off2, off3] = officialRows;

  const evidenceDefs = [];

  // Official 1: Rajesh (ISS SO) — good stats, critical gaps in Python/ML & Metadata
  if (off1) {
    const comps = [
      // SAMPLING_METHODS -> No gap (req 4.0, est 4.2)
      { code: 'SAMPLING_METHODS', type: 'KNOWLEDGE', score: 4.2, max: 5, weight: 0.4, conf: 0.90, prov: 'NSSTA Diagnostic Assessment 2025 (Batch #45)' },
      { code: 'SAMPLING_METHODS', type: 'APPLICATION', score: 4.2, max: 5, weight: 0.35, conf: 0.85, prov: 'Scenario Assessment: NSS 78th Round — Stratified Sampling Design' },

      // SURVEY_DESIGN -> No gap / Met (req 4.0, est 4.0)
      { code: 'SURVEY_DESIGN', type: 'KNOWLEDGE', score: 4.0, max: 5, weight: 0.4, conf: 0.90, prov: 'NSSTA Diagnostic Assessment 2025 — Survey Design' },
      { code: 'SURVEY_DESIGN', type: 'APPLICATION', score: 4.0, max: 5, weight: 0.35, conf: 0.88, prov: 'CAPI Field Questionnaire Validation Workshop 2024' },

      // ETHICS_INTEGRITY -> No gap (req 4.0, est 4.8)
      { code: 'ETHICS_INTEGRITY', type: 'KNOWLEDGE', score: 4.8, max: 5, weight: 0.4, conf: 0.95, prov: 'DoPT Ethics Course Completion — iGOT 2024' },
      { code: 'ETHICS_INTEGRITY', type: 'APPLICATION', score: 4.8, max: 5, weight: 0.35, conf: 0.92, prov: 'Official Statistics Code of Conduct Audit 2025' },

      // PYTHON_ANALYTICS -> CRITICAL GAP (req 4.0, est 1.4, severity 2.6)
      { code: 'PYTHON_ANALYTICS', type: 'KNOWLEDGE', score: 1.5, max: 5, weight: 0.4, conf: 0.80, prov: 'NSSTA Diagnostic Assessment 2025 — Python Module' },
      { code: 'PYTHON_ANALYTICS', type: 'APPLICATION', score: 1.2, max: 5, weight: 0.35, conf: 0.75, prov: 'Hands-on Virtual Lab: Pandas Data Cleaning Exercise' },

      // METADATA_STANDARDS -> CRITICAL GAP (req 4.0, est 1.6, severity 2.4)
      { code: 'METADATA_STANDARDS', type: 'KNOWLEDGE', score: 1.8, max: 5, weight: 0.4, conf: 0.82, prov: 'SDMX & Metadata Standards Self-Assessment 2025' },
      { code: 'METADATA_STANDARDS', type: 'APPLICATION', score: 1.4, max: 5, weight: 0.35, conf: 0.78, prov: 'National Data Warehouse Metadata Cataloguing Workshop' },

      // SQL_DATABASE -> HIGH GAP (req 4.0, est 2.2, severity 1.8)
      { code: 'SQL_DATABASE', type: 'KNOWLEDGE', score: 2.4, max: 5, weight: 0.4, conf: 0.80, prov: 'Database Queries Self-Assessment 2025' },
      { code: 'SQL_DATABASE', type: 'APPLICATION', score: 2.0, max: 5, weight: 0.35, conf: 0.75, prov: 'PostgreSQL Relational Queries Lab — NSS Raw Data' },

      // STATA_SPSS -> HIGH GAP (req 3.0, est 1.8, severity 1.2)
      { code: 'STATA_SPSS', type: 'KNOWLEDGE', score: 2.0, max: 5, weight: 0.4, conf: 0.80, prov: 'Stata Syntax & Tabulation Quiz 2025' },
      { code: 'STATA_SPSS', type: 'APPLICATION', score: 1.6, max: 5, weight: 0.35, conf: 0.75, prov: 'PLFS Microdata Processing Exercise in Stata' },

      // SDG_INDICATORS -> HIGH GAP (req 3.0, est 1.9, severity 1.1)
      { code: 'SDG_INDICATORS', type: 'KNOWLEDGE', score: 2.0, max: 5, weight: 0.4, conf: 0.82, prov: 'MoSPI National Indicator Framework (NIF) Quiz 2025' },
      { code: 'SDG_INDICATORS', type: 'APPLICATION', score: 1.8, max: 5, weight: 0.35, conf: 0.78, prov: 'SDG Goal 8 Labour Data Mapping Workshop' },

      // NATIONAL_ACCOUNTS -> MEDIUM GAP (req 3.0, est 2.4, severity 0.6)
      { code: 'NATIONAL_ACCOUNTS', type: 'KNOWLEDGE', score: 2.6, max: 5, weight: 0.4, conf: 0.80, prov: 'Self-Assessment Quiz — NAS Module 2025' },
      { code: 'NATIONAL_ACCOUNTS', type: 'APPLICATION', score: 2.2, max: 5, weight: 0.35, conf: 0.75, prov: 'Sectoral GVA Deflation Workshop — NAD MoSPI' },

      // COMMUNICATION -> LOW GAP (req 3.0, est 2.6, severity 0.4)
      { code: 'COMMUNICATION', type: 'KNOWLEDGE', score: 2.6, max: 5, weight: 0.4, conf: 0.80, prov: 'NSSTA Data Storytelling Assessment 2025' },

      // DATA_QUALITY -> Need Assessment / Insufficient Evidence (1 item)
      { code: 'DATA_QUALITY', type: 'APPLICATION', score: 3.2, max: 5, weight: 0.35, conf: 0.50, prov: 'SQAF Self-Assessment Audit 2025' },

      // DATA_VISUALIZATION -> Need Assessment / Insufficient Evidence (1 item)
      { code: 'DATA_VISUALIZATION', type: 'KNOWLEDGE', score: 2.8, max: 5, weight: 0.3, conf: 0.45, prov: 'PowerBI Dashboards Introductory Quiz' },
    ];
    for (const c of comps) {
      const comp = findComp(c.code);
      if (comp) evidenceDefs.push({ officialId: off1.id, competencyId: comp.id, evidenceType: c.type, score: c.score, maxScore: c.max, weight: c.weight, confidence: c.conf, provenance: c.prov });
    }
  }

  // Official 2: Priya (ISS AD) — strong leadership/surveys, gap in digital/tech
  if (off2) {
    const comps = [
      { code: 'SAMPLING_METHODS', type: 'APPLICATION', score: 4.2, max: 5, weight: 0.4, conf: 0.90, prov: 'NSSTA IST-2024-003 Course Completion + Assessment' },
      { code: 'LABOUR_STATISTICS', type: 'KNOWLEDGE', score: 3.5, max: 5, weight: 0.35, conf: 0.82, prov: 'PLFS Round 2024 — Field Supervision Assessment' },
      { code: 'COMMUNICATION', type: 'APPLICATION', score: 4.0, max: 5, weight: 0.4, conf: 0.88, prov: 'Presentation Assessment — NSSTA Leadership Programme' },
      { code: 'PYTHON_ANALYTICS', type: 'KNOWLEDGE', score: 0.8, max: 5, weight: 0.2, conf: 0.45, prov: 'Self-declared — no formal assessment taken' },
      { code: 'SQL_DATABASE', type: 'KNOWLEDGE', score: 1.2, max: 5, weight: 0.2, conf: 0.40, prov: 'Self-declared — basic exposure only' },
      { code: 'ETHICS_INTEGRITY', type: 'KNOWLEDGE', score: 4.8, max: 5, weight: 0.4, conf: 0.96, prov: 'DoPT Ethics Course — iGOT 2023 Completion' },
    ];
    for (const c of comps) {
      const comp = findComp(c.code);
      if (comp) evidenceDefs.push({ officialId: off2.id, competencyId: comp.id, evidenceType: c.type, score: c.score, maxScore: c.max, weight: c.weight, confidence: c.conf, provenance: c.prov });
    }
  }

  // Official 3: Amit (SSS Analyst) — junior, broad gaps
  if (off3) {
    const comps = [
      { code: 'DATA_QUALITY', type: 'KNOWLEDGE', score: 2.5, max: 5, weight: 0.3, conf: 0.65, prov: 'In-house NSSO training assessment 2025' },
      { code: 'SQL_DATABASE', type: 'KNOWLEDGE', score: 1.8, max: 5, weight: 0.25, conf: 0.55, prov: 'Online self-assessment quiz' },
      { code: 'ETHICS_INTEGRITY', type: 'KNOWLEDGE', score: 3.2, max: 5, weight: 0.35, conf: 0.78, prov: 'DoPT Induction Training — Ethics Module 2023' },
    ];
    for (const c of comps) {
      const comp = findComp(c.code);
      if (comp) evidenceDefs.push({ officialId: off3.id, competencyId: comp.id, evidenceType: c.type, score: c.score, maxScore: c.max, weight: c.weight, confidence: c.conf, provenance: c.prov });
    }
  }

  if (evidenceDefs.length) {
    await db.insert(evidence).values(evidenceDefs).onConflictDoNothing();
    console.log(`✅ Seeded ${evidenceDefs.length} demo evidence records`);
  }
}
