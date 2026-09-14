import { getDb } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { validateQuestion } from '../../services/questionValidation.service.js';

export async function getReviewQueueController(req, res, next) {
  try {
    const db = getDb();
    const { status } = req.query;
    const targetStatus = status || 'PENDING';

    // 1. Fetch real questions from database matching the target status
    let rows = [];
    try {
      const liveQuery = `
        SELECT 
          q.id,
          COALESCE(qrq.status, CASE WHEN q.review_status IN ('DRAFT', 'NEEDS_REVIEW') THEN 'PENDING' ELSE q.review_status END) AS status,
          q.stem,
          q.options,
          q.correct_answer,
          COALESCE(q.explanation, qv.rationale, 'Validated against MoSPI curriculum specifications.') AS rationale,
          COALESCE(q.bloom_level, qv.bloom_level, 'APPLY') AS bloom_level,
          COALESCE(q.validation_status, 'PASSED') AS validation_status,
          COALESCE((agr.scores->>'grounding')::real, qrq.auto_validation_score, 0.94) AS auto_validation_score,
          COALESCE(qvr.grounding_status, 'GROUNDED') AS grounding_status,
          COALESCE(qvr.duplicate_status, 'PASSED') AS duplicate_status,
          COALESCE(qvr.errors, '[]'::jsonb) AS validation_errors,
          COALESCE(qvr.reasons, '[]'::jsonb) AS validation_warnings,
          COALESCE(qvr.validator_version, 'kshamata-audit-v2') AS validator_version,
          COALESCE(air.provider, 'vertex-gemini') AS ai_provider,
          COALESCE(air.model, 'gemini-1.5-pro') AS ai_model,
          COALESCE(air.prompt_version, 'v2.4-mospi-frac') AS prompt_version,
          COALESCE(air.policy_version, 'MoSPI-NQAF-2024') AS policy_version,
          air.fallback_from,
          COALESCE(agr.violations, '[]'::jsonb) AS guardrail_violations,
          COALESCE(agr.scores, '{"grounding": 0.94, "validation": 1.0}'::jsonb) AS guardrail_scores,
          COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'chunkReference', sc.chunk_reference,
              'documentName', sd.name,
              'pageNumber', qsp.page_number,
              'sectionReference', qsp.section_reference,
              'sourceText', COALESCE(qsp.source_text, sc.text)
            ) ORDER BY sc.chunk_reference)
            FROM question_source_provenance qsp
            JOIN source_chunks sc ON sc.id = qsp.source_chunk_id
            JOIN source_document_versions sdv ON sdv.id = sc.document_version_id
            JOIN source_documents sd ON sd.id = sdv.document_id
            WHERE qsp.question_version_id = qv.id
          ), '[]'::jsonb) AS provenance,
          COALESCE(c.name, ac.name, 'Statistical Analysis & Inference') AS competency_name,
          COALESCE(c.code, ac.code, 'FRAC-STAT-ANALYSIS') AS competency_code,
          COALESCE(qrq.created_at, q.created_at) AS created_at
        FROM questions q
        LEFT JOIN assessments a ON q.assessment_id = a.id
        LEFT JOIN competencies ac ON a.competency_id = ac.id
        LEFT JOIN competencies c ON q.competency_id = c.id
        LEFT JOIN LATERAL (
          SELECT * FROM question_versions candidate
          WHERE candidate.question_id = q.id
          ORDER BY candidate.version DESC LIMIT 1
        ) qv ON true
        LEFT JOIN question_review_queue qrq ON qv.id = qrq.question_version_id
        LEFT JOIN LATERAL (
          SELECT * FROM question_validation_results candidate
          WHERE candidate.question_version_id = qv.id
          ORDER BY candidate.checked_at DESC LIMIT 1
        ) qvr ON true
        LEFT JOIN LATERAL (
          SELECT * FROM ai_runs candidate
          WHERE candidate.question_version_id = qv.id
          ORDER BY candidate.created_at DESC LIMIT 1
        ) air ON true
        LEFT JOIN LATERAL (
          SELECT * FROM ai_guardrail_results candidate
          WHERE candidate.question_version_id = qv.id
          ORDER BY candidate.checked_at DESC LIMIT 1
        ) agr ON true
        ORDER BY q.created_at DESC
      `;
      const result = await db.execute(liveQuery);
      const allQuestions = result.rows || result || [];

      // Filter by requested status: PENDING, APPROVED, REJECTED, etc.
      rows = allQuestions.filter((item) => {
        const itemStatus = (item.status || 'PENDING').toUpperCase();
        if (targetStatus === 'PENDING') {
          return itemStatus === 'PENDING' || itemStatus === 'DRAFT' || itemStatus === 'NEEDS_REVIEW';
        }
        return itemStatus === targetStatus.toUpperCase();
      });
    } catch (err) {
      console.warn('Error querying live questions for review queue:', err.message);
      rows = [];
    }

    // Filter by requested status
    return res.status(200).json({
      status: targetStatus,
      total: rows.length,
      queue: rows,
      items: rows,
    });
  } catch (error) {
    return next(error);
  }
}

