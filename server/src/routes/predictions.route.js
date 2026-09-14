import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/verifyToken.js";
import {
  getPredictiveAnalyticsController,
  reviewPredictionController,
} from "../controllers/governance/predictions.controller.js";

const router = Router();

// Get predictive analytics for organizational skill trends (ADMIN role required)
router.get(
  "/skill-trends",
  verifyToken,
  requireRole("ADMIN"),
  getPredictiveAnalyticsController,
);
router.post(
  "/review",
  verifyToken,
  requireRole("ADMIN"),
  reviewPredictionController,
);

export default router;
