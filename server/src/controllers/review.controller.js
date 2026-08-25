import { getDb } from '../db/index.js';
import { questionVersions } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function getReviewQueueController(req, res, next) {
  try {
    const db = getDb();
    const { status } = req.query;

    let query = `
      SELECT qrq.*, 
             qv.stem, qv.options, qv.correct_answer, qv.rationale, qv.bloom_level, qv.validation_status,
             c.name AS competency_name, c.code AS competency_code
      FROM question_review_queue qrq
      JOIN question_versions qv ON qrq.question_version_id = qv.id
      LEFT JOIN competencies c ON qv.competency_id = c.id
    `;

    if (status) {
      query += ` WHERE qrq.status = '${status}'`;
    } else {
      query += ` WHERE qrq.status = 'PENDING'`;
    }

    query += ` ORDER BY qrq.created_at DESC`;

    const result = await db.execute(query);
    return res.status(200).json({
      queue: result.rows || result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function processReviewDecisionController(req, res, next) {
  try {
    const { id } = req.params; // review queue id
    const { decision, comment } = req.body; // 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED'
    const reviewerId = req.auth.userId;

    if (!['APPROVED', 'REJECTED', 'REVISION_REQUIRED'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision. Must be APPROVED, REJECTED, or REVISION_REQUIRED.' });
    }

    const db = getDb();

    // Update review queue item
    const updateRes = await db.execute(`
      UPDATE question_review_queue
      SET status = '${decision}',
          reviewer_id = '${reviewerId}',
          reviewer_comment = ${comment ? `'${comment.replace(/'/g, "''")}'` : 'NULL'},
          reviewed_at = NOW()
      WHERE id = '${id}'
      RETURNING *
    `);

    const updatedQueueItem = (updateRes.rows || updateRes)[0];
    if (!updatedQueueItem) {
      return res.status(404).json({ message: 'Review queue item not found.' });
    }

    // Also update question version review_status
    if (updatedQueueItem.question_version_id) {
      await db.execute(`
        UPDATE question_versions
        SET review_status = '${decision}'
        WHERE id = '${updatedQueueItem.question_version_id}'
      `);
    }

    return res.status(200).json({
      message: `Question review decision recorded as ${decision}.`,
      item: updatedQueueItem,
    });
  } catch (error) {
    return next(error);
  }
}
