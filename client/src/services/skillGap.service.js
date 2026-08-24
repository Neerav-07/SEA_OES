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
