import { rateLimit } from 'express-rate-limit';

const skip = () => process.env.NODE_ENV === 'test';

// Login/signup: slows brute force and credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  message: { success: false, message: 'Too many attempts, please try again in 15 minutes' },
});

// Everything under /api: a generous ceiling against floods/scrapers.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  message: { success: false, message: 'Too many requests, please slow down' },
});
