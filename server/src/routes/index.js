import { Router } from 'express';
import healthRouter from './health.route.js';
import authRouter from './auth.route.js';
import resourceRouter from './resource.route.js';
import competencyRouter from './competency.route.js';
import roleRouter from './role.route.js';
import officialRouter from './official.route.js';
import evidenceRouter from './evidence.route.js';
import diagnosticRouter from './diagnostic.route.js';
import analyticsRouter from './analytics.route.js';
import recalibrationRouter from './recalibration.route.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/resources', resourceRouter);
router.use('/competencies', competencyRouter);
router.use('/roles', roleRouter);
router.use('/officials', officialRouter);
router.use('/evidence', evidenceRouter);
router.use('/diagnostics', diagnosticRouter);
router.use('/analytics', analyticsRouter);
router.use('/recalibration', recalibrationRouter);

export default router;
