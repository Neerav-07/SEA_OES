import { Router } from 'express';
import { getOfficialEvidence, recordEvidence, getEvidenceProvenance } from '../controllers/competencies/evidence.controller.js';

const router = Router();

router.get('/official/:officialId', getOfficialEvidence);
router.post('/', recordEvidence);
router.get('/:id/provenance', getEvidenceProvenance);

export default router;
