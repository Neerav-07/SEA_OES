import { Router } from 'express';
import healthRouter from './health.route.js';
import authRouter from './auth.route.js';
import resourceRouter from './resource.route.js';
import competencyRouter from './competency.route.js';
import roleRouter from './role.route.js';
import officialRouter from './official.route.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/resources', resourceRouter);
router.use('/competencies', competencyRouter);
router.use('/roles', roleRouter);
router.use('/officials', officialRouter);

export default router;
