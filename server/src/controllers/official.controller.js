import { db } from '../db/index.js';
import { officials, users, roles, evidence, competencies, roleCompetencies } from '../db/schema/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
      userName: user?.name || 'Official User',
      userEmail: user?.email || '',
      roleTitle: role?.title || 'Unassigned Role',
      roleCode: role?.code || '',
    };
  });

  return sendSuccess(res, result, 'Officials retrieved successfully');
});

/**
 * Get detailed official profile by ID (with evidence & calculated competency profile)
 */
export const getOfficialProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [off] = await db.select().from(officials).where(officials.id.equals(id));

  if (!off) {
    return sendError(res, 'Official profile not found', 404);
  }

  const [user] = await db.select().from(users).where(users.id.equals(off.userId));
  const [role] = off.roleId ? await db.select().from(roles).where(roles.id.equals(off.roleId)) : [];
  const offEvidence = await db.select().from(evidence).where(evidence.officialId.equals(off.id));
  const allComps = await db.select().from(competencies);
  const reqs = role ? await db.select().from(roleCompetencies).where(roleCompetencies.roleId.equals(role.id)) : [];

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

    const estimatedLevel = totalWeight > 0 ? Number((totalScoreWeight / totalWeight).toFixed(1)) : 1.0;
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
      priority: roleReq ? roleReq.priority : 'MEDIUM',
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
        roleTitle: role?.title || 'Unassigned Role',
        roleCode: role?.code,
      },
      competencyProfile,
    },
    'Official profile retrieved'
  );
});

/**
 * Assign or Change Official Role (Triggers gap recalculation without deleting evidence history)
 */
export const updateOfficialRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  const [off] = await db.select().from(officials).where(officials.id.equals(id));
  if (!off) {
    return sendError(res, 'Official not found', 404);
  }

  const [role] = await db.select().from(roles).where(roles.id.equals(roleId));
  if (!role) {
    return sendError(res, 'Role not found', 404);
  }

  await db
    .update(officials)
    .set({ roleId, updatedAt: new Date() })
    .where(officials.id.equals(id));

  return sendSuccess(res, { officialId: id, newRoleId: roleId, newRoleTitle: role.title }, 'Role updated and gaps recalculated');
});
