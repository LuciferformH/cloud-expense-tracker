// ==========================================
// Express Application Setup
// ==========================================
// Configures Express middleware, security headers,
// CORS, rate limiting, and API routes.
// Separated from server.ts for testing purposes.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./config/cors";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { errorHandler } from "./middleware/error.middleware";
import routes from "./routes";

const app = express();

// ==========================================
// Security Middleware
// ==========================================
// Helmet sets various HTTP headers for security
app.use(helmet());

// CORS configuration
app.use(cors(corsOptions));

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Rate Limiting
// ==========================================
// Global rate limiter applied to all API routes
app.use("/api", apiLimiter);

// ==========================================
// API Routes
// ==========================================
app.use("/api", routes);

// ==========================================
// 404 Handler
// ==========================================
// Catch-all for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// Global Error Handler
// ==========================================
// Must be registered after all routes
app.use(errorHandler);

export default app;
