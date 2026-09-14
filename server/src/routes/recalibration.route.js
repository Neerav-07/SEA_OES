import { Router } from 'express';
import { recalibrateOfficialCompetencies } from '../controllers/competencies/recalibration.controller.js';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';

const router = Router();

router.use(verifyToken);

// Triggering full recalculation of competencies requires administrative privileges
router.post('/run', requireRole('ADMIN'), recalibrateOfficialCompetencies);

export default router;
