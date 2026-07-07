// ==========================================
// Analytics Controller
// ==========================================
// Handles HTTP request/response for analytics data.

import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as analyticsService from "../services/analytics.service";
import { AuthRequest } from "../types";

// GET /api/analytics/dashboard
export const getDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const summary = await analyticsService.getDashboardSummary(
      req.user!.userId
    );
    ApiResponse.success(res, "Dashboard summary", summary);
  }
);

// GET /api/analytics
export const getAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const months = parseInt(req.query.months as string) || 12;
    const analytics = await analyticsService.getAnalytics(
      req.user!.userId,
      months
    );
    ApiResponse.success(res, "Analytics data", analytics);
  }
);
