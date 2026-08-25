import { Router } from 'express';
import { assembleAssessmentController, getAssessmentController, validateAssessmentController } from '../controllers/assessmentAssembly.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();
router.use(verifyToken);
router.post('/', assembleAssessmentController);
router.get('/:id', getAssessmentController);
router.post('/:id/validate', validateAssessmentController);
export default router;
