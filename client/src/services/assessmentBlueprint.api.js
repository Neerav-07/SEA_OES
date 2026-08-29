import api from './api.js';

export async function listAssessmentBlueprints(params = {}) {
  const { data } = await api.get('/assessment-blueprints', { params });
  return data;
}

export async function listOfficialAssessments() {
  const { data } = await api.get('/assessments');
  return data?.data || data?.items || data || [];
}

export async function getOfficialAssessment(id) {
  const { data } = await api.get(`/assessments/${id}`);
  return data?.data || data;
}

export async function getAssessmentBlueprint(id) {
  const { data } = await api.get(`/assessment-blueprints/${id}`);
  return data;
}

export async function createAssessmentBlueprint(payload) {
  const { data } = await api.post('/assessment-blueprints', payload);
  return data;
}

export async function updateAssessmentBlueprint(id, payload) {
  const { data } = await api.patch(`/assessment-blueprints/${id}`, payload);
  return data;
}

export async function validateAssessmentBlueprint(id) {
  const { data } = await api.post(`/assessment-blueprints/${id}/validate`);
  return data;
}

export async function listBlueprintCompetencies() {
  const { data } = await api.get('/assessment-blueprints/lookup/competencies');
  return data;
}

export async function listBlueprintClaims(competencyId) {
  const { data } = await api.get(`/assessment-blueprints/lookup/competencies/${competencyId}/claims`);
  return data;
}

export async function listBlueprintLearningObjectives(competencyId) {
  const { data } = await api.get(`/assessment-blueprints/lookup/competencies/${competencyId}/learning-objectives`);
  return data;
}
