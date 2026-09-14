import { Router } from 'express';
import {
  getMyNoticeRecommendationsController,
  getNoticeDetailsController,
  getNoticesController,
  getNSSTAProgrammeDetailsController,
  getNSSTAProgrammesController,
  getPolicyWeightsController,
  getSyncStatusController,
  syncNoticesController,
  updatePolicyWeightsController,
} from '../controllers/integrations/nssta.controller.js';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';

const router = Router();

// Scraped Training Notices / Circulars (Public or Authenticated)
router.get('/notices', getNoticesController);
router.get('/notices/:id', getNoticeDetailsController);
router.get('/sync-status', getSyncStatusController);

// Policy Weights & Priority Configuration (Read authenticated/public, Admin-only modification)
router.get('/policy-weights', getPolicyWeightsController);
router.put('/policy-weights', verifyToken, requireRole('ADMIN'), updatePolicyWeightsController);

// Trigger on-demand sync from official NSSTA / MoSPI portal (Admin only)
router.post('/sync', verifyToken, requireRole('ADMIN'), syncNoticesController);

// Personalized Notice & High-Priority Course Recommendations for Authenticated Officer
router.get('/recommendations/me', verifyToken, getMyNoticeRecommendationsController);

// Legacy NSSTA TPAC programmes endpoints
router.get('/programmes', verifyToken, getNSSTAProgrammesController);
router.get('/programmes/:id', verifyToken, getNSSTAProgrammeDetailsController);

export default router;
