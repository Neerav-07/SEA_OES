import { Router } from 'express';
import { getRoles, getRoleRequirements, getEligibleRolesController, selectTargetRole } from '../controllers/competencies/role.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.get('/', getRoles);
router.get('/eligible', verifyToken, getEligibleRolesController);
router.put('/target', verifyToken, selectTargetRole);
router.get('/:roleId/requirements', getRoleRequirements);

export default router;
