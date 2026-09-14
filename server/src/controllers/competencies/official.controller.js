import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import {
  officials,
  users,
  roles,
  evidence,
  competencies,
  roleCompetencies,
} from "../../db/schema/index.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * Get all official profiles with user details & current role
 */
export const getOfficials = asyncHandler(async (req, res) => {
  const allOfficials = await db.select().from(officials);
  const allUsers = await db.select().from(users);
  const allRoles = await db.select().from(roles);

  const result = allOfficials.map((off) => {
    const user = allUsers.find((u) => u.id === off.userId);
    const role = allRoles.find((r) => r.id === off.roleId);
    return {
      ...off,
      userName: user?.name || "Official User",
      userEmail: user?.email || "",
      roleTitle: role?.title || "Unassigned Role",
      roleCode: role?.code || "",
    };
  });

  return sendSuccess(res, result, "Officials retrieved successfully");
});

/**
 * Get detailed official profile by ID (with evidence & calculated competency profile)
 */
export const getOfficialProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [off] = await db.select().from(officials).where(eq(officials.id, id));

  if (!off) {
    return sendError(res, "Official profile not found", 404);
  }

  // IDOR & RBAC Protection: Non-admin users can only view their own official profile
  if (req.auth?.platformRole !== 'ADMIN' && off.userId !== req.auth?.userId) {
    return sendError(res, "Access denied. You may only view your own official profile.", 403);
  }

  const [user] = await db.select().from(users).where(eq(users.id, off.userId));
  const [role] = off.roleId
    ? await db.select().from(roles).where(eq(roles.id, off.roleId))
    : [];
  const offEvidence = await db
    .select()
    .from(evidence)
    .where(eq(evidence.officialId, off.id));
  const allComps = await db.select().from(competencies);
  const reqs = role
    ? await db
        .select()
        .from(roleCompetencies)
        .where(eq(roleCompetencies.roleId, role.id))
    : [];

  // Calculate Competency Estimates & Gaps
  const competencyProfile = allComps.map((comp) => {
    const compEv = offEvidence.filter((e) => e.competencyId === comp.id);
    const roleReq = reqs.find((r) => r.competencyId === comp.id);

    // Weighted evidence fusion score calculation
    let totalScoreWeight = 0;
    let totalWeight = 0;
    let avgConfidence = 0;

    if (compEv.length > 0) {
      compEv.forEach((e) => {
        totalScoreWeight += e.score * e.weight;
        totalWeight += e.weight;
        avgConfidence += e.confidence;
      });
      avgConfidence = Math.round((avgConfidence / compEv.length) * 100);
    }

    const estimatedLevel =
      totalWeight > 0
        ? Number((totalScoreWeight / totalWeight).toFixed(1))
        : 1.0;
    const requiredLevel = roleReq ? roleReq.requiredLevel : 3.0;
    const gap = Number(Math.max(0, requiredLevel - estimatedLevel).toFixed(1));

    return {
      competencyId: comp.id,
      code: comp.code,
      name: comp.name,
      category: comp.category,
      requiredLevel,
      estimatedLevel,
      gap,
      confidencePct: avgConfidence > 0 ? avgConfidence : 45,
      priority: roleReq ? roleReq.priority : "MEDIUM",
      isMandatory: roleReq ? roleReq.isMandatory : false,
      evidenceCount: compEv.length,
      evidenceItems: compEv,
    };
  });

  return sendSuccess(
    res,
    {
      official: {
        ...off,
        userName: user?.name,
        userEmail: user?.email,
        roleTitle: role?.title || "Unassigned Role",
        roleCode: role?.code,
      },
      competencyProfile,
    },
    "Official profile retrieved",
  );
});

/**
 * Assign or Change Official Role (Triggers gap recalculation without deleting evidence history)
 */
export const updateOfficialRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body || {};

  // RBAC Protection: Only ADMIN can assign official FRAC roles
  if (req.auth?.platformRole !== 'ADMIN') {
    return sendError(res, "Access denied. Only administrators can assign official FRAC roles.", 403);
  }

  const [off] = await db.select().from(officials).where(eq(officials.id, id));
  if (!off) {
    return sendError(res, "Official not found", 404);
  }

  const [role] = await db.select().from(roles).where(eq(roles.id, roleId));

  if (!role) {
    return sendError(res, "Role not found", 404);
  }

  await db
    .update(officials)
    .set({ roleId, updatedAt: new Date() })
    .where(eq(officials.id, id));

  return sendSuccess(
    res,
    { officialId: id, newRoleId: roleId, newRoleTitle: role.title },
    "Role updated and gaps recalculated",
  );
});

/**
 * Update authenticated official profile (Designation, Department, Cadre, Experience, Education)
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const { designation, department, cadre, experienceYears, education, preferredLanguage } = req.body || {};

  let [off] = await db.select().from(officials).where(eq(officials.userId, userId));
  if (!off) {
    [off] = await db.insert(officials).values({
      userId,
      designation: designation || 'Senior Statistical Officer',
      department: department || 'MoSPI DIID Headquarters',
      cadre: cadre || 'ISS (Indian Statistical Service)',
      experienceYears: Number(experienceYears) || 3,
      education: education || 'M.Sc. in Statistics',
      preferredLanguage: preferredLanguage || 'en',
    }).returning();
  } else {
    [off] = await db.update(officials).set({
      designation: designation !== undefined ? designation : off.designation,
      department: department !== undefined ? department : off.department,
      cadre: cadre !== undefined ? cadre : off.cadre,
      experienceYears: experienceYears !== undefined ? Number(experienceYears) : off.experienceYears,
      education: education !== undefined ? education : off.education,
      preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : off.preferredLanguage,
      updatedAt: new Date(),
    }).where(eq(officials.id, off.id)).returning();
  }

  await db.update(users).set({
    designation: off.designation,
    department: off.department,
    cadre: off.cadre,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  return sendSuccess(res, off, 'Official service profile updated successfully');
});

/**
 * Get authenticated official profile (Name, Role, Cadre, Department, Experience, Education)
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const [off] = await db.select().from(officials).where(eq(officials.userId, userId));
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  let role = null;
  if (off?.roleId) {
    const [r] = await db.select().from(roles).where(eq(roles.id, off.roleId));
    role = r;
  }

  const profile = {
    id: off?.id || null,
    userId: user.id,
    userName: user.name || 'Official User',
    userEmail: user.email,
    designation: off?.designation || user.designation || 'Senior Statistical Officer',
    department: off?.department || user.department || 'MoSPI DIID Headquarters',
    cadre: off?.cadre || user.cadre || 'ISS (Indian Statistical Service)',
    experienceYears: off?.experienceYears ?? 4,
    education: off?.education || 'M.Sc. in Statistics',
    roleId: off?.roleId || role?.id || null,
    roleTitle: role?.title || 'Statistical Officer (SO)',
    roleCode: role?.code || 'STAT_OFFICER',
    preferredLanguage: off?.preferredLanguage || 'en',
  };

  return sendSuccess(res, profile, 'Official service profile retrieved successfully');
});


