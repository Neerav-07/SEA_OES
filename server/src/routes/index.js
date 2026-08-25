import { Router } from 'express';
import healthRouter   from './health.route.js';
import authRouter     from './auth.route.js';
import resourceRouter from './resource.route.js';
import assessmentBlueprintRouter from './assessmentBlueprint.route.js';
import sourceRouter from './source.route.js';
import retrievalRouter from './retrieval.route.js';
import questionGenerationRouter from './questionGeneration.route.js';
import assessmentRouter from './assessment.route.js';

const router = Router();

router.use(healthRouter);
router.use('/auth',      authRouter);
router.use('/resources', resourceRouter);
router.use('/assessment-blueprints', assessmentBlueprintRouter);
router.use('/sources', sourceRouter);
router.use('/retrieval', retrievalRouter);
router.use('/questions', questionGenerationRouter);
router.use('/assessments', assessmentRouter);

export default router;
