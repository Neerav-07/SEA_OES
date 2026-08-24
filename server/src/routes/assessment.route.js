import { Router } from 'express';
import { createAssessment, getAssessments, getAssessmentById } from '../controllers/assessment.controller.js';

const router = Router();

router.post('/', createAssessment);
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);

export default router;
