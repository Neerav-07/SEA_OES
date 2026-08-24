import { Router } from 'express';
import { generateDiagnosticBlueprint, submitDiagnosticAttempt } from '../controllers/diagnostic.controller.js';

const router = Router();

router.post('/blueprint', generateDiagnosticBlueprint);
router.post('/submit', submitDiagnosticAttempt);

export default router;
