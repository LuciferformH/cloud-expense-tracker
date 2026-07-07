// ==========================================
// Expense Controller
// ==========================================
// Handles HTTP request/response for expense CRUD operations.
// Extracts user ID from authenticated request.

import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as expenseService from "../services/expense.service";
import { AuthRequest } from "../types";

// POST /api/expenses
export const createExpense = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const expense = await expenseService.createExpense(
      req.user!.userId,
      req.body
    );
    ApiResponse.created(res, "Expense created", expense);
  }
);

// GET /api/expenses
export const getExpenses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await expenseService.getExpenses(
      req.user!.userId,
      req.query as any
    );
    ApiResponse.paginated(
      res,
      "Expenses retrieved",
      result.expenses,
      result.page,
      result.limit,
      result.total
    );
  }
);

// GET /api/expenses/:id
export const getExpense = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const expense = await expenseService.getExpenseById(
      req.user!.userId,
      req.params.id as string
    );
    ApiResponse.success(res, "Expense retrieved", expense);
  }
);

// PUT /api/expenses/:id
export const updateExpense = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const expense = await expenseService.updateExpense(
      req.user!.userId,
      req.params.id as string,
      req.body
    );
    ApiResponse.success(res, "Expense updated", expense);
  }
);

// DELETE /api/expenses/:id
export const deleteExpense = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await expenseService.deleteExpense(req.user!.userId, req.params.id as string);
    ApiResponse.noContent(res);
  }
);
