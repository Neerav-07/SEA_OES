import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import {
  roles,
  roleCompetencies,
  competencies,
} from "../../db/schema/index.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { officials } from '../../db/schema/index.js';
import { getEligibleRoles, isEligibleTargetRole } from '../../utils/roleEligibility.js';

/**
 * Get all official roles with required competency profiles
 */
export const getRoles = asyncHandler(async (req, res) => {
  const allRoles = await db.select().from(roles);
  const allRoleComps = await db.select().from(roleCompetencies);
  const allComps = await db.select().from(competencies);

  const mappedRoles = allRoles.map((role) => {
    const reqs = allRoleComps
      .filter((rc) => rc.roleId === role.id)
      .map((rc) => {
        const comp = allComps.find((c) => c.id === rc.competencyId);
        return {
          id: rc.id,
          competencyId: rc.competencyId,
          competencyCode: comp?.code || "UNKNOWN",
          competencyName: comp?.name || "Unknown Competency",
          category: comp?.category || "General",
          requiredLevel: rc.requiredLevel,
          priority: rc.priority,
          isMandatory: rc.isMandatory,
        };
      });

    return {
      ...role,
      requirements: reqs,
    };
  });

  return sendSuccess(res, mappedRoles, "Roles retrieved successfully");
});

export const getEligibleRolesController = asyncHandler(async (req, res) => {
  const [official] = await db.select().from(officials).where(eq(officials.userId, req.auth.userId));
  if (!official) return sendSuccess(res, { roles: [], limitation: 'Official profile is required before target roles can be resolved.' });
  const allRoles = await db.select().from(roles);
  const eligible = getEligibleRoles({ official, roles: allRoles });
  return sendSuccess(res, { roles: eligible, targetRoleId: official.targetRoleId || official.roleId, limitation: eligible.length ? null : 'No roles can be derived from the recorded organisational context.' });
});

export const selectTargetRole = asyncHandler(async (req, res) => {
  const { targetRoleId } = req.body || {};
  if (!targetRoleId) return sendError(res, 'targetRoleId is required.', 400);
  const [official] = await db.select().from(officials).where(eq(officials.userId, req.auth.userId));
  if (!official) return sendError(res, 'Official profile not found.', 404);
  const allRoles = await db.select().from(roles);
  if (!isEligibleTargetRole({ official, roles: allRoles, targetRoleId })) return sendError(res, 'Target role is not eligible for this official context.', 403);
  const [updated] = await db.update(officials).set({ targetRoleId, updatedAt: new Date() }).where(eq(officials.id, official.id)).returning();
  return sendSuccess(res, { official: updated, targetRoleId }, 'Target role selected.');
});

/**
 * Get role requirements by role ID
 */
export const getRoleRequirements = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  const [role] = await db.select().from(roles).where(eq(roles.id, roleId));

  if (!role) {
    return sendError(res, "Role not found", 404);
  }

  const reqs = await db
    .select()
    .from(roleCompetencies)
    .where(eq(roleCompetencies.roleId, roleId));
  const allComps = await db.select().from(competencies);

  const mappedReqs = reqs.map((rc) => {
    const comp = allComps.find((c) => c.id === rc.competencyId);
    return {
      id: rc.id,
      competencyId: rc.competencyId,
      competencyCode: comp?.code,
      competencyName: comp?.name,
      category: comp?.category,
      requiredLevel: rc.requiredLevel,
      priority: rc.priority,
      isMandatory: rc.isMandatory,
    };
  });

  return sendSuccess(
    res,
    { role, requirements: mappedReqs },
    "Role requirements retrieved",
  );
});
