import { getDb } from '../../db/index.js';
import { officials, skillGaps, competencies, recommendations } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export async function assistantChatController(req, res, next) {
  try {
    const userId = req.auth.userId;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const db = getDb();
    const [official] = await db.select({
      id: officials.id,
      designation: officials.designation,
      department: officials.department,
      cadre: officials.cadre,
    }).from(officials).where(eq(officials.userId, userId));

    if (!official) {
      return res.status(404).json({ message: 'Official profile not found.' });
    }

    // Fetch official's current active skill gaps with competency names
    const gapsResult = await db.execute(`
      SELECT sg.*, c.name AS competency_name, c.code AS competency_code
      FROM skill_gaps sg
      JOIN competencies c ON sg.competency_id = c.id
      WHERE sg.official_id = '${official.id}'
      ORDER BY sg.learning_priority DESC LIMIT 5
    `);

    const userGaps = gapsResult.rows || gapsResult;

    // Fetch top active recommendations
    const recsResult = await db.execute(`
      SELECT r.title, r.provider, r.reason
      FROM recommendations r
      WHERE r.official_id = '${official.id}'
      ORDER BY r.created_at DESC LIMIT 3
    `);

    const userRecs = recsResult.rows || recsResult;

    // Construct context payload
    const contextSnapshot = {
      officialName: req.auth.name,
      designation: official.designation,
      department: official.department,
      cadre: official.cadre,
      topGaps: userGaps.map(g => ({
        competency: g.competency_name,
        code: g.competency_code,
        severity: g.gap_severity,
        category: g.category,
      })),
      recommendations: userRecs.map(r => ({ title: r.title, provider: r.provider })),
    };

    let replyMessage = '';

    // Attempt calling Python ML service
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: contextSnapshot,
        }),
      });

      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        replyMessage = mlData.reply || mlData.message;
      }
    } catch {
      // Fallback: Intelligent domain-aware response generator
      replyMessage = generateDomainAssistantFallback(message, contextSnapshot);
    }

    if (!replyMessage) {
      replyMessage = generateDomainAssistantFallback(message, contextSnapshot);
    }

    // Save conversation to DB (non-blocking)
    try {
      await db.execute(`
        INSERT INTO assistant_conversations (official_id, messages, context_snapshot)
        VALUES (
          '${official.id}',
          '${JSON.stringify([
            { role: 'user', content: message, ts: new Date().toISOString() },
            { role: 'assistant', content: replyMessage, ts: new Date().toISOString() },
          ]).replace(/'/g, "''")}'::jsonb,
          '${JSON.stringify(contextSnapshot).replace(/'/g, "''")}'::jsonb
        )
      `);
    } catch (dbErr) {
      console.warn('Non-blocking assistant conversation save warning:', dbErr.message);
    }

    return res.status(200).json({
      reply: replyMessage,
      contextUsed: contextSnapshot,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAssistantHistoryController(req, res, next) {
  try {
    const userId = req.auth.userId;
    const db = getDb();

    const [official] = await db.select({ id: officials.id }).from(officials).where(eq(officials.userId, userId));
    if (!official) {
      return res.status(404).json({ message: 'Official profile not found.' });
    }

    const result = await db.execute(`
      SELECT * FROM assistant_conversations
      WHERE official_id = '${official.id}'
      ORDER BY created_at DESC LIMIT 10
    `);

    return res.status(200).json({
      history: result.rows || result,
    });
  } catch (error) {
    return next(error);
  }
}

function generateDomainAssistantFallback(userMsg, context) {
  const msgLower = userMsg.toLowerCase();
  const gapsStr = context.topGaps.map(g => `${g.competency} (${g.category})`).join(', ') || 'No critical gaps currently identified';
  const recsStr = context.recommendations.map(r => `"${r.title}" via ${r.provider}`).join(', ') || 'iGOT Survey Design & Python Data Analysis';

  if (msgLower.includes('gap') || msgLower.includes('weak') || msgLower.includes('skill')) {
    return `Namaste ${context.officialName}! Based on your current profile as a ${context.designation} (${context.department}), your top priority skill gaps are: **${gapsStr}**. I recommend starting with ${recsStr} to bridge these requirements.`;
  }

  if (msgLower.includes('score') || msgLower.includes('calculate') || msgLower.includes('esi') || msgLower.includes('how')) {
    return `Your competency estimates are calculated using Kshamata's Evidence Sufficiency Index (ESI). It combines knowledge tests, scenario application, and supervisor verification rather than raw course completion. High-confidence estimates (>80%) require multiple diverse evidence items.`;
  }

  if (msgLower.includes('igot') || msgLower.includes('course') || msgLower.includes('recommend')) {
    return `Based on your FRAC role requirements, here are your top recommended learning modules on iGOT Karmayogi & NSSTA TPAC: ${recsStr}. You can enrol directly from your Learning Path tab!`;
  }

  if (msgLower.includes('practice') || msgLower.includes('quiz') || msgLower.includes('question')) {
    return `Ready for practice? You can take a 10-question diagnostic quiz or launch instant feedback mode in the Assessment tab to evaluate your understanding of Official Statistics and Data Analytics!`;
  }

  return `Hello ${context.officialName}! I am your Kshamata AI Capacity Building Assistant for India's Official Statistical System. You currently have ${context.topGaps.length} identified competency gap(s). How can I assist your learning journey today?`;
}
