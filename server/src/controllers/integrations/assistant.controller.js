import crypto from 'node:crypto';
import { getDb } from '../../db/index.js';
import { aiGuardrailResults, aiRuns, officials } from '../../db/schema/index.js';
import { eq, sql } from 'drizzle-orm';
import {
  classifyQueryScope,
  detectInjectionAttempts,
  buildAuthorizedContext,
  validateOutput,
  auditAssistantInteraction,
  generateRefusalMessage,
  formatResponseWithCitations,
} from '../../services/assistant.service.js';
import {
  AI_POLICY_VERSION,
  evaluateAssistantInput,
  pseudonymousTraceId,
  redactSensitiveText,
  SAFE_ASSISTANT_REFUSAL,
} from '../../utils/aiGuardrails.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT_MS = 15000; // 15 second timeout for ML service

/**
 * POST /assistant/chat
 * Process user query with scope validation and citation tracking
 */
export async function assistantChatController(req, res, next) {
  try {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    const userId = req.auth.userId;
    const { message } = req.body || {};

    // Validate message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ 
        message: 'Message is required and must be a non-empty string.' 
      });
    }

    if (message.length > 500) {
      return res.status(400).json({ 
        message: 'Message must not exceed 500 characters.' 
      });
    }

    const db = getDb();

    // Fetch official profile (parameterized query)
    const [official] = await db
      .select({
        id: officials.id,
        designation: officials.designation,
        department: officials.department,
        cadre: officials.cadre,
      })
      .from(officials)
      .where(eq(officials.userId, userId));

    if (!official) {
      return res.status(404).json({ 
        message: 'Official profile not found.' 
      });
    }

    const inputGuard = evaluateAssistantInput(message);
    const traceSubject = pseudonymousTraceId(official.id);
    if (!inputGuard.allowed) {
      await persistAssistantAudit(db, {
        generation: {
          request_id: requestId,
          provider: 'local-policy',
          model: 'deterministic-guardrail',
          prompt_version: null,
          latency_ms: Date.now() - startedAt,
          fallback_from: null,
          generation_parameters: { trace_subject: traceSubject },
        },
        guardrails: [{ ...inputGuard, stage: 'INPUT' }],
      });
      return res.status(200).json({
        reply: SAFE_ASSISTANT_REFUSAL,
        scopeClassification: 'guardrail',
        citations: [],
        refusal: true,
        guardrail: inputGuard,
      });
    }

    // Step 1: Classify query scope
    const scopeClassification = classifyQueryScope(message);

    // Step 2: Detect injection attempts (before calling ML service)
    const injectionCheck = detectInjectionAttempts(message);
    if (injectionCheck.isSuspicious) {
      const refusalReply = `I detected an unusual pattern in your message. For security, please rephrase your question.`;
      
      // Audit the refusal
      await auditAssistantInteraction(
        official.id,
        message,
        refusalReply,
        { isApproved: false, scope: 'injection_attempt' },
        []
      );

      return res.status(200).json({
        reply: refusalReply,
        scopeClassification: 'injection_attempt',
        citations: [],
        refusal: true,
        safePrompts: [
          'What are my current skill gaps?',
          'Which courses are recommended for me?',
          'How is my score calculated?',
        ],
      });
    }

    // Step 3: If out-of-scope or unclear, refuse before calling ML service
    if (!scopeClassification.isApproved) {
      const refusalReply = generateRefusalMessage(scopeClassification, req.auth.name);
      
      // Audit the refusal
      await auditAssistantInteraction(
        official.id,
        message,
        refusalReply,
        scopeClassification,
        []
      );

      return res.status(200).json({
        reply: refusalReply,
        scopeClassification: scopeClassification.scope,
        citations: [],
        refusal: true,
        safePrompts: [
          'What are my current skill gaps?',
          'Which courses are recommended for me?',
          'How is my score calculated?',
        ],
      });
    }

    // Step 4: Build authorized context (approved data only)
    const contextSnapshot = await buildAuthorizedContext(official, userId, req.auth.name);

    let mlResponse = null;
    let replyMessage = '';
    let citations = [];

    // Step 5: Call ML service for approved queries
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const mlResponse_raw = await fetch(`${ML_SERVICE_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Kshamata-AssistantController/1.0',
        },
        body: JSON.stringify({
          message,
          context: contextSnapshot,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (mlResponse_raw.ok) {
        mlResponse = await mlResponse_raw.json();
        replyMessage = mlResponse.reply || '';
        citations = mlResponse.citations || [];
      } else {
        console.warn('ML service returned error:', mlResponse_raw.status);
      }
    } catch (mlError) {
      console.warn('ML service call failed:', mlError.message);
      // Will fall back to graceful refusal below
    }

    // Step 6: Validate output if we got a response from ML service
    if (replyMessage) {
      const validation = validateOutput(replyMessage, official.id);
      if (!validation.isValid) {
        console.warn('Output validation failed:', validation.violations);
        replyMessage = ''; // Clear invalid response
      }
    }

    // Step 7: Fallback if no valid response from ML service
    if (!replyMessage) {
      replyMessage = `I'm unable to process your request at the moment. Please try again shortly or contact your administrator if the issue persists.`;
    }
    const outputGuard = mlResponse?.guardrail || inputGuard;
    if (!outputGuard.allowed) {
      replyMessage = SAFE_ASSISTANT_REFUSAL;
      citations = [];
    }
    replyMessage = redactSensitiveText(replyMessage);

    const generation = mlResponse?.generation || {
      request_id: requestId,
      provider: 'local-fallback',
      model: 'deterministic-assistant',
      prompt_version: AI_POLICY_VERSION,
      latency_ms: Date.now() - startedAt,
      fallback_from: 'ml-service',
      generation_parameters: { trace_subject: traceSubject },
    };
    await persistAssistantAudit(db, {
      generation,
      policyVersion: mlResponse?.policy_version || AI_POLICY_VERSION,
      guardrails: [
        { ...inputGuard, stage: 'INPUT' },
        { ...outputGuard, stage: 'OUTPUT' },
      ],
    });

    // Step 8: Format response with citations
    const formattedReply = formatResponseWithCitations(replyMessage, citations);

    // Step 9: Save conversation to DB (non-blocking, parameterized query)
    const conversationData = {
      user: { role: 'user', content: redactSensitiveText(message), ts: new Date().toISOString() },
      assistant: { role: 'assistant', content: formattedReply, ts: new Date().toISOString() },
    };

    try {
      await db.execute(sql`
        INSERT INTO assistant_conversations
         (official_id, messages, context_snapshot, expires_at)
         VALUES (${official.id}, ${JSON.stringify([conversationData.user, conversationData.assistant])}::jsonb, ${JSON.stringify(contextSnapshot)}::jsonb, NOW() + INTERVAL '30 days')
      `);
    } catch (dbErr) {
      console.warn('Non-blocking assistant conversation save warning:', dbErr.message);
    }

    // Step 10: Audit successful interaction
    await auditAssistantInteraction(
      official.id,
      message,
      formattedReply,
      scopeClassification,
      citations
    );

    return res.status(200).json({
      reply: formattedReply,
      scopeClassification: scopeClassification.scope,
      citations,
      refusal: false,
      guardrail: {
        allowed: Boolean(outputGuard.allowed),
        policyVersion: mlResponse?.policy_version || AI_POLICY_VERSION,
      },
      safePrompts: [
        'What are my current skill gaps?',
        'Which courses are recommended for me?',
        'How is my score calculated?',
      ],
    });
  } catch (error) {
    return next(error);
  }
}

