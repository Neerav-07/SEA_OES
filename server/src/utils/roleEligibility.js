/**
 * Deterministic, data-backed target-role eligibility policy.
 *
 * The current FRAC model contains no grade/pay-level or promotion-path fields.
 * Consequently this policy only uses facts persisted for an official: their
 * current role and department.  The current role is always selectable; roles
 * in the same department are selectable.  Cadre/designation are intentionally
 * not guessed from free text until the role model contains explicit mappings.
 */
export function getEligibleRoles({ official, roles = [] } = {}) {
  if (!official || !Array.isArray(roles)) return [];
  const department = String(official.department || '').trim().toLowerCase();
  return roles
    .filter((role) => role && (role.id === official.roleId ||
      (department && String(role.department || '').trim().toLowerCase() === department)))
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));
}

export function isEligibleTargetRole({ official, roles, targetRoleId } = {}) {
  return getEligibleRoles({ official, roles }).some((role) => role.id === targetRoleId);
}
