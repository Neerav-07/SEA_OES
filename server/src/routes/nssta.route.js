import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  getNSSTAProgrammesController,
  getNSSTAProgrammeDetailsController,
} from '../controllers/nssta.controller.js';

const router = Router();

// Get all NSSTA TPAC programmes (filtered by competency or target audience)
router.get('/programmes', verifyToken, getNSSTAProgrammesController);

// Get details of a single NSSTA TPAC programme
router.get('/programmes/:id', verifyToken, getNSSTAProgrammeDetailsController);

export default router;
