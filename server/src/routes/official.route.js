import { Router } from 'express';
import { getOfficials, getOfficialProfile, updateOfficialRole, updateMyProfile } from '../controllers/competencies/official.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.get('/', getOfficials);
router.put('/me', verifyToken, updateMyProfile);
router.patch('/me', verifyToken, updateMyProfile);
router.get('/:id', getOfficialProfile);
router.put('/:id/role', updateOfficialRole);

export default router;
