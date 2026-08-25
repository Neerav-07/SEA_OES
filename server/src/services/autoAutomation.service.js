import { getDb } from '../db/index.js';
import { officials, competencyRequirements, competencyEstimates, skillGaps, competencies, recommendations } from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { recalculateSkillGaps } from './skillGap.service.js';
import { searchCourses } from './igot.service.js';

/**
 * V2 Auto-Automation Trigger:
 * Automatically runs when an official completes a diagnostic quiz or updates evidence.
 * 1. Recalculates all skill gaps for official
 * 2. Auto-generates recommendations combining iGOT courses + NSSTA TPAC programmes
 * 3. Persists generated recommendations to DB
 */
export async function triggerAutoGapAndRecommendations(officialId) {
  try {
    const db = getDb();

    // Fetch official details to get userId and roleId
    const [official] = await db.select({ userId: officials.userId, roleId: officials.roleId }).from(officials).where(eq(officials.id, officialId));

    let gaps = [];
    if (official && official.roleId) {
      try {
        gaps = await recalculateSkillGaps({ userId: official.userId, officialId, roleId: official.roleId });
      } catch (e) {
        console.warn('Recalculation fallback to DB query:', e.message);
        const gapsRes = await db.select().from(skillGaps).where(eq(skillGaps.officialId, officialId));
        gaps = gapsRes || [];
      }
    } else {
      const gapsRes = await db.select().from(skillGaps).where(eq(skillGaps.officialId, officialId));
      gaps = gapsRes || [];
    }

    // Filter gaps that need learning interventions
    const activeGaps = (gaps || []).filter(g => (g.gapSeverity && g.gapSeverity > 0) || g.category === 'CRITICAL' || g.category === 'HIGH');

    const createdRecs = [];

    for (const gap of activeGaps) {
      const [comp] = await db.select({ code: competencies.code, name: competencies.name }).from(competencies).where(eq(competencies.id, gap.competencyId));
      if (!comp) continue;

      // A. Query iGOT courses for this competency
      const igotRes = await searchCourses({ competencyCodes: [comp.code], limit: 3 });
      const courses = igotRes.result?.content || [];

      for (const course of courses) {
        const [inserted] = await db.insert(recommendations).values({
          officialId,
          competencyId: gap.competencyId,
          courseId: course.identifier,
          title: course.name,
          provider: `iGOT Karmayogi (${course.organisation || 'MoSPI'})`,
          matchScore: 0.92,
          reason: `Auto-recommended for ${comp.name} gap. Addresses required level for official's role.`,
          status: 'RECOMMENDED',
        }).onConflictDoNothing().returning();

        if (inserted) createdRecs.push(inserted);
      }

      // B. Query NSSTA TPAC programmes for this competency
      const nsstaRes = await db.execute(`
        SELECT np.*
        FROM nssta_programmes np
        JOIN nssta_competency_map ncm ON np.id = ncm.programme_id
        WHERE ncm.competency_id = '${gap.competencyId}' AND np.is_active = true
        LIMIT 2
      `);

      const nsstaProgs = nsstaRes.rows || nsstaRes;
      for (const prog of nsstaProgs) {
        const [inserted] = await db.insert(recommendations).values({
          officialId,
          competencyId: gap.competencyId,
          courseId: prog.code,
          title: prog.title,
          provider: 'NSSTA TPAC',
          matchScore: 0.95,
          reason: `NSSTA TPAC Official Training Programme for ${comp.name}. Duration: ${prog.duration_days} days (${prog.mode}).`,
          status: 'RECOMMENDED',
        }).onConflictDoNothing().returning();

        if (inserted) createdRecs.push(inserted);
      }
    }

    return {
      officialId,
      gapsCalculated: (gaps || []).length,
      activeGaps: activeGaps.length,
      recommendationsGenerated: createdRecs.length,
    };
  } catch (error) {
    console.error('⚠️ Auto-automation trigger warning:', error.message);
    return { error: error.message };
  }
}
