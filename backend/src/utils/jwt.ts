// ==========================================
// JWT Utility Functions
// ==========================================
// Handles JWT token generation and verification.
// Uses separate secrets for access and refresh tokens.
// Access tokens are short-lived (15min), refresh tokens long-lived (7 days).

import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";

export interface TokenPayload {
  userId: string;
  email: string;
}

// Generate a short-lived access token
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Generate a long-lived refresh token
export const generateRefreshToken = (): string => {
  return uuidv4() + "-" + Date.now().toString(36);
};

// Verify and decode an access token
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

// Calculate refresh token expiry date
export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN) || 7;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};
