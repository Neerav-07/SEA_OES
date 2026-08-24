import { and, eq } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  competencies,
  competencyEstimates,
  competencyRequirements,
  officials,
  learningObjectives,
  roles,
  subCompetencies,
  subCompetencyEstimates,
} from "../db/schema/index.js";
import { recalculateSkillGaps } from "./skillGap.service.js";

const COMPETENCY_SEED = [
  {
    code: "SURVEY_SAMPLING",
    name: "Survey Design and Sampling",
    category: "Statistical",
    description:
      "Design representative surveys and select appropriate sampling methods.",
    requiredLevel: 4,
    priority: 5,
    urgency: 5,
    mandatory: true,
    subCompetencies: [
      {
        code: "SAMPLING_DESIGN",
        name: "Sampling design",
        objectives: [
          "Select an appropriate sampling method",
          "Evaluate sampling bias",
        ],
      },
      {
        code: "SURVEY_QUALITY",
        name: "Survey quality",
        objectives: ["Define survey quality indicators"],
      },
    ],
  },
  {
    code: "STATISTICAL_ANALYSIS",
    name: "Statistical Analysis",
    category: "Statistical",
    description:
      "Interpret statistical outputs and support evidence-based official statistics.",
    requiredLevel: 4,
    priority: 4,
    urgency: 4,
    mandatory: true,
    subCompetencies: [
      {
        code: "DATA_INTERPRETATION",
        name: "Data interpretation",
        objectives: ["Interpret distributions and summary measures"],
      },
      {
        code: "REGRESSION",
        name: "Regression analysis",
        objectives: ["Interpret regression output"],
      },
    ],
  },
  {
    code: "PYTHON_DATA",
    name: "Python and Data Analysis",
    category: "Technical",
    description:
      "Use Python and reproducible data workflows for statistical analysis.",
    requiredLevel: 3,
    priority: 4,
    urgency: 3,
    mandatory: false,
    subCompetencies: [
      {
        code: "PYTHON_FOUNDATIONS",
        name: "Python foundations",
        objectives: ["Write reusable Python data-processing code"],
      },
      {
        code: "DATA_CLEANING",
        name: "Data cleaning",
        objectives: ["Clean and validate an official statistics dataset"],
      },
    ],
  },
  {
    code: "DATA_PRIVACY",
    name: "Data Privacy and Cybersecurity",
    category: "Digital Governance",
    description:
      "Apply privacy, access-control, and secure data-handling principles.",
    requiredLevel: 3,
    priority: 5,
    urgency: 5,
    mandatory: true,
    subCompetencies: [
      {
        code: "PRIVACY_CONTROLS",
        name: "Privacy controls",
        objectives: ["Apply data minimisation and purpose limitation"],
      },
    ],
  },
  {
    code: "SQL_DATA",
    name: "SQL and Data Management",
    category: "Technical",
    description: "Query, validate, and manage statistical data using SQL.",
    requiredLevel: 3,
    priority: 4,
    urgency: 3,
    mandatory: false,
    subCompetencies: [
      {
        code: "SQL_QUERYING",
        name: "SQL querying",
        objectives: ["Write queries for statistical data extraction"],
      },
    ],
  },
  {
    code: "GIS_VISUALIZATION",
    name: "GIS and Data Visualization",
    category: "Technical",
    description:
      "Communicate statistical patterns with maps and visualisations.",
    requiredLevel: 2,
    priority: 3,
    urgency: 2,
    mandatory: false,
    subCompetencies: [
      {
        code: "DATA_VISUALIZATION",
        name: "Data visualization",
        objectives: ["Choose an appropriate chart for an official indicator"],
      },
    ],
  },
  {
    code: "CLOUD_APIS",
    name: "Cloud Computing and APIs",
    category: "Technical",
    description:
      "Use secure APIs and cloud services for interoperable data workflows.",
    requiredLevel: 2,
    priority: 3,
    urgency: 2,
    mandatory: false,
    subCompetencies: [
      {
        code: "API_INTEGRATION",
        name: "API integration",
        objectives: ["Consume a versioned API with secure credentials"],
      },
    ],
  },
];

