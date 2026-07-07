// ==========================================
// Budget Service
// ==========================================
// Manages budgets and calculates spending against limits.
// Triggers alerts when spending exceeds configured thresholds.

import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import { CreateBudgetInput, UpdateBudgetInput } from "../validators/budget.validator";

// ==========================================
// Create a new budget
// ==========================================
export const createBudget = async (userId: string, input: CreateBudgetInput) => {
  const budget = await prisma.budget.create({
    data: {
      userId,
      name: input.name,
      monthlyLimit: input.monthlyLimit,
      alertThreshold: input.alertThreshold || 80,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
    },
  });

  return budget;
};

// ==========================================
// Get all budgets for a user
// ==========================================
export const getBudgets = async (userId: string) => {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Calculate current spending for each budget
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      const spending = await prisma.expense.aggregate({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });

      const spent = Number(spending._sum.amount) || 0;
      const limit = Number(budget.monthlyLimit);
      const remaining = limit - spent;
      const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;
      const isOverThreshold = percentUsed >= Number(budget.alertThreshold);
      const isExceeded = spent > limit;

      return {
        ...budget,
        spent,
        remaining,
        percentUsed: Math.round(percentUsed * 100) / 100,
        isOverThreshold,
        isExceeded,
      };
    })
  );

  return budgetsWithSpending;
};

// ==========================================
// Get a single budget by ID
// ==========================================
export const getBudgetById = async (userId: string, budgetId: string) => {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!budget) {
    throw ApiError.notFound("Budget not found");
  }

  return budget;
};

// ==========================================
// Update a budget
// ==========================================
export const updateBudget = async (
  userId: string,
  budgetId: string,
  input: UpdateBudgetInput
) => {
  const existing = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!existing) {
    throw ApiError.notFound("Budget not found");
  }

  const budget = await prisma.budget.update({
    where: { id: budgetId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.monthlyLimit !== undefined && { monthlyLimit: input.monthlyLimit }),
      ...(input.alertThreshold !== undefined && { alertThreshold: input.alertThreshold }),
      ...(input.startDate !== undefined && { startDate: new Date(input.startDate) }),
      ...(input.endDate !== undefined && {
        endDate: input.endDate ? new Date(input.endDate) : null,
      }),
    },
  });

  return budget;
};

// ==========================================
// Delete a budget
// ==========================================
export const deleteBudget = async (userId: string, budgetId: string) => {
  const existing = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!existing) {
    throw ApiError.notFound("Budget not found");
  }

  await prisma.budget.delete({ where: { id: budgetId } });
};

// ==========================================
// Check budget alerts (called by scheduler or after expense creation)
// ==========================================
export const checkBudgetAlerts = async (userId: string) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      startDate: { lte: monthEnd },
      OR: [{ endDate: null }, { endDate: { gte: monthStart } }],
    },
  });

  const spending = await prisma.expense.aggregate({
    where: {
      userId,
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
  });

  const totalSpent = Number(spending._sum.amount) || 0;

  const alerts = budgets
    .map((budget) => {
      const limit = Number(budget.monthlyLimit);
      const percentUsed = limit > 0 ? (totalSpent / limit) * 100 : 0;
      const isOverThreshold = percentUsed >= Number(budget.alertThreshold);
      const isExceeded = totalSpent > limit;

      return {
        budgetId: budget.id,
        budgetName: budget.name,
        limit,
        spent: totalSpent,
        percentUsed: Math.round(percentUsed * 100) / 100,
        isOverThreshold,
        isExceeded,
      };
    })
    .filter((a) => a.isOverThreshold || a.isExceeded);

  return alerts;
};
