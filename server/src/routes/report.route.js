import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/verifyToken.js';
import {
  generateACBPReportController,
  getOfficialSummaryReportController,
} from '../controllers/governance/report.controller.js';

const router = Router();

// Generate Annual Capacity Building Plan (ACBP) Report (ADMIN role required)
router.get('/acbp', verifyToken, requireRole('ADMIN'), generateACBPReportController);

// Generate Individual Official Progress & Capacity Summary
router.get('/official-summary/:officialId', verifyToken, getOfficialSummaryReportController);

export default router;
