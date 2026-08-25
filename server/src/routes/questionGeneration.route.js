import { Router } from 'express';
import { generateQuestionController, getQuestionController } from '../controllers/assessments/questionGeneration.controller.js';
import { reviseQuestionController, reviewQuestionController, validateQuestionController } from '../controllers/assessments/questionLifecycle.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();
router.use(verifyToken);
router.post('/generate', generateQuestionController);
router.post('/:id/validate', validateQuestionController);
router.post('/:id/versions', reviseQuestionController);
router.post('/:id/review', reviewQuestionController);
router.get('/:id', getQuestionController);
export default router;
