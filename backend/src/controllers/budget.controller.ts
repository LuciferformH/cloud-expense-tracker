// ==========================================
// Budget Controller
// ==========================================
// Handles HTTP request/response for budget operations.

import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as budgetService from "../services/budget.service";
import { AuthRequest } from "../types";

// POST /api/budgets
export const createBudget = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const budget = await budgetService.createBudget(req.user!.userId, req.body);
    ApiResponse.created(res, "Budget created", budget);
  }
);

// GET /api/budgets
export const getBudgets = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const budgets = await budgetService.getBudgets(req.user!.userId);
    ApiResponse.success(res, "Budgets retrieved", budgets);
  }
);

// GET /api/budgets/:id
export const getBudget = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const budget = await budgetService.getBudgetById(
      req.user!.userId,
      req.params.id as string
    );
    ApiResponse.success(res, "Budget retrieved", budget);
  }
);

// PUT /api/budgets/:id
export const updateBudget = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const budget = await budgetService.updateBudget(
      req.user!.userId,
      req.params.id as string,
      req.body
    );
    ApiResponse.success(res, "Budget updated", budget);
  }
);

// DELETE /api/budgets/:id
export const deleteBudget = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await budgetService.deleteBudget(req.user!.userId, req.params.id as string);
    ApiResponse.noContent(res);
  }
);

// GET /api/budgets/alerts
export const checkAlerts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const alerts = await budgetService.checkBudgetAlerts(req.user!.userId);
    ApiResponse.success(res, "Budget alerts", alerts);
  }
);
