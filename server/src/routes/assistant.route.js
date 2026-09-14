import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  assistantChatController,
  getAssistantHistoryController,
} from '../controllers/integrations/assistant.controller.js';

const router = Router();

const assistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Assistant request limit reached. Try again in one minute.' },
});

// Post a chat message to AI Virtual Assistant (context-injected learner support)
// With scope validation, injection detection, and rate limiting
router.post('/chat', verifyToken, assistantLimiter, assistantChatController);

// Get conversation history for current official
router.get('/history', verifyToken, getAssistantHistoryController);

export default router;
