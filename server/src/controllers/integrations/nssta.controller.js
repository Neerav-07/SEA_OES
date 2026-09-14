import { desc, eq } from 'drizzle-orm';
import { db, getDb } from '../../db/index.js';
import { nsstaSyncLogs, officials } from '../../db/schema/index.js';
import { getOfficialNoticeRecommendations } from '../../services/nsstaRecommendation.service.js';
import {
  getActiveNSSTANotices,
  syncNSSTANotices,
} from '../../services/nsstaScraper.service.js';
import {
  DEFAULT_PRIORITY_WEIGHTS,
  getPriorityWeights,
  setPriorityWeights,
} from '../../utils/coursePriorityScore.js';

/**
 * Get all active scraped NSSTA training notices / circulars.
 */
export async function getNoticesController(req, res, next) {
  try {
    const { mode, competencyCode, cadre } = req.query;
    let notices = await getActiveNSSTANotices();

    if (!notices || notices.length === 0) {
      await syncNSSTANotices();
      notices = await getActiveNSSTANotices();
    }

    if (mode) {
      notices = notices.filter(
        (n) => n.mode?.toLowerCase() === mode.toLowerCase()
      );
    }

    if (competencyCode) {
      notices = notices.filter((n) =>
        (n.mappedCompetencies || []).some(
          (c) => c.code?.toLowerCase() === competencyCode.toLowerCase()
        )
      );
    }

    if (cadre) {
      notices = notices.filter((n) =>
        (n.targetAudience || []).some((a) =>
          a.toLowerCase().includes(cadre.toLowerCase())
        )
      );
    }

    return res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get details for a single notice by ID.
 */
export async function getNoticeDetailsController(req, res, next) {
  try {
    const { id } = req.params;
    const notices = await getActiveNSSTANotices();
    const notice = notices.find((n) => n.id === id);

    if (!notice) {
      return res.status(404).json({ message: 'NSSTA notice not found.' });
    }

    return res.status(200).json({ success: true, notice });
  } catch (error) {
    return next(error);
  }
}

/**
 * Trigger scraper sync with official NSSTA / MoSPI portal.
 */
export async function syncNoticesController(req, res, next) {
  try {
    const result = await syncNSSTANotices();
    return res.status(200).json({
      success: true,
      message: 'NSSTA notices synchronized successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get personalized NSSTA circular recommendations for the logged-in officer.
 */
export async function getMyNoticeRecommendationsController(req, res, next) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const [official] = await db
      .select()
      .from(officials)
      .where(eq(officials.userId, userId));

    if (!official) {
      // Fallback: load first official profile for demo
      const [firstOfficial] = await db.select().from(officials).limit(1);
      if (!firstOfficial) {
        return res
          .status(404)
          .json({ message: 'No official profile found for recommendation.' });
      }
      const data = await getOfficialNoticeRecommendations(firstOfficial.id);
      return res.status(200).json({ success: true, data });
    }

    const data = await getOfficialNoticeRecommendations(official.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get latest sync history and status log.
 */
export async function getSyncStatusController(req, res, next) {
  try {
    const logs = await db
      .select()
      .from(nsstaSyncLogs)
      .orderBy(desc(nsstaSyncLogs.startedAt))
      .limit(5);

    return res.status(200).json({
      success: true,
      lastSync: logs[0] || null,
      history: logs,
    });
  } catch (error) {
    return next(error);
  }
}

// ── Legacy Compatibility ──────────────────────────────────────────
export async function getNSSTAProgrammesController(req, res, next) {
  try {
    const dbInstance = getDb();
    const { competencyCode, mode } = req.query;

    let query = `
      SELECT np.*, 
             COALESCE(
               json_agg(
                 json_build_object('id', c.id, 'code', c.code, 'name', c.name, 'category', c.category)
               ) FILTER (WHERE c.id IS NOT NULL), '[]'
             ) AS mapped_competencies
      FROM nssta_programmes np
      LEFT JOIN nssta_competency_map ncm ON np.id = ncm.programme_id
      LEFT JOIN competencies c ON ncm.competency_id = c.id
      WHERE np.is_active = true
    `;

    if (mode) {
      query += ` AND np.mode = '${mode}'`;
    }

    query += ` GROUP BY np.id ORDER BY np.created_at DESC`;

    const result = await dbInstance.execute(query);
    let programmes = result.rows || result;

    if (competencyCode) {
      programmes = programmes.filter((p) =>
        p.mapped_competencies.some((c) => c.code === competencyCode)
      );
    }

    return res.status(200).json({ programmes });
  } catch (error) {
    return next(error);
  }
}

export async function getNSSTAProgrammeDetailsController(req, res, next) {
  try {
    const { id } = req.params;
    const dbInstance = getDb();

    const result = await dbInstance.execute(`
      SELECT np.*, 
             COALESCE(
               json_agg(
                 json_build_object('id', c.id, 'code', c.code, 'name', c.name, 'category', c.category)
               ) FILTER (WHERE c.id IS NOT NULL), '[]'
             ) AS mapped_competencies
      FROM nssta_programmes np
      LEFT JOIN nssta_competency_map ncm ON np.id = ncm.programme_id
      LEFT JOIN competencies c ON ncm.competency_id = c.id
      WHERE np.id = '${id}'
      GROUP BY np.id
    `);

    const programme = (result.rows || result)[0];
    if (!programme) {
      return res.status(404).json({ message: 'NSSTA Programme not found.' });
    }

    return res.status(200).json({ programme });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get active NSSTA and Pathway ranking policy weights and preset descriptions.
 */
export async function getPolicyWeightsController(req, res, next) {
  try {
    const activeWeights = getPriorityWeights();
    return res.status(200).json({
      success: true,
      data: {
        activeWeights,
        defaultWeights: DEFAULT_PRIORITY_WEIGHTS,
        presets: [
          {
            id: 'BALANCED',
            name: 'MoSPI Balanced Baseline',
            description: 'Standard multi-factor distribution balancing gap closure and urgent circulars.',
            weights: DEFAULT_PRIORITY_WEIGHTS,
          },
          {
            id: 'MANDATE_URGENT',
            name: 'Ministry Mandates & Compliance',
            description: 'Elevates circulars tagged as CRITICAL / MANDATORY by MoSPI for immediate compliance.',
            weights: {
              GAP_SEVERITY: 0.15,
              NOTICE_URGENCY: 0.45,
              ROLE_CRITICALITY: 0.20,
              SEMANTIC_RELEVANCE: 0.10,
              DEADLINE_PROXIMITY: 0.10,
            },
          },
          {
            id: 'SKILL_GAP_HEAVY',
            name: 'Critical Deficit Closure',
            description: 'Focuses primarily on bridging evaluated officer skill gaps and proficiency deficits.',
            weights: {
              GAP_SEVERITY: 0.50,
              NOTICE_URGENCY: 0.15,
              ROLE_CRITICALITY: 0.15,
              SEMANTIC_RELEVANCE: 0.15,
              DEADLINE_PROXIMITY: 0.05,
            },
          },
          {
            id: 'CADRE_CAREER',
            name: 'Cadre Career Progression',
            description: 'Maximizes prioritization of programmes exclusively tailored for specific service cadres (ISS / SSS).',
            weights: {
              GAP_SEVERITY: 0.20,
              NOTICE_URGENCY: 0.15,
              ROLE_CRITICALITY: 0.45,
              SEMANTIC_RELEVANCE: 0.15,
              DEADLINE_PROXIMITY: 0.05,
            },
          },
        ],
        factorDescriptions: {
          GAP_SEVERITY: 'Weight allocated to closing evaluated officer competency deficits against FRAC benchmarks.',
          NOTICE_URGENCY: 'Weight given to official circulars marked as MANDATORY or CRITICAL by MoSPI/NSSTA.',
          ROLE_CRITICALITY: 'Weight allocated based on direct cadre targeting (e.g., ISS Officer, SSS Analyst).',
          SEMANTIC_RELEVANCE: 'Weight allocated to semantic similarity between training syllabus and role competencies.',
          DEADLINE_PROXIMITY: 'Escalation weight for notices closing nominations within 3 to 7 days.',
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Update NSSTA ranking policy weights.
 */
export async function updatePolicyWeightsController(req, res, next) {
  try {
    const { weights } = req.body || {};
    if (!weights || typeof weights !== 'object') {
      return res.status(400).json({ message: 'Valid weights configuration is required.' });
    }

    const gap = Number(weights.GAP_SEVERITY ?? 0.35);
    const urgency = Number(weights.NOTICE_URGENCY ?? 0.25);
    const role = Number(weights.ROLE_CRITICALITY ?? 0.20);
    const relevance = Number(weights.SEMANTIC_RELEVANCE ?? 0.15);
    const deadline = Number(weights.DEADLINE_PROXIMITY ?? 0.05);

    const sum = Number((gap + urgency + role + relevance + deadline).toFixed(2));
    if (Math.abs(sum - 1.0) > 0.05) {
      return res.status(400).json({
        message: `Policy weights must sum to approximately 100% (1.0). Current sum: ${(sum * 100).toFixed(0)}%`,
      });
    }

    const updated = setPriorityWeights({
      GAP_SEVERITY: gap,
      NOTICE_URGENCY: urgency,
      ROLE_CRITICALITY: role,
      SEMANTIC_RELEVANCE: relevance,
      DEADLINE_PROXIMITY: deadline,
    });

    return res.status(200).json({
      success: true,
      message: 'NSSTA & Pathway Ranking Policy weights updated successfully.',
      data: {
        activeWeights: updated,
      },
    });
  } catch (error) {
    return next(error);
  }
}