async function persistAssistantAudit(db, { generation, guardrails, policyVersion = AI_POLICY_VERSION }) {
  try {
    const [run] = await db.insert(aiRuns).values({
      requestId: generation.request_id,
      useCase: 'assistant',
      provider: generation.provider,
      model: generation.model,
      promptVersion: generation.prompt_version,
      policyVersion,
      status: guardrails.every((guardrail) => guardrail.allowed) ? 'ALLOWED' : 'BLOCKED',
      fallbackFrom: generation.fallback_from,
      latencyMs: generation.latency_ms,
      generationParameters: generation.generation_parameters || {},
      guardrailSummary: { stages: guardrails },
    }).returning();
    await db.insert(aiGuardrailResults).values(guardrails.map((guardrail) => ({
      aiRunId: run.id,
      stage: guardrail.stage,
      allowed: Boolean(guardrail.allowed),
      violations: guardrail.violations || [],
      scores: guardrail.scores || {},
      policyVersion,
    })));
  } catch (auditError) {
    console.warn('Assistant AI audit save warning:', auditError.message);
  }
}

/**
 * GET /assistant/history
 * Retrieve conversation history for current official (parameterized query)
 */
export async function getAssistantHistoryController(req, res, next) {
  try {
    const userId = req.auth.userId;
    const db = getDb();

    // Fetch official ID (parameterized)
    const [official] = await db
      .select({ id: officials.id })
      .from(officials)
      .where(eq(officials.userId, userId));

    if (!official) {
      return res.status(404).json({ 
        message: 'Official profile not found.' 
      });
    }

    // Fetch conversation history (parameterized query with LIMIT)
    const result = await db.execute(sql`
      SELECT id, messages, context_snapshot, created_at
      FROM assistant_conversations
      WHERE official_id = ${official.id}
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const conversations = (result.rows || result).map(row => ({
      id: row.id,
      messages: row.messages,
      contextSnapshot: row.context_snapshot,
      createdAt: row.created_at,
    }));

    return res.status(200).json({
      count: conversations.length,
      history: conversations,
    });
  } catch (error) {
    return next(error);
  }
}
