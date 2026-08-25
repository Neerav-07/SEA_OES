import { Router } from 'express';
import { recalibrateOfficialCompetencies } from '../controllers/competencies/recalibration.controller.js';

const router = Router();

router.post('/run', recalibrateOfficialCompetencies);

export default router;
