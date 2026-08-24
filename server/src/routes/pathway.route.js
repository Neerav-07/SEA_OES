import { Router } from 'express';
import { getPersonalizedPathway, ingestLearningMaterial, getLearningMaterials } from '../controllers/pathway.controller.js';

const router = Router();

router.get('/official/:officialId', getPersonalizedPathway);
router.post('/ingest', ingestLearningMaterial);
router.get('/materials', getLearningMaterials);

export default router;
