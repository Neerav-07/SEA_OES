import { Router } from 'express';
import { getRoles, getRoleRequirements } from '../controllers/role.controller.js';

const router = Router();

router.get('/', getRoles);
router.get('/:roleId/requirements', getRoleRequirements);

export default router;
