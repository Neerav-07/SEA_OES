import { generateGroundedQuestion, getGeneratedQuestion } from '../services/questionGeneration.service.js';

export async function generateQuestionController(req, res, next) {
  try {
    const result = await generateGroundedQuestion(req.body);
    return res.status(result.status === 'INSUFFICIENT_EVIDENCE' ? 422 : 201).json(result);
  } catch (error) { return next(error); }
}

export async function getQuestionController(req, res, next) {
  try { return res.status(200).json(await getGeneratedQuestion(req.params.id)); } catch (error) { return next(error); }
}
