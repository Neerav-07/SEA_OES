import { Router } from 'express';
import { getOfficials, getOfficialProfile, updateOfficialRole, updateMyProfile, getMyProfile } from '../controllers/competencies/official.controller.js';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';

const router = Router();

// All official routes require authentication
router.use(verifyToken);

router.get('/me', getMyProfile);
router.get('/', requireRole('ADMIN'), getOfficials);
router.put('/me', updateMyProfile);
router.patch('/me', updateMyProfile);
router.get('/:id', getOfficialProfile);
router.put('/:id/role', requireRole('ADMIN'), updateOfficialRole);

export default router;
