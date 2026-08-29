import api from './api.js';

export async function listSources(search = '') {
  const { data } = await api.get('/sources', { params: search ? { search } : {} });
  return data;
}

export async function createSource(payload) {
  const { data } = await api.post('/sources', payload);
  return data;
}

export async function getSource(sourceId) {
  const { data } = await api.get(`/sources/${sourceId}`);
  return data;
}

export async function deleteSource(sourceId) {
  const { data } = await api.delete(`/sources/${sourceId}`);
  return data;
}

export async function generateAssessmentFromSource(sourceId, payload = {}) {
  const { data } = await api.post(`/sources/${sourceId}/generate-assessment`, payload);
  return data;
}

export async function publishAssessment(assessmentId) {
  const { data } = await api.post(`/sources/assessments/${assessmentId}/publish`);
  return data;
}

export async function ingestSource(sourceId, payload) {
  const { data } = await api.post(`/sources/${sourceId}/versions/ingest`, payload);
  return data;
}

export async function getVersionEvidence(sourceId, versionId) {
  const { data } = await api.get(`/sources/${sourceId}/versions/${versionId}/evidence`);
  return data;
}

export async function listChunks(sourceId, versionId) {
  const { data } = await api.get(`/sources/${sourceId}/versions/${versionId}/chunks`);
  return data;
}

export async function searchRetrieval(payload) {
  const { data } = await api.post('/retrieval/search', payload);
  return data;
}

export async function generateQuestion(payload) {
  const { data } = await api.post('/questions/generate', payload);
  return data;
}

export async function validateQuestion(questionId) {
  const { data } = await api.post(`/questions/${questionId}/validate`);
  return data;
}

export async function reviseQuestion(questionId, payload) {
  const { data } = await api.post(`/questions/${questionId}/versions`, payload);
  return data;
}

export async function reviewQuestion(questionId, payload) {
  const { data } = await api.post(`/questions/${questionId}/review`, payload);
  return data;
}

export async function assembleAssessment(blueprintId) {
  const { data } = await api.post('/assessments', { blueprintId });
  return data;
}

export async function getAssessment(assessmentId) {
  const { data } = await api.get(`/assessments/${assessmentId}`);
  return data;
}

export async function validateAssessment(assessmentId) {
  const { data } = await api.post(`/assessments/${assessmentId}/validate`);
  return data;
}
