import { assembleAssessment, getAssessment, validateAssessment } from '../../services/assessmentAssembly.service.js';

export async function assembleAssessmentController(req, res, next) {
  try { return res.status(201).json(await assembleAssessment(req.body.blueprintId)); } catch (error) { return next(error); }
}
export async function getAssessmentController(req, res, next) {
  try { return res.status(200).json(await getAssessment(req.params.id)); } catch (error) { return next(error); }
}
export async function validateAssessmentController(req, res, next) {
  try { return res.status(200).json(await validateAssessment(req.params.id)); } catch (error) { return next(error); }
}
