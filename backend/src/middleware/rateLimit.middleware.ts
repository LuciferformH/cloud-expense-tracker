// ==========================================
// Rate Limiting Middleware
// ==========================================
// Protects against brute-force attacks and API abuse.
// Uses express-rate-limit with in-memory store.
// In production, use Redis store for distributed rate limiting.

import rateLimit from "express-rate-limit";

// General API rate limiter: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints: 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Report generation limiter: 5 requests per hour
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: "Too many report requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
