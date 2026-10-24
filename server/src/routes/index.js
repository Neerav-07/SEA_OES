import { Router } from 'express';
import healthRouter from './health.route.js';
import authRouter from './auth.route.js';
import questionBankImportRouter from './questionBankImport.route.js';

const router = Router();
router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/question-bank', questionBankImportRouter);

export default router;
