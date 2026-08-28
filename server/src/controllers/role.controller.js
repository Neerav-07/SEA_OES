import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { roles, roleCompetencies, competencies } from "../db/schema/index.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