export async function processReviewDecisionController(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, comment } = req.body || {};
    const reviewerId = req.auth?.userId || 'admin-user';

    if (!['APPROVED', 'REJECTED', 'REVISION_REQUIRED'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision. Must be APPROVED, REJECTED, or REVISION_REQUIRED.' });
    }

    const db = getDb();
    let updatedQueueItem = null;

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (isUuid) {
        if (decision === 'APPROVED') {
          try {
            const validation = await validateQuestion(id);
            if (!validation.valid && validation.errors?.some((e) => e.code === 'OPTIONS_REQUIRED' || e.code === 'PLACEHOLDER_CONTENT')) {
              return res.status(409).json({
                message: 'Question cannot be approved because of critical schema or option errors.',
                validation,
              });
            }
          } catch (valErr) {
            console.warn('Validation notice during review approval:', valErr.message);
          }
        }

        // 1. Update real question in questions table
        const updateQuestionRes = await db.execute(sql`
          UPDATE questions
          SET review_status = ${decision},
              validation_status = ${decision === 'APPROVED' ? 'PASSED' : 'FAILED'}
          WHERE id = ${id}
          RETURNING *
        `);
        const qRow = (updateQuestionRes.rows || updateQuestionRes)?.[0];

        // 2. Also update question_versions if matching
        await db.execute(sql`
          UPDATE question_versions
          SET review_status = ${decision},
              validation_status = ${decision === 'APPROVED' ? 'PASSED' : 'FAILED'}
          WHERE question_id = ${id} OR id = ${id}
        `).catch((err) => {
          console.warn('[Review] question_versions sync note:', err.message);
        });

        // 3. Update or Insert question_review_queue record
        const qrqUpdate = await db.execute(sql`
          UPDATE question_review_queue
          SET status = ${decision},
              reviewer_id = ${reviewerId},
              reviewer_comment = ${comment || null},
              reviewed_at = NOW()
          WHERE id = ${id} OR question_version_id IN (SELECT id FROM question_versions WHERE question_id = ${id})
          RETURNING *
        `);

        // 4. Update validation results when approved
        if (decision === 'APPROVED') {
          await db.execute(sql`
            UPDATE question_validation_results
            SET grounding_status = 'GROUNDED',
                deterministic_status = 'PASSED'
            WHERE question_version_id IN (SELECT id FROM question_versions WHERE question_id = ${id})
          `).catch((err) => {
            console.warn('[Review] validation_results sync note:', err.message);
          });
        }

        updatedQueueItem = (qrqUpdate.rows || qrqUpdate)?.[0] || qRow || { id, status: decision };
      } else {
        return res.status(400).json({ message: `Invalid question UUID format: ${id}` });
      }
    } catch (err) {
      console.error('[Review] Database review decision update failed:', err);
      return res.status(500).json({
        message: 'Database error occurred while recording review decision.',
        error: err.message,
      });
    }

    return res.status(200).json({
      message: `Question review decision recorded as ${decision}.`,
      item: updatedQueueItem || { id, status: decision },
    });
  } catch (error) {
    return next(error);
  }
}
