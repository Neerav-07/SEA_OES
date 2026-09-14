import { Router } from 'express';

import {
  createChunksController,
  createSourceController,
  createVersionController,
  evidenceController,
  getSourceController,
  getVersionController,
  ingestSourceController,
  listChunksController,
  listSourcesController,
  listVersionsController,
  updateSourceController,
  deleteSourceController,
  generateAssessmentFromSourceController,
  publishAssessmentController,
  cleanupDuplicatesController,
} from '../controllers/sources/source.controller.js';
import { rateLimit } from 'express-rate-limit';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();
router.use(verifyToken);

const sourceGenLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Source assessment generation rate limit reached. Please wait a minute.' },
});

router.get('/', listSourcesController);
router.post('/', createSourceController);
router.post('/cleanup-duplicates', cleanupDuplicatesController);
router.get('/:sourceId', getSourceController);
router.patch('/:sourceId', updateSourceController);
router.delete('/:sourceId', deleteSourceController);
router.post('/:sourceId/generate-assessment', sourceGenLimiter, generateAssessmentFromSourceController);
router.post('/assessments/:assessmentId/publish', publishAssessmentController);
router.post('/:sourceId/versions', createVersionController);
router.get('/:sourceId/versions', listVersionsController);
router.post('/:sourceId/versions/ingest', ingestSourceController);
router.get('/:sourceId/versions/:versionId', getVersionController);
router.post('/:sourceId/versions/:versionId/chunks', createChunksController);
router.get('/:sourceId/versions/:versionId/chunks', listChunksController);
router.get('/:sourceId/versions/:versionId/evidence', evidenceController);
router.post('/:sourceId/versions/:versionId/ingest', createChunksController);

export default router;
