import { Router } from 'express';
import { getCompetencies, getCompetencyById } from '../controllers/competencies/competency.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

// Competency framework queries require authenticated sessions
router.use(verifyToken);

router.get('/', getCompetencies);
router.get('/:id', getCompetencyById);

export default router;
