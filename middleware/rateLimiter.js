import rateLimit from "express-rate-limit";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for authentication routes

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20000, // Limit each IP to 5 login attempts per hour
  message: "Too many login attempts, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for order creation
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 10 orders per hour
  message: "Too many orders from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for invoice generation
export const invoiceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 invoice downloads per hour
  message: "Too many invoice downloads, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for product search
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 searches per 15 minutes
  message: "Too many search requests, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});


// Rate limiting for contact form submissions
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 5 submissions per hour
  message: 'Too many contact form submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
