import { Router } from "express";
import {
  getSkillGapController,
  listSkillGapsController,
  recalculateSkillGapsController,
  seedModule3Controller,
} from '../controllers/competencies/skillGap.controller.js';
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.use(verifyToken);
router.post("/seed", seedModule3Controller);
router.post("/recalculate", recalculateSkillGapsController);
router.get("/", listSkillGapsController);
router.get("/:id", getSkillGapController);

export default router;
