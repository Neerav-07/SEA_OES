import {
  getSkillGapById,
  listSkillGaps,
  recalculateSkillGaps,
} from "../../services/skillGap.service.js";
import { seedModule3DemoData } from "../../services/module3Seed.service.js";
import { getDb } from '../../db/index.js';
import { officials } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function seedModule3Controller(req, res, next) {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not found." });
  }
  try {
    const result = await seedModule3DemoData({ userId: req.auth.userId });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function recalculateSkillGapsController(req, res, next) {
  try {
    let { officialId, roleId } = req.body || {};
    if (!officialId) {
      const [official] = await getDb().select({ id: officials.id }).from(officials).where(eq(officials.userId, req.auth.userId));
      officialId = official?.id;
    }
    const gaps = await recalculateSkillGaps({
      userId: req.auth.userId,
      officialId,
      roleId,
    });
    return res.status(200).json({ gaps, status: gaps.length ? 'OK' : 'INSUFFICIENT_DATA' });
  } catch (error) {
    return next(error);
  }
}

export async function listSkillGapsController(req, res, next) {
  try {
    const { officialId, category, priority } = req.query;
    const gaps = await listSkillGaps({
      userId: req.auth.userId,
      officialId,
      category,
      priority,
    });
    return res.status(200).json({ gaps });
  } catch (error) {
    return next(error);
  }
}

export async function getSkillGapController(req, res, next) {
  try {
    const gap = await getSkillGapById({
      userId: req.auth.userId,
      gapId: req.params.id,
    });
    return res.status(200).json({ gap });
  } catch (error) {
    return next(error);
  }
}
