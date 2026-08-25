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
} from '../controllers/source.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();
router.use(verifyToken);

router.get('/', listSourcesController);
router.post('/', createSourceController);
router.get('/:sourceId', getSourceController);
router.patch('/:sourceId', updateSourceController);
router.post('/:sourceId/versions', createVersionController);
router.get('/:sourceId/versions', listVersionsController);
router.post('/:sourceId/versions/ingest', ingestSourceController);
router.get('/:sourceId/versions/:versionId', getVersionController);
router.post('/:sourceId/versions/:versionId/chunks', createChunksController);
router.get('/:sourceId/versions/:versionId/chunks', listChunksController);
router.get('/:sourceId/versions/:versionId/evidence', evidenceController);
router.post('/:sourceId/versions/:versionId/ingest', createChunksController);

export default router;
