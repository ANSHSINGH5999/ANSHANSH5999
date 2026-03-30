import { Router } from 'express';
import { chat, getInsights } from '../services/aiService.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * POST /api/ai/chat
 * Send a message to NexAI
 * Body: { messages: [{role, content}], context?: object }
 */
router.post('/chat', aiLimiter, async (req, res) => {
  try {
    const { messages, context } = req.body;

    // Validation
    if (!messages) {
      return res.status(400).json({ error: 'messages field is required' });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    if (messages.length === 0) {
      return res.status(400).json({ error: 'messages array cannot be empty' });
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({
          error: 'Each message must have role and content fields',
        });
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return res.status(400).json({
          error: 'Message role must be user, assistant, or system',
        });
      }
      if (typeof msg.content !== 'string') {
        return res.status(400).json({ error: 'Message content must be a string' });
      }
      if (msg.content.length > 4000) {
        return res.status(400).json({ error: 'Message content too long (max 4000 chars)' });
      }
    }

    // Validate context if provided
    if (context !== null && context !== undefined && typeof context !== 'object') {
      return res.status(400).json({ error: 'context must be an object' });
    }

    const result = await chat(messages, context);

    res.json({
      success: true,
      message: result.message,
      model: result.model,
      usage: result.usage,
    });
  } catch (err) {
    console.error('AI chat error:', err);

    if (err.status === 401) {
      return res.status(503).json({
        error: 'AI service authentication failed. Check OPENAI_API_KEY.',
        code: 'AI_AUTH_ERROR',
      });
    }

    if (err.status === 429) {
      return res.status(429).json({
        error: 'OpenAI rate limit reached. Please try again later.',
        code: 'OPENAI_RATE_LIMIT',
      });
    }

    res.status(500).json({
      error: 'Failed to get AI response. Please try again.',
      code: 'AI_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/**
 * POST /api/ai/insights
 * Get portfolio insights from NexAI
 * Body: { portfolioData: object }
 */
router.post('/insights', aiLimiter, async (req, res) => {
  try {
    const { portfolioData } = req.body;

    if (!portfolioData) {
      return res.status(400).json({ error: 'portfolioData field is required' });
    }

    if (typeof portfolioData !== 'object') {
      return res.status(400).json({ error: 'portfolioData must be an object' });
    }

    const result = await getInsights(portfolioData);

    res.json({
      success: true,
      insights: result.insights,
      recommendations: result.recommendations,
      model: result.model,
    });
  } catch (err) {
    console.error('AI insights error:', err);
    res.status(500).json({
      error: 'Failed to generate insights. Please try again.',
      code: 'INSIGHTS_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

export default router;
