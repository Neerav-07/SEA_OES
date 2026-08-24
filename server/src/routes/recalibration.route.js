import { Router } from 'express';
import { recalibrateOfficialCompetencies } from '../controllers/recalibration.controller.js';

const router = Router();

router.post('/run', recalibrateOfficialCompetencies);

export default router;
