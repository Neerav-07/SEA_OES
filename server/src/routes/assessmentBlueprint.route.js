import { Router } from 'express';

import {
  createAssessmentBlueprintController,
  getAssessmentBlueprintController,
  listBlueprintClaimsController,
  listBlueprintCompetenciesController,
  listBlueprintLearningObjectivesController,
  listAssessmentBlueprintsController,
  updateAssessmentBlueprintController,
  validateAssessmentBlueprintController,
} from '../controllers/assessmentBlueprint.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.use(verifyToken);

router.get('/lookup/competencies', listBlueprintCompetenciesController);
router.get('/lookup/competencies/:competencyId/claims', listBlueprintClaimsController);
router.get('/lookup/competencies/:competencyId/learning-objectives', listBlueprintLearningObjectivesController);
router.get('/', listAssessmentBlueprintsController);
router.get('/:id', getAssessmentBlueprintController);
router.post('/', createAssessmentBlueprintController);
router.patch('/:id', updateAssessmentBlueprintController);
router.post('/:id/validate', validateAssessmentBlueprintController);

export default router;
