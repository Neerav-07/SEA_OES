import { Router } from 'express';
import { getOfficialEvidence, recordEvidence, getEvidenceProvenance } from '../controllers/competencies/evidence.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

// All evidence inspection and submission requires authentication
router.use(verifyToken);

router.get('/official/:officialId', getOfficialEvidence);
router.post('/', recordEvidence);
router.get('/:id/provenance', getEvidenceProvenance);

export default router;
