import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';
import {
  getReviewQueueController,
  processReviewDecisionController,
} from '../controllers/review.controller.js';

const router = Router();

// Get questions pending admin review (ADMIN role required)
router.get('/queue', verifyToken, requireRole('ADMIN'), getReviewQueueController);

// Submit approval/rejection decision for an AI-generated question (ADMIN role required)
router.post('/queue/:id/decision', verifyToken, requireRole('ADMIN'), processReviewDecisionController);

export default router;
