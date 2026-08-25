import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';
import { getPredictiveAnalyticsController } from '../controllers/predictions.controller.js';

const router = Router();

// Get predictive analytics for organizational skill trends (ADMIN role required)
router.get('/skill-trends', verifyToken, requireRole('ADMIN'), getPredictiveAnalyticsController);

export default router;
