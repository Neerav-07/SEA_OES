import { getDb } from '../../db/index.js';
import { officials, assessments, questions, evidence } from '../../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { triggerAutoGapAndRecommendations } from '../../services/autoAutomation.service.js';

export async function startAssessmentAttemptController(req, res, next) {
  try {
    const userId = req.auth.userId;
    const { assessmentId } = req.body;

    if (!assessmentId) {
      return res.status(400).json({ message: 'assessmentId is required.' });
    }

    const db = getDb();
    const [official] = await db.select({ id: officials.id }).from(officials).where(eq(officials.userId, userId));
    if (!official) {
      return res.status(404).json({ message: 'Official profile not found.' });
    }

    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, assessmentId));
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    // Fetch questions for this assessment
    const qList = await db.select().from(questions).where(eq(questions.assessmentId, assessmentId));

    // Check if an in-progress attempt already exists (interruption recovery)
    const existingResult = await db.execute(`
      SELECT * FROM assessment_attempts
      WHERE official_id = '${official.id}' AND assessment_id = '${assessmentId}' AND status = 'IN_PROGRESS'
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
      VALUES ('${assessmentId}', '${official.id}', 'IN_PROGRESS', 1800, 0, '[]'::jsonb)
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

    await db.execute(`
      UPDATE assessment_attempts
      SET current_question_index = ${parseInt(currentQuestionIndex) || 0},
          responses = '${JSON.stringify(responses || [])}'::jsonb
      WHERE id = '${attemptId}' AND status = 'IN_PROGRESS'
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

    // Fetch attempt
    const attemptResult = await db.execute(`SELECT * FROM assessment_attempts WHERE id = '${attemptId}'`);
    const attempt = (attemptResult.rows || attemptResult)[0];

    if (!attempt) {
      return res.status(404).json({ message: 'Assessment attempt not found.' });
    }

    if (attempt.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Attempt is already completed.' });
    }

    // Fetch assessment questions for scoring
    const qList = await db.select().from(questions).where(eq(questions.assessmentId, attempt.assessment_id));

    let correctCount = 0;
    const finalResponses = [];

    const userResponses = responses || attempt.responses || [];

    for (const q of qList) {
      const uResp = userResponses.find(r => r.questionId === q.id);
      const selectedOption = uResp?.selectedOption;
      
      // Determine correctness
      const correctOptionIndex = typeof q.correctAnswer === 'number' 
        ? q.correctAnswer 
        : (q.options || []).findIndex(o => o.isCorrect || o.correct);
      
      const isCorrect = selectedOption !== undefined && selectedOption === (correctOptionIndex >= 0 ? correctOptionIndex : 0);
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

    const totalQuestions = qList.length || 1;
    const score = Number(((correctCount / totalQuestions) * 5.0).toFixed(1));

    // Update attempt
    await db.execute(`
      UPDATE assessment_attempts
      SET status = 'COMPLETED',
          submitted_at = NOW(),
          score = ${score},
          max_score = 5.0,
          responses = '${JSON.stringify(finalResponses).replace(/'/g, "''")}'::jsonb
      WHERE id = '${attemptId}'
    `);

    // Fetch assessment to find competencyId
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, attempt.assessment_id));

    if (assessment?.competencyId) {
      // Record evidence
      await db.insert(evidence).values({
        officialId: attempt.official_id,
        competencyId: assessment.competencyId,
        evidenceType: 'KNOWLEDGE',
        score,
        maxScore: 5.0,
        weight: 0.4,
        confidence: 0.88,
        provenance: `Assessment Attempt (${correctCount}/${totalQuestions} correct)`,
      }).onConflictDoNothing();

      // Trigger auto-automation gap recalculation and recommendation updates
      await triggerAutoGapAndRecommendations(attempt.official_id);
    }

    return res.status(200).json({
      message: 'Assessment attempt submitted successfully.',
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

    const [official] = await db.select({ id: officials.id }).from(officials).where(eq(officials.userId, userId));
    if (!official) {
      return res.status(404).json({ message: 'Official profile not found.' });
    }

    const result = await db.execute(`
      SELECT aa.*, a.title AS assessment_title
      FROM assessment_attempts aa
      JOIN assessments a ON aa.assessment_id = a.id
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
