import { getDb } from '../../db/index.js';
import { officials, assessments, questions, evidence, users, competencies } from '../../db/schema/index.js';
import { eq, and, sql } from 'drizzle-orm';
import { triggerAutoGapAndRecommendations } from '../../services/autoAutomation.service.js';
import { LEETCODE_CASE_STUDIES } from '../../data/leetcodeCaseStudies.js';

async function ensureOfficialForUser(db, userId) {
  let [official] = await db.select({ id: officials.id }).from(officials).where(eq(officials.userId, userId));
  if (!official) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [newOfficial] = await db.insert(officials).values({
      userId,
      designation: user?.designation || 'Senior Statistical Officer (SSO)',
      department: user?.department || 'Data Informatics & Innovation Division (DIID)',
      cadre: user?.cadre || 'ISS (Indian Statistical Service)',
      experienceYears: 5,
      education: 'M.Sc. in Statistics / Agricultural Statistics (IASRI)',
      preferredLanguage: 'en',
    }).returning();
    official = newOfficial;
  }
  return official;
}

export async function startAssessmentAttemptController(req, res, next) {
  try {
    const userId = req.auth.userId;
    const { assessmentId } = req.body;

    if (!assessmentId) {
      return res.status(400).json({ message: 'assessmentId is required.' });
    }

    const db = getDb();
    const official = await ensureOfficialForUser(db, userId);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assessmentId);
    let resolvedAssessmentId = assessmentId;
    let assessment = null;

    if (isUuid) {
      const [found] = await db.select().from(assessments).where(eq(assessments.id, assessmentId));
      assessment = found;
    }

    if (!assessment) {
      // Find an existing diagnostic assessment or create one
      const [existingDiag] = await db
        .select()
        .from(assessments)
        .where(eq(assessments.title, 'MoSPI Diagnostic Assessment: Survey & Statistical Competencies'));
      if (existingDiag) {
        assessment = existingDiag;
        resolvedAssessmentId = existingDiag.id;
      } else {
        const [anyComp] = await db.select().from(competencies).limit(1);
        const [newAssessment] = await db
          .insert(assessments)
          .values({
            title: 'MoSPI Diagnostic Assessment: Survey & Statistical Competencies',
            competencyId: anyComp?.id || null,
            totalQuestions: 5,
          })
          .returning();
        assessment = newAssessment;
        resolvedAssessmentId = newAssessment.id;
      }
    }

    // Fetch questions for this assessment
    let qList = await db.select().from(questions).where(eq(questions.assessmentId, resolvedAssessmentId));

    // If assessment has no seeded questions yet, auto-populate deep MoSPI LeetCode-structured case study questions
    if (!qList || qList.length === 0) {
      const caseStudyQuestions = LEETCODE_CASE_STUDIES.map((cs) => ({
        assessmentId: resolvedAssessmentId,
        stem: cs.stem,
        options: cs.options,
        correctAnswer: cs.correctAnswer || 0,
        explanation: cs.explanation,
        bloomLevel: cs.bloomLevel,
      }));

      qList = await db.insert(questions).values(caseStudyQuestions).returning().catch(() => caseStudyQuestions);
    }

    // Check if an in-progress attempt already exists (interruption recovery)
    const existingResult = await db.execute(`
      SELECT * FROM assessment_attempts
      WHERE official_id = '${official.id}' AND assessment_id = '${resolvedAssessmentId}' AND status = 'IN_PROGRESS'
      ORDER BY started_at DESC LIMIT 1
    `);

    const existingAttempt = (existingResult.rows || existingResult)[0];

    if (existingAttempt) {
      return res.status(200).json({
        message: 'Resuming existing assessment attempt.',
        attempt: existingAttempt,
        assessment,
        questions: qList,
      });
    }

    // Create new assessment attempt
    const newAttemptResult = await db.execute(`
      INSERT INTO assessment_attempts (assessment_id, official_id, status, time_limit_seconds, current_question_index, responses)
      VALUES ('${resolvedAssessmentId}', '${official.id}', 'IN_PROGRESS', 1800, 0, '[]'::jsonb)
      RETURNING *
    `);

    const newAttempt = (newAttemptResult.rows || newAttemptResult)[0];

    return res.status(201).json({
      message: 'New assessment attempt started.',
      attempt: newAttempt,
      assessment,
      questions: qList,
    });
  } catch (error) {
    return next(error);
  }
}

export async function saveAttemptProgressController(req, res, next) {
  try {
    const { attemptId } = req.params;
    const { currentQuestionIndex, responses } = req.body;
    const db = getDb();

    await db.execute(sql`
      UPDATE assessment_attempts
      SET current_question_index = ${parseInt(currentQuestionIndex) || 0},
          responses = ${JSON.stringify(responses || [])}::jsonb
      WHERE id = ${attemptId} AND status = 'IN_PROGRESS'
    `);

    return res.status(200).json({ message: 'Progress saved successfully.' });
  } catch (error) {
    return next(error);
  }
}

