import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  generateDiagnosticBlueprint,
  generateDiagnosticAssessment,
  submitDiagnosticAttempt,
} from "../controllers/assessments/diagnostic.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

// Diagnostic blueprints, generation, and attempt submissions require authentication
router.use(verifyToken);

// Rate limiter for LLM assessment generation to protect quotas
const diagnosticGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Generation rate limit exceeded. Please wait a minute before generating new assessments." },
});

router.post("/blueprint", diagnosticGenerationLimiter, generateDiagnosticBlueprint);
router.post("/generate", diagnosticGenerationLimiter, generateDiagnosticAssessment);
router.post("/submit", submitDiagnosticAttempt);

export default router;
