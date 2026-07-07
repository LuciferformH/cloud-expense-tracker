// ==========================================
// AI Controller
// ==========================================
// Handles HTTP request/response for AI-powered features.

import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as aiService from "../services/ai.service";
import { AuthRequest } from "../types";

// GET /api/ai/suggestions
export const getSuggestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const suggestions = await aiService.analyzeSpending(req.user!.userId);
    ApiResponse.success(res, "AI suggestions", suggestions);
  }
);

// GET /api/ai/forecast
export const getForecast = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const months = parseInt(req.query.months as string) || 6;
    const forecast = await aiService.getForecast(req.user!.userId, months);
    ApiResponse.success(res, "Spending forecast", forecast);
  }
);
