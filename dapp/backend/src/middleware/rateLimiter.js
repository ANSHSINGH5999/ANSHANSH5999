import rateLimit from 'express-rate-limit';

/**
 * General rate limiter: 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

/**
 * AI endpoint rate limiter: 20 requests per 15 minutes
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI rate limit exceeded. Please wait before sending more messages.',
    code: 'AI_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    // Rate limit by IP
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});
