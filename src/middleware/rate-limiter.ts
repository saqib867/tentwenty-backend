import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many requests. Please try again after 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
