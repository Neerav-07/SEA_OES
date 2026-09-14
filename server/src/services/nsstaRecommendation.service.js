import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  competencies,
  evidence,
  learningMaterials,
  officials,
  roleCompetencies,
  roles,
} from '../db/schema/index.js';
import { computeCoursePriorityScore } from '../utils/coursePriorityScore.js';
import { calculateWeightedEstimate } from '../utils/evidenceFusion.js';
import { calculateSkillGaps } from '../utils/skillGapCalculator.js';
import { getActiveNSSTANotices, syncNSSTANotices } from './nsstaScraper.service.js';

/**
 * Get personalized NSSTA notice recommendations for a specific official.
 *
 * Matches active circulars with the official's real role, designation, and calculated skill gaps.
 */
export async function getOfficialNoticeRecommendations(officialId) {
  let [official] = await db
    .select()
    .from(officials)
    .where(eq(officials.id, officialId));

  if (!official) {
    throw new Error('Official profile not found.');
  }

  // Load active notices (auto-sync if table is empty)
  let notices = await getActiveNSSTANotices();
  if (!notices || notices.length === 0) {
    await syncNSSTANotices();
    notices = await getActiveNSSTANotices();
  }

  // Determine official's role and cadre
  let roleTitle = official.designation || 'Statistical Officer';
  if (official.roleId) {
    const [r] = await db.select().from(roles).where(eq(roles.id, official.roleId));
    if (r?.name) roleTitle = r.name;
  }

  // Calculate official's real skill gaps
  const allComps = await db.select().from(competencies);
  const roleReqs = official.roleId
    ? await db
        .select()
        .from(roleCompetencies)
        .where(eq(roleCompetencies.roleId, official.roleId))
    : [];

  const offEvidence = await db
    .select()
    .from(evidence)
    .where(eq(evidence.officialId, officialId));

  const estimates = allComps.map((comp) => {
    const compEv = offEvidence.filter((e) => e.competencyId === comp.id);
    return {
      competencyId: comp.id,
      proficiencyLevel:
        compEv.length > 0 ? calculateWeightedEstimate(compEv) : 1.0,
      evidenceSufficiency:
        compEv.length > 0 ? Math.min(1, compEv.length * 0.25) : 0,
    };
  });

  const requirements = roleReqs.map((r) => ({
    id: r.id,
    competencyId: r.competencyId,
    requiredLevel: r.requiredLevel,
    priority: r.priority,
    urgency: r.isMandatory ? 'HIGH' : 'NORMAL',
    mandatory: r.isMandatory,
  }));

  const gaps = calculateSkillGaps({ requirements, estimates }).map((g) => {
    const comp = allComps.find((c) => c.id === g.competencyId);
    return {
      ...g,
      code: comp?.code,
      name: comp?.name,
    };
  });

  const gapMap = new Map(gaps.map((g) => [g.competencyId, g]));

  // Load learning materials to link related iGOT/NSSTA courses
  const allMaterials = await db.select().from(learningMaterials);

  // Score each notice against the official
  const recommendations = [];

  for (const notice of notices) {
    const matchedGaps = [];
    let maxGapSeverity = 0;

    for (const comp of notice.mappedCompetencies || []) {
      const g = gapMap.get(comp.id);
      if (g && g.gapSeverity > 0) {
        matchedGaps.push({
          competencyId: comp.id,
          code: comp.code,
          name: comp.name,
          gapSeverity: g.gapSeverity,
          requiredLevel: g.requiredLevel,
          currentLevel: g.currentLevel,
        });
        if (g.gapSeverity > maxGapSeverity) {
          maxGapSeverity = g.gapSeverity;
        }
      }
    }

    // Compute priority score
    const scoreResult = computeCoursePriorityScore({
      gapSeverity: maxGapSeverity,
      urgencyLevel: notice.urgencyLevel,
      officerCadre: roleTitle,
      targetAudience: notice.targetAudience || [],
      nominationDeadline: notice.nominationDeadline,
      semanticRelevance: matchedGaps.length > 0 ? 0.95 : 0.7,
      isMandatory: notice.isMandatory,
    });

    // Find linked courses
    const linkedCourses = allMaterials
      .filter((mat) =>
        (notice.mappedCompetencies || []).some(
          (c) => c.id === mat.competencyId
        )
      )
      .map((mat) => ({
        materialCode: mat.materialCode,
        title: mat.title,
        provider: mat.provider,
        durationHours: mat.durationHours,
      }));

    recommendations.push({
      noticeId: notice.id,
      omNumber: notice.omNumber,
      title: notice.title,
      description: notice.description,
      documentUrl: notice.documentUrl,
      sourceUrl: notice.sourceUrl,
      mode: notice.mode,
      durationDays: notice.durationDays,
      publishedDate: notice.publishedDate,
      nominationDeadline: notice.nominationDeadline,
      targetAudience: notice.targetAudience,
      urgencyLevel: notice.urgencyLevel,
      isMandatory: notice.isMandatory,
      mappedCompetencies: notice.mappedCompetencies,
      matchedGaps,
      priorityScore: scoreResult.score,
      priorityLevel: scoreResult.priorityLevel,
      priorityFactors: scoreResult.factors,
      formulaVersion: scoreResult.formulaVersion,
      linkedCourses,
      action: {
        nominationUrl: notice.documentUrl || notice.sourceUrl,
        label: 'View Official Circular & Nominate',
        status: 'OPEN_FOR_NOMINATION',
      },
    });
  }

  // Sort by priority score descending
  recommendations.sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    officialId,
    roleTitle,
    totalRecommendations: recommendations.length,
    highPriorityCount: recommendations.filter(
      (r) => r.priorityLevel === 'CRITICAL' || r.priorityLevel === 'HIGH'
    ).length,
    recommendations,
  };
}
