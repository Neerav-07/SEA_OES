import { Router } from 'express';
import { getOfficials, getOfficialProfile, updateOfficialRole } from '../controllers/official.controller.js';

const router = Router();

router.get('/', getOfficials);
router.get('/:id', getOfficialProfile);
router.put('/:id/role', updateOfficialRole);

export default router;
