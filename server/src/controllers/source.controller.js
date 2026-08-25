import {
  createChunks,
  createSource,
  createVersion,
  getEvidence,
  getSource,
  getVersion,
  ingestSourceVersion,
  listChunks,
  listSources,
  listVersions,
  updateSource,
} from '../services/source.service.js';

export async function listSourcesController(req, res, next) {
  try { return res.status(200).json({ items: await listSources(req.query.search || '') }); } catch (error) { return next(error); }
}
export async function createSourceController(req, res, next) {
  try { return res.status(201).json({ source: await createSource(req.body) }); } catch (error) { return next(error); }
}
export async function getSourceController(req, res, next) {
  try { return res.status(200).json(await getSource(req.params.sourceId)); } catch (error) { return next(error); }
}
export async function updateSourceController(req, res, next) {
  try { return res.status(200).json({ source: await updateSource(req.params.sourceId, req.body) }); } catch (error) { return next(error); }
}
export async function createVersionController(req, res, next) {
  try { return res.status(201).json({ version: await createVersion(req.params.sourceId, req.body) }); } catch (error) { return next(error); }
}
export async function listVersionsController(req, res, next) {
  try { return res.status(200).json({ items: await listVersions(req.params.sourceId) }); } catch (error) { return next(error); }
}
export async function getVersionController(req, res, next) {
  try { return res.status(200).json(await getVersion(req.params.sourceId, req.params.versionId)); } catch (error) { return next(error); }
}
export async function createChunksController(req, res, next) {
  try { return res.status(201).json(await createChunks(req.params.sourceId, req.params.versionId, req.body)); } catch (error) { return next(error); }
}
export async function listChunksController(req, res, next) {
  try { return res.status(200).json({ items: await listChunks(req.params.sourceId, req.params.versionId) }); } catch (error) { return next(error); }
}
export async function ingestSourceController(req, res, next) {
  try { return res.status(201).json(await ingestSourceVersion(req.params.sourceId, req.body)); } catch (error) { return next(error); }
}
export async function evidenceController(req, res, next) {
  try { return res.status(200).json({ items: await getEvidence(req.params.sourceId, req.params.versionId) }); } catch (error) { return next(error); }
}
