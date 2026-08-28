import { searchSourceEvidence } from '../../services/retrieval.service.js';

export async function searchRetrievalController(req, res, next) {
  try { return res.status(200).json(await searchSourceEvidence(req.body)); } catch (error) { return next(error); }
}
