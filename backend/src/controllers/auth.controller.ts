// ==========================================
// Authentication Controller
// ==========================================
// Handles HTTP request/response for auth endpoints.
// Delegates business logic to auth service.
// Thin controller pattern - minimal logic here.

import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../types";

// POST /api/auth/register
export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    ApiResponse.created(res, "Registration successful", result);
  }
);

// POST /api/auth/login
export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    ApiResponse.success(res, "Login successful", result);
  }
);

// POST /api/auth/refresh
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    ApiResponse.success(res, "Token refreshed", result);
  }
);

// POST /api/auth/logout
export const logout = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    ApiResponse.success(res, "Logged out successfully");
  }
);

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body);
    ApiResponse.success(res, result.message);
  }
);

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);
    ApiResponse.success(res, result.message);
  }
);

// GET /api/auth/me - Get current user from token
export const me = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // User info is attached by auth middleware
    ApiResponse.success(res, "User info", {
      userId: req.user?.userId,
      email: req.user?.email,
    });
  }
);
