import { reviseQuestion, reviewQuestion, validateQuestion } from '../services/questionValidation.service.js';

export async function validateQuestionController(req, res, next) {
  try { return res.status(200).json(await validateQuestion(req.params.id)); } catch (error) { return next(error); }
}

export async function reviseQuestionController(req, res, next) {
  try { return res.status(201).json(await reviseQuestion(req.params.id, req.body)); } catch (error) { return next(error); }
}

export async function reviewQuestionController(req, res, next) {
  try { return res.status(200).json(await reviewQuestion(req.params.id, req.body.action, req.body.reason)); } catch (error) { return next(error); }
}
