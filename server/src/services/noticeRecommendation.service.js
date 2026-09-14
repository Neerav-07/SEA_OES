import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { competencyEstimates, learningMaterials, noticeCourseRecommendations, nsstaNoticeCompetencies, nsstaNotices, officials, roles, skillGaps } from '../db/schema/index.js';
import { computeCoursePriorityScore } from '../utils/coursePriorityScore.js';

/** Builds rankings only from human-approved notice-to-competency mappings. */
export async function refreshNoticeRecommendations({ officialId }) {
  const db = getDb();
  const [official] = await db.select().from(officials).where(eq(officials.id, officialId));
  if (!official) throw Object.assign(new Error('Official profile not found.'), { statusCode: 404 });
  const roleId = official.targetRoleId || official.roleId;
  if (!roleId) return [];
  const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
  const mappings = await db.select({ mapping: nsstaNoticeCompetencies, notice: nsstaNotices })
    .from(nsstaNoticeCompetencies).innerJoin(nsstaNotices, eq(nsstaNoticeCompetencies.noticeId, nsstaNotices.id))
    .where(and(eq(nsstaNoticeCompetencies.reviewStatus, 'APPROVED'), eq(nsstaNotices.status, 'ACTIVE')));
  const gaps = await db.select().from(skillGaps).where(eq(skillGaps.officialId, officialId));
  const materials = await db.select().from(learningMaterials);
  const rows = [];
  for (const { mapping, notice } of mappings) {
    const gap = gaps.find((item) => item.competencyId === mapping.competencyId);
    if (!gap || Number(gap.gapSeverity) <= 0) continue;
    for (const course of materials.filter((item) => item.competencyId === mapping.competencyId)) {
      const score = computeCoursePriorityScore({ gapSeverity: gap.gapSeverity, urgencyLevel: notice.urgencyLevel, officerCadre: official.cadre || role?.title, targetAudience: notice.targetAudience || [], nominationDeadline: notice.nominationDeadline, semanticRelevance: mapping.relevanceScore, isMandatory: notice.isMandatory });
      const values = { officialId, noticeId: notice.id, roleId, competencyId: mapping.competencyId, courseId: course.materialCode, score: score.score, scoringFactors: score.factors, formulaVersion: score.formulaVersion, status: 'RECOMMENDED', provenance: { noticeMappingId: mapping.id, mappingReviewStatus: mapping.reviewStatus, courseProvider: course.provider } };
      const [saved] = await db.insert(noticeCourseRecommendations).values(values).returning();
      rows.push({ ...saved, course, notice, competencyId: mapping.competencyId, priorityLevel: score.priorityLevel });
    }
  }
  return rows.sort((a, b) => b.score - a.score || String(a.courseId).localeCompare(String(b.courseId)));
}

export async function listNoticeRecommendations({ officialId, refresh = false }) {
  if (refresh) return refreshNoticeRecommendations({ officialId });
  const db = getDb();
  return db.select().from(noticeCourseRecommendations).where(eq(noticeCourseRecommendations.officialId, officialId)).orderBy(desc(noticeCourseRecommendations.score), noticeCourseRecommendations.courseId);
}
