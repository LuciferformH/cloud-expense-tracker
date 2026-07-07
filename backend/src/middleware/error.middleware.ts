// ==========================================
// Global Error Handler Middleware
// ==========================================
// Catches all unhandled errors and returns consistent responses.
// Distinguishes between operational errors (expected) and
// programmer errors (bugs that need investigation).
// Logs full error details in development only.

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default to 500 internal server error
  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || "Internal Server Error";
  const isOperational = (err as ApiError).isOperational ?? false;

  // Log full error in development for debugging
  if (env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      message: err.message,
      stack: err.stack,
      statusCode,
      isOperational,
    });
  }

  // Send structured error response
  res.status(statusCode).json({
    success: false,
    message: isOperational || env.NODE_ENV === "development"
      ? message
      : "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: Error) => {
  console.error("Unhandled Rejection:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
