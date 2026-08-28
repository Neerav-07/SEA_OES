import { Router } from "express";

import {
  generateDiagnosticBlueprint,
  generateDiagnosticAssessment,
  submitDiagnosticAttempt,
} from "../controllers/diagnostic.controller.js";

const router = Router();

router.post("/blueprint", generateDiagnosticBlueprint);

router.post("/generate", generateDiagnosticAssessment);

router.post("/submit", submitDiagnosticAttempt);

export default router;
