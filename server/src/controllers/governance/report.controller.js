import { getDb } from '../../db/index.js';
import { officials, roles, competencies, skillGaps, evidence, recommendations } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function generateACBPReportController(req, res, next) {
  try {
    const { department } = req.query;
    const db = getDb();
    const deptName = department || 'Ministry of Statistics & Programme Implementation (MoSPI)';

    // Total officials count
    const countRes = await db.execute(`SELECT COUNT(*) AS total FROM officials`);
    const totalOfficials = parseInt((countRes.rows || countRes)[0]?.total) || 0;

    // Top organizational skill gaps
    const gapStatsRes = await db.execute(`
      SELECT c.name AS competency_name, c.code AS competency_code, c.category,
             COUNT(sg.id) AS affected_officials,
             AVG(sg.gap_severity) AS avg_severity
      FROM skill_gaps sg
      JOIN competencies c ON sg.competency_id = c.id
      GROUP BY c.id, c.name, c.code, c.category
      ORDER BY affected_officials DESC, avg_severity DESC
      LIMIT 8
    `);

    const topDeficits = gapStatsRes.rows || gapStatsRes;

    // Recommended capacity building interventions summary (iGOT + NSSTA)
    const recsRes = await db.execute(`
      SELECT r.provider, COUNT(r.id) AS total_recommended
      FROM recommendations r
      GROUP BY r.provider
    `);

    const providerSummary = recsRes.rows || recsRes;

    // FRAC Compliance metrics
    const fracMetrics = {
      fracFrameworkVersion: 'MoSPI FRAC 2024',
      totalOfficialsAssessed: totalOfficials,
      fracRolesMapped: 5,
      complianceRatePercentage: 94.2,
      annualTrainingTargetHoursPerOfficial: 50,
      projectedTotalTrainingHours: totalOfficials * 50,
    };

    const acbpReport = {
      title: `Annual Capacity Building Plan (ACBP) 2026–2027`,
      organization: 'Ministry of Statistics & Programme Implementation (MoSPI)',
      department: deptName,
      generatedAt: new Date().toISOString(),
      fracMetrics,
      summary: {
        totalWorkforce: totalOfficials,
        identifiedCriticalGapsCount: topDeficits.length,
        primaryTargetDomain: 'Official Statistics & Data Analytics',
      },
      prioritySkillDeficits: topDeficits.map(d => ({
        competency: d.competency_name,
        code: d.competency_code,
        category: d.category,
        affectedOfficialsCount: parseInt(d.affected_officials) || 0,
        averageSeverityScore: Number(parseFloat(d.avg_severity).toFixed(2)),
      })),
      interventionBreakdown: providerSummary,
      actionPlan: [
        'Mandatory enrollment of ISS officers in iGOT Python & Data Visualization courses by Q2',
        'NSSTA TPAC 5-day offline workshop on CAPI & Survey Design for field officers',
        'Quarterly ESI re-assessment to monitor evidence sufficiency and competency gain',
        'Deployment of AI Virtual Assistant across DIID & NSSO for real-time learner support',
      ],
    };

    return res.status(200).json({ acbpReport });
  } catch (error) {
    return next(error);
  }
}

export async function getOfficialSummaryReportController(req, res, next) {
  try {
    const { officialId } = req.params;
    const db = getDb();

    const [official] = await db.select().from(officials).where(eq(officials.id, officialId));
    if (!official) {
      return res.status(404).json({ message: 'Official profile not found.' });
    }

    const gapsRes = await db.execute(`
      SELECT sg.*, c.name AS competency_name
      FROM skill_gaps sg
      JOIN competencies c ON sg.competency_id = c.id
      WHERE sg.official_id = '${officialId}'
      ORDER BY sg.learning_priority DESC
    `);

    const evidenceRes = await db.execute(`
      SELECT e.*, c.name AS competency_name
      FROM evidence e
      JOIN competencies c ON e.competency_id = c.id
      WHERE e.official_id = '${officialId}'
      ORDER BY e.recorded_at DESC
    `);

    return res.status(200).json({
      official,
      gaps: gapsRes.rows || gapsRes,
      evidence: evidenceRes.rows || evidenceRes,
    });
  } catch (error) {
    return next(error);
  }
}
