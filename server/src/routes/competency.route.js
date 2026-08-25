import { Router } from 'express';
import { getCompetencies, getCompetencyById } from '../controllers/competencies/competency.controller.js';

const router = Router();

router.get('/', getCompetencies);
router.get('/:id', getCompetencyById);

export default router;
