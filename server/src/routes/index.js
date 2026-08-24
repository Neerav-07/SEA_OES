import { Router } from 'express';
import healthRouter   from './health.route.js';
import authRouter     from './auth.route.js';
import resourceRouter from './resource.route.js';

const router = Router();

router.use(healthRouter);
router.use('/auth',      authRouter);
router.use('/resources', resourceRouter);

export default router;
