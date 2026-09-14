import api from "./api.js";

export async function listSkillGaps({ officialId, category, priority } = {}) {
  const params = { officialId, category, priority };
  const { data } = await api.get("/skill-gaps", { params });
  return data.gaps;
}

export async function getSkillGap(gapId) {
  const { data } = await api.get(`/skill-gaps/${gapId}`);
  return data.gap;
}

export async function getEligibleRoles() {
  const { data } = await api.get('/roles/eligible');
  return data.data;
}

export async function selectTargetRole(targetRoleId) {
  const { data } = await api.put('/roles/target', { targetRoleId });
  return data.data;
}

export async function recalculateSkillGaps(targetRoleId, officialId) {
  const { data } = await api.post('/skill-gaps/recalculate', { roleId: targetRoleId, officialId });
  return data.gaps;
}
