import { Router } from 'express';
import { getPersonalizedPathway, ingestLearningMaterial, getLearningMaterials } from '../controllers/integrations/pathway.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.get('/official/:officialId', verifyToken, getPersonalizedPathway);
router.post('/ingest', ingestLearningMaterial);
router.get('/materials', getLearningMaterials);

export default router;