export async function submitAssessmentAttemptController(req, res, next) {
  try {
    const { attemptId } = req.params;
    const { responses } = req.body;
    const db = getDb();
    const userId = req.auth.userId;

    const official = await ensureOfficialForUser(db, userId);

    // Fetch attempt or auto-provision if missing
    let attempt = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attemptId);
    if (isUuid) {
      const attemptResult = await db.execute(`SELECT * FROM assessment_attempts WHERE id = '${attemptId}'`);
      attempt = (attemptResult.rows || attemptResult)[0];
    }

    if (!attempt) {
      // Find or create default diagnostic assessment
      let [diagAssessment] = await db
        .select()
        .from(assessments)
        .where(eq(assessments.title, 'MoSPI Diagnostic Assessment: Survey & Statistical Competencies'));
      if (!diagAssessment) {
        const [anyComp] = await db.select().from(competencies).limit(1);
        [diagAssessment] = await db
          .insert(assessments)
          .values({
            title: 'MoSPI Diagnostic Assessment: Survey & Statistical Competencies',
            competencyId: anyComp?.id || null,
            totalQuestions: 5,
          })
          .returning();
      }

      const newAttemptRes = await db.execute(`
        INSERT INTO assessment_attempts (assessment_id, official_id, status, time_limit_seconds, current_question_index, responses)
        VALUES ('${diagAssessment.id}', '${official.id}', 'IN_PROGRESS', 1800, 0, '[]'::jsonb)
        RETURNING *
      `);
      attempt = (newAttemptRes.rows || newAttemptRes)[0];
    }

    if (attempt.status === 'COMPLETED') {
      return res.status(200).json({
        message: 'Attempt was already recorded.',
        attemptId: attempt.id,
        score: attempt.score,
        percentage: Math.round(((attempt.score || 4) / 5) * 100),
        correctCount: Math.round(Number(attempt.score || 4)),
        totalQuestions: 5,
        responses: Array.isArray(attempt.responses) ? attempt.responses : [],
      });
    }

    // Fetch assessment questions for scoring
    const qList = await db.select().from(questions).where(eq(questions.assessmentId, attempt.assessment_id));

    let correctCount = 0;
    const finalResponses = [];
    const userResponses = responses || attempt.responses || [];

    if (qList && qList.length > 0) {
      for (let i = 0; i < qList.length; i++) {
        const q = qList[i];
        const uResp = userResponses.find((r) => r.questionId === q.id) || userResponses[i];
        const selectedOption = uResp?.selectedOption;

        // Determine correctness
        const correctOptionIndex =
          typeof q.correctAnswer === 'number'
            ? q.correctAnswer
            : (q.options || []).findIndex((o) => o.isCorrect || o.correct);

        const isCorrect =
          selectedOption !== undefined && selectedOption === (correctOptionIndex >= 0 ? correctOptionIndex : 0);
        if (isCorrect) correctCount++;

        finalResponses.push({
          questionId: q.id,
          stem: q.stem,
          options: q.options,
          selectedOption,
          correctOptionIndex,
          isCorrect,
          explanation: q.explanation,
        });
      }
    } else {
      for (let i = 0; i < userResponses.length; i++) {
        const u = userResponses[i];
        const isCorrect = u.isCorrect ?? (u.selectedOption === (u.correctAnswer ?? 0));
        if (isCorrect) correctCount++;
        finalResponses.push({
          ...u,
          isCorrect,
        });
      }
    }

    const totalQuestions = qList && qList.length > 0 ? qList.length : userResponses.length || 1;
    const score = Number(((correctCount / totalQuestions) * 5.0).toFixed(1));
    // Update attempt status to COMPLETED
    await db.execute(sql`
      UPDATE assessment_attempts
      SET status = 'COMPLETED',
          submitted_at = NOW(),
          score = ${score},
          max_score = 5.0,
          responses = ${JSON.stringify(finalResponses)}::jsonb
      WHERE id = ${attempt.id}
    `);

    // Fetch assessment to find competencyId
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, attempt.assessment_id));

    let targetCompetencyId = assessment?.competencyId;
    if (!targetCompetencyId) {
      const [comp] = await db.select().from(competencies).limit(1);
      targetCompetencyId = comp?.id;
    }

    if (targetCompetencyId) {
      // Record evidence
      await db
        .insert(evidence)
        .values({
          officialId: official.id,
          competencyId: targetCompetencyId,
          evidenceType: 'KNOWLEDGE',
          score,
          maxScore: 5.0,
          weight: 0.4,
          confidence: 0.88,
          provenance: `Diagnostic Assessment Attempt (${correctCount}/${totalQuestions} correct)`,
        })
        .onConflictDoNothing();

      // Trigger auto-automation gap recalculation and recommendation updates
      await triggerAutoGapAndRecommendations(official.id).catch(() => null);
    }

    return res.status(200).json({
      success: true,
      message: 'Assessment attempt submitted successfully.',
      attemptId: attempt.id,
      score,
      maxScore: 5.0,
      correctCount,
      totalQuestions,
      percentage: Math.round((correctCount / totalQuestions) * 100),
      responses: finalResponses,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAttemptHistoryController(req, res, next) {
  try {
    const userId = req.auth.userId;
    const db = getDb();
    const official = await ensureOfficialForUser(db, userId);

    const result = await db.execute(`
      SELECT 
        aa.*, 
        COALESCE(a.title, 'MoSPI Diagnostic Assessment') AS assessment_title,
        COALESCE(c.code, 'STATISTICAL_ANALYSIS') AS competency_code,
        COALESCE(c.name, 'Statistical Analysis & Inference') AS competency_name,
        COALESCE(c.category, 'Statistical') AS category
      FROM assessment_attempts aa
      LEFT JOIN assessments a ON aa.assessment_id = a.id
      LEFT JOIN competencies c ON a.competency_id = c.id
      WHERE aa.official_id = '${official.id}'
      ORDER BY aa.started_at DESC
    `);

    return res.status(200).json({
      attempts: result.rows || result,
    });
  } catch (error) {
    return next(error);
  }
}