const ROLE_SEED = [
  {
    code: "STATISTICAL_OFFICER",
    title: "Statistical Officer",
    designation: "Statistical Officer",
    department: "MoSPI DIID",
    cadre: "ISS",
    requirements: {
      SURVEY_SAMPLING: 4,
      STATISTICAL_ANALYSIS: 4,
      PYTHON_DATA: 3,
      DATA_PRIVACY: 3,
      SQL_DATA: 3,
      GIS_VISUALIZATION: 2,
      CLOUD_APIS: 2,
    },
  },
  {
    code: "DATA_ANALYST",
    title: "Official Statistics Data Analyst",
    designation: "Data Analyst",
    department: "MoSPI Data Informatics",
    cadre: "SSS",
    requirements: {
      SURVEY_SAMPLING: 2,
      STATISTICAL_ANALYSIS: 4,
      PYTHON_DATA: 4,
      DATA_PRIVACY: 3,
      SQL_DATA: 4,
      GIS_VISUALIZATION: 3,
      CLOUD_APIS: 3,
    },
  },
  {
    code: "SURVEY_SUPERVISOR",
    title: "Survey Programme Supervisor",
    designation: "Survey Supervisor",
    department: "MoSPI Field Operations",
    cadre: "Field Operations",
    requirements: {
      SURVEY_SAMPLING: 4,
      STATISTICAL_ANALYSIS: 3,
      PYTHON_DATA: 2,
      DATA_PRIVACY: 4,
      SQL_DATA: 2,
      GIS_VISUALIZATION: 2,
      CLOUD_APIS: 1,
    },
  },
];

const PROFILE_ESTIMATES = {
  "Statistical Officer": {
    SURVEY_SAMPLING: 2,
    STATISTICAL_ANALYSIS: 2,
    PYTHON_DATA: 2,
    DATA_PRIVACY: 3,
    SQL_DATA: 2,
    GIS_VISUALIZATION: 1,
    CLOUD_APIS: 1,
  },
  "Data Analyst": {
    SURVEY_SAMPLING: 2,
    STATISTICAL_ANALYSIS: 3,
    PYTHON_DATA: 3,
    DATA_PRIVACY: 2,
    SQL_DATA: 3,
    GIS_VISUALIZATION: 2,
    CLOUD_APIS: 2,
  },
  "Survey Supervisor": {
    SURVEY_SAMPLING: 3,
    STATISTICAL_ANALYSIS: 2,
    PYTHON_DATA: 1,
    DATA_PRIVACY: 3,
    SQL_DATA: 1,
    GIS_VISUALIZATION: 1,
    CLOUD_APIS: 1,
  },
};

async function upsertBy(db, table, conflictTarget, values) {
  const [row] = await db
    .insert(table)
    .values(values)
    .onConflictDoUpdate({ target: conflictTarget, set: values })
    .returning();
  return row;
}

