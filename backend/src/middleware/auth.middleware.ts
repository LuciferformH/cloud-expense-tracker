// ==========================================
// Authentication Middleware
// ==========================================
// Verifies JWT tokens from the Authorization header.
// Attaches user payload to request for downstream handlers.
// Returns 401 if token is missing, invalid, or expired.

import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("No token provided");
    }

    // Verify and decode the token
    const decoded = verifyAccessToken(token);

    // Attach user info to request for use in controllers/services
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return next(ApiError.unauthorized("Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(ApiError.unauthorized("Token expired"));
    }
    next(error);
  }
};
