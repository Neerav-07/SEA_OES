import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  assistantChatController,
  getAssistantHistoryController,
} from '../controllers/assistant.controller.js';

const router = Router();

// Post a chat message to AI Virtual Assistant (context-injected learner support)
router.post('/chat', verifyToken, assistantChatController);

// Get conversation history for current official
router.get('/history', verifyToken, getAssistantHistoryController);

export default router;