async function updateOrInsert(db, table, conditions, values) {
  const [existing] = await db
    .select()
    .from(table)
    .where(and(...conditions));
  if (existing) {
    const [updated] = await db
      .update(table)
      .set(values)
      .where(eq(table.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db.insert(table).values(values).returning();
  return created;
}

export async function seedModule3DemoData({ userId }) {
  const db = getDb();
  const seededRoles = [];
  const seededOfficials = [];
  for (const roleSeed of ROLE_SEED) {
    const [role] = await db
      .insert(roles)
      .values({
        code: roleSeed.code,
        title: roleSeed.title,
        department: roleSeed.department,
        description: "Official Statistics role for PS 26101 demo workflows.",
      })
      .onConflictDoUpdate({
        target: roles.code,
        set: {
          title: roleSeed.title,
          department: roleSeed.department,
          description: "Official Statistics role for PS 26101 demo workflows.",
          updatedAt: new Date(),
        },
      })
      .returning();
    seededRoles.push(role);

    let [official] = await db
      .select()
      .from(officials)
      .where(
        and(
          eq(officials.userId, userId),
          eq(officials.designation, roleSeed.designation),
        ),
      );
    if (!official) {
      [official] = await db
        .insert(officials)
        .values({
          userId,
          roleId: role.id,
          designation: roleSeed.designation,
          department: roleSeed.department,
          cadre: roleSeed.cadre,
          experienceYears: roleSeed.code === "DATA_ANALYST" ? 3 : 4,
          education: "Statistics / Data Science",
          preferredLanguage: "en",
        })
        .returning();
    } else {
      [official] = await db
        .update(officials)
        .set({ roleId: role.id, updatedAt: new Date() })
        .where(eq(officials.id, official.id))
        .returning();
    }
    seededOfficials.push({ ...official, roleId: role.id });
  }

  const seededCompetencies = [];
  for (const seed of COMPETENCY_SEED) {
    const competency = await upsertBy(db, competencies, competencies.code, {
      code: seed.code,
      name: seed.name,
      category: seed.category,
      description: seed.description,
      updatedAt: new Date(),
    });
    seededCompetencies.push(competency);

    for (const subSeed of seed.subCompetencies) {
      const subCompetency = await updateOrInsert(
        db,
        subCompetencies,
        [
          eq(subCompetencies.competencyId, competency.id),
          eq(subCompetencies.code, subSeed.code),
        ],
        {
          competencyId: competency.id,
          code: subSeed.code,
          name: subSeed.name,
        },
      );
      for (const [index, title] of subSeed.objectives.entries()) {
        await updateOrInsert(
          db,
          learningObjectives,
          [
            eq(learningObjectives.subCompetencyId, subCompetency.id),
            eq(learningObjectives.code, `${subSeed.code}_LO_${index + 1}`),
          ],
          {
            subCompetencyId: subCompetency.id,
            code: `${subSeed.code}_LO_${index + 1}`,
            title,
          },
        );
      }
    }

    for (const roleSeed of ROLE_SEED) {
      const role = seededRoles.find((item) => item.code === roleSeed.code);
      const requiredLevel =
        roleSeed.requirements[seed.code] ?? seed.requiredLevel;
      await upsertBy(
        db,
        competencyRequirements,
        [
          competencyRequirements.roleId,
          competencyRequirements.competencyId,
          competencyRequirements.frameworkVersion,
        ],
        {
          roleId: role.id,
          competencyId: competency.id,
          requiredLevel,
          priority: requiredLevel >= 4 ? 5 : seed.priority,
          urgency: requiredLevel >= 4 ? 4 : seed.urgency,
          mandatory: requiredLevel >= 4 || seed.mandatory,
          frameworkVersion: "mospi-demo-v1",
          sourceReference:
            "PS 26101 / MoSPI Official Statistics competency demo",
          updatedAt: new Date(),
        },
      );
    }
  }

  for (const profile of seededOfficials) {
    const profileLevels = PROFILE_ESTIMATES[profile.designation];
    for (const seed of COMPETENCY_SEED) {
      const competency = seededCompetencies.find(
        (item) => item.code === seed.code,
      );
      const proficiencyLevel = profileLevels[seed.code] ?? 1;
      const evidenceSufficiency =
        seed.code === "STATISTICAL_ANALYSIS" &&
        profile.designation === "Survey Supervisor"
          ? 0.38
          : proficiencyLevel >= 3
            ? 0.9
            : 0.72;
      await upsertBy(
        db,
        competencyEstimates,
        [competencyEstimates.officialId, competencyEstimates.competencyId],
        {
          officialId: profile.id,
          competencyId: competency.id,
          masteryScore: proficiencyLevel / 5,
          proficiencyLevel,
          proficiencyLabel: proficiencyLevel >= 3 ? "WORKING" : "BASIC",
          evidenceSufficiency,
          sufficiencyBreakdown: {
            coverage: evidenceSufficiency,
            volume: evidenceSufficiency,
            diversity: evidenceSufficiency < 0.5 ? 0.2 : 0.7,
            recency: 0.8,
            consistency: 0.75,
            assessmentQuality: 0.8,
          },
          evidenceSnapshot: {
            source: "Module 3 demo seed",
            evidenceTypes: ["DIAGNOSTIC", "SCENARIO"],
          },
          updatedAt: new Date(),
        },
      );

      const relatedSubCompetencies = await db
        .select()
        .from(subCompetencies)
        .where(eq(subCompetencies.competencyId, competency.id));
      for (const [index, subCompetency] of relatedSubCompetencies.entries()) {
        const subLevel = Math.max(
          1,
          Math.min(
            5,
            proficiencyLevel -
              (index === relatedSubCompetencies.length - 1 ? 1 : 0),
          ),
        );
        await upsertBy(
          db,
          subCompetencyEstimates,
          [
            subCompetencyEstimates.officialId,
            subCompetencyEstimates.subCompetencyId,
          ],
          {
            officialId: profile.id,
            subCompetencyId: subCompetency.id,
            masteryScore: subLevel / 5,
            proficiencyLevel: subLevel,
            evidenceSufficiency: subLevel <= 1 ? 0.45 : 0.75,
            evidenceSnapshot: { source: "Module 3 demo seed" },
            updatedAt: new Date(),
          },
        );
      }
    }
  }

  const gaps = [];
  for (const profile of seededOfficials) {
    gaps.push(
      ...(await recalculateSkillGaps({
        userId,
        officialId: profile.id,
        roleId: profile.roleId,
      })),
    );
  }
  return {
    roles: seededRoles,
    officials: seededOfficials,
    competencies: seededCompetencies,
    gaps,
  };
}
