import { Router } from 'express';
import { createAssessment, getAssessments, getAssessmentById } from '../controllers/assessments/assessment.controller.js';
import { assembleAssessmentController, getAssessmentController, validateAssessmentController } from '../controllers/assessments/assessmentAssembly.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.post('/', createAssessment);
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);

router.post('/assemble', verifyToken, assembleAssessmentController);
router.get('/assembled/:id', verifyToken, getAssessmentController);
router.post('/assembled/:id/validate', verifyToken, validateAssessmentController);

export default router;
