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
    let qList = await db.select().from(questions).where(eq(questions.assessmentId, assessmentId));

    // If assessment has no seeded questions yet, auto-populate deep MoSPI case study questions across Bloom's taxonomy levels
    if (!qList || qList.length === 0) {
      const caseStudyQuestions = [
        {
          assessmentId,
          stem: 'CASE STUDY: NSS 79th Round Domestic Tourism Survey Audit\n\nDuring the data validation audit of the 79th Round National Sample Survey (NSS) covering domestic tourism expenditure, the Field Operations Division (FOD) reported a 14.2% unit non-response in rural sub-strata of Region IX. Preliminary analysis reveals that the non-response is concentrated among high-income agricultural households. As the Senior Statistical Officer in charge of data quality assurance, which weighting adjustment and calibration procedure must be applied to prevent downward bias in national expenditure estimates without inflating variance beyond acceptable design limits?',
          options: [
            { text: 'Execute GREG (Generalized Regression Estimator) calibration using land holding size and tractor ownership as auxiliary benchmark variables to adjust sample weights.', is_correct: true },
            { text: 'Apply simple mean imputation within the primary sampling unit (PSU) without modifying final multiplier weights.', is_correct: false },
            { text: 'Drop the non-responding households and re-scale sample weights uniformly across all urban and rural strata.', is_correct: false },
            { text: 'Substitute missing rural records with mean responses from neighboring district urban clusters.', is_correct: false }
          ],
          correctAnswer: 0,
          explanation: 'GREG calibration leverages known administrative benchmarks (land holdings) to re-calibrate sampling weights, neutralizing non-response bias while bounding variance under NSSO auditing standards.',
          bloomLevel: 'EVALUATE'
        },
        {
          assessmentId,
          stem: 'CASE STUDY: Consumer Price Index (CPI) Base-Year Revision & Deflation\n\nThe National Accounts Division (NAD) is revising the base year of the Consumer Price Index (Rural/Urban). During sectoral GVA estimation for the Unorganized Retail Trade sector, price deflators computed from the new CPI series indicate an anomalous 8.5% divergence when compared against the Wholesale Price Index (WPI) manufacturing deflator. Evaluating the methodological impact under SNA 2008 standards, how should the statistical analyst resolve this deflation discrepancy?',
          options: [
            { text: 'Construct a double-deflation index separating trade margins from physical output using sector-specific CPI service sub-indices.', is_correct: true },
            { text: 'Replace the entire CPI rural series with the aggregate WPI headline index for single-deflation of nominal GVA.', is_correct: false },
            { text: 'Apply unweighted geometric mean of WPI and CPI across all retail service commodity groups.', is_correct: false },
            { text: 'Adjust nominal turnover by the implicit GDP deflator from the previous quinquennial census.', is_correct: false }
          ],
          correctAnswer: 0,
          explanation: 'Double-deflation using sector-specific CPI trade sub-indices isolates real gross value added from price volatility under SNA 2008 guidelines.',
          bloomLevel: 'ANALYZE'
        },
        {
          assessmentId,
          stem: 'CASE STUDY: Python & R Microdata Cleaning Pipeline for Large-Scale Surveys\n\nA data informatics team at MoSPI DIID is building an automated ETL pipeline in Python (Pandas/Statsmodels) to ingest 5 million raw CAPI records from the Periodic Labour Force Survey (PLFS). The dataset exhibits structural outliers in weekly hours worked (values exceeding 168 hours) and inconsistent occupation codes (NCO-2015). Which programmatic validation rule enforces data integrity while preserving valid extreme values?',
          options: [
            { text: 'Implement winsorization at 99th percentile combined with regex verification against NCO-2015 official master lookup dictionaries.', is_correct: true },
            { text: 'Filter out all records where weekly hours worked exceed 40 hours.', is_correct: false },
            { text: 'Replace all invalid occupation codes with the modal code "9999".', is_correct: false },
            { text: 'Convert numeric wage fields to categorical strings prior to running statistical aggregations.', is_correct: false }
          ],
          correctAnswer: 0,
          explanation: 'Winsorization bounds extreme physical impossibilities (>168 hrs) while preserving high valid workloads, and regex dictionary lookup validates official NCO codes.',
          bloomLevel: 'APPLY'
        },
        {
          assessmentId,
          stem: 'CASE STUDY: Microdata Anonymization & Statistical Disclosure Control (SDC)\n\nPrior to releasing the public-use microdata file (PUMF) for the Annual Survey of Unincorporated Sector Enterprises (ASUSE), the Data Governance Committee requires strict compliance with NDSAP privacy directives. A risk audit reveals that certain enterprise units in niche 4-digit NIC codes can be re-identified using district location and turnover capital. What SDC technique balances disclosure protection with analytical utility for economic researchers?',
          options: [
            { text: 'Apply k-anonymity (k>=5) combined with microaggregation on turnover variables and top-coding on extreme revenue categories.', is_correct: true },
            { text: 'Suppress all district-level geographic identifiers across the entire dataset.', is_correct: false },
            { text: 'Add Gaussian random noise (+/- 50%) to all numerical variables regardless of re-identification risk.', is_correct: false },
            { text: 'Publish only national summary tables and delete the microdata repository.', is_correct: false }
          ],
          correctAnswer: 0,
          explanation: 'k-anonymity (k>=5) with microaggregation protects quasi-identifiers (district + capital) without destroying correlation structures required for econometric research.',
          bloomLevel: 'EVALUATE'
        },
        {
          assessmentId,
          stem: 'CASE STUDY: Multi-Stage Stratified Sampling Variance Estimation\n\nIn a two-stage stratified sampling design for rural household surveys, Primary Sampling Units (PSUs) are selected with Probability Proportional to Size (PPSWR), and Ultimate Sampling Units (USUs) are selected via systematic sampling. The calculated design effect (DEFF) is 2.85, indicating substantial intra-cluster correlation. To achieve a target margin of error of +/- 2.5% at 95% confidence, how must the sampling design be adjusted?',
          options: [
            { text: 'Increase the number of selected PSUs while decreasing the number of USUs sampled per PSU to reduce intra-cluster variance contribution.', is_correct: true },
            { text: 'Double the number of USUs sampled within each existing PSU without increasing the PSU sample count.', is_correct: false },
            { text: 'Switch from PPS sampling to simple random sampling without stratification.', is_correct: false },
            { text: 'Reduce the confidence level from 95% to 80% to force DEFF down to 1.0.', is_correct: false }
          ],
          correctAnswer: 0,
          explanation: 'High DEFF (2.85) indicates cluster homogeneity. Increasing the number of PSUs (clusters) while sampling fewer households per PSU decreases variance efficiently under fixed budget constraints.',
          bloomLevel: 'ANALYZE'
        }
      ];

      qList = await db.insert(questions).values(caseStudyQuestions).returning().catch(() => caseStudyQuestions);
    }

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
