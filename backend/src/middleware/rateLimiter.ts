import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV === 'development';

// General API rate limiter - DISABLED for testing
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 0, // 0 = no limit
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Skip all rate limiting
});

// Appointment limiter - DISABLED for testing
export const appointmentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 0, // 0 = no limit
  message: {
    success: false,
    error: 'Too many appointment requests. Please wait before trying again.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Skip all rate limiting
});

// User creation limiter - DISABLED for testing
export const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 0, // 0 = no limit
  message: {
    success: false,
    error: 'Too many user registration attempts. Please wait before trying again.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Skip all rate limiting
});