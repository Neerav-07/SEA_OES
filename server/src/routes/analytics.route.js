import { Router } from 'express';
import { getWorkforceAnalytics, getCompetencyHistory } from '../controllers/governance/analytics.controller.js';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';

const router = Router();

router.use(verifyToken);

// Workforce aggregate analytics is strictly restricted to ADMIN
router.get('/workforce', requireRole('ADMIN'), getWorkforceAnalytics);
router.get('/history/:officialId', getCompetencyHistory);

export default router;
