import { Router } from 'express';
import { getWorkforceAnalytics, getCompetencyHistory } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/workforce', getWorkforceAnalytics);
router.get('/history/:officialId', getCompetencyHistory);

export default router;
