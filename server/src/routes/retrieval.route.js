import { Router } from 'express';
import { searchRetrievalController } from '../controllers/retrieval.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();
router.use(verifyToken);
router.post('/search', searchRetrievalController);
export default router;
