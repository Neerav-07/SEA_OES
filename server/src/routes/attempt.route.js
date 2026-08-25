import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';
import {
  startAssessmentAttemptController,
  saveAttemptProgressController,
  submitAssessmentAttemptController,
  getAttemptHistoryController,
} from '../controllers/assessments/attempt.controller.js';

const router = Router();

// Start or resume an assessment attempt
router.post('/start', verifyToken, startAssessmentAttemptController);

// Save progress question-by-question (interruption recovery)
router.post('/:attemptId/save-progress', verifyToken, saveAttemptProgressController);

// Finalize and submit assessment attempt
router.post('/:attemptId/submit', verifyToken, submitAssessmentAttemptController);

// Get attempt history for current official
router.get('/history', verifyToken, getAttemptHistoryController);

export default router;
