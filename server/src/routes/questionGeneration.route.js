import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { generateQuestionController, getQuestionController } from '../controllers/assessments/questionGeneration.controller.js';
import { reviseQuestionController, reviewQuestionController, validateQuestionController } from '../controllers/assessments/questionLifecycle.controller.js';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';

const router = Router();
router.use(verifyToken);
// The platform currently has ADMIN and EMPLOYEE only; ADMIN is the safe
// equivalent of the requested trainer/reviewer role until TRAINER is modelled.
router.use(requireRole('ADMIN'));

const questionGenLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Question generation rate limit reached. Please wait a minute before generating more questions.' },
});

router.post('/generate', questionGenLimiter, generateQuestionController);
router.post('/:id/validate', validateQuestionController);
router.post('/:id/versions', reviseQuestionController);
router.post('/:id/review', reviewQuestionController);
router.get('/:id', getQuestionController);
export default router;
