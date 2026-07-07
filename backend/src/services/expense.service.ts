// ==========================================
// Expense Service
// ==========================================
// Handles expense CRUD operations with business logic.
// Supports complex filtering, sorting, and pagination.
// Checks budget thresholds after each expense creation.

import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilterInput,
} from "../validators/expense.validator";

// ==========================================
// Create a new expense
// ==========================================
export const createExpense = async (
  userId: string,
  input: CreateExpenseInput
) => {
  // Verify category belongs to user if provided
  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, userId },
    });
    if (!category) {
      throw ApiError.badRequest("Invalid category");
    }
  }

  const expense = await prisma.expense.create({
    data: {
      userId,
      amount: input.amount,
      description: input.description,
      date: new Date(input.date),
      categoryId: input.categoryId || null,
      cloudProvider: input.cloudProvider || null,
      serviceType: input.serviceType || null,
      region: input.region || null,
    },
    include: { category: { select: { id: true, name: true, color: true } } },
  });

  return expense;
};

// ==========================================
// Get all expenses with filtering, sorting, pagination
// ==========================================
export const getExpenses = async (
  userId: string,
  filters: ExpenseFilterInput
) => {
  const {
    page,
    limit,
    search,
    category,
    cloudProvider,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  } = filters;

  // Build dynamic where clause
  const where: any = { userId };

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { serviceType: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (cloudProvider) {
    where.cloudProvider = cloudProvider;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  // Build orderBy
  const orderBy: any = { [sortBy]: sortOrder };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return { expenses, total, page, limit };
};

// ==========================================
// Get a single expense by ID
// ==========================================
export const getExpenseById = async (userId: string, expenseId: string) => {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, userId },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true } },
    },
  });

  if (!expense) {
    throw ApiError.notFound("Expense not found");
  }

  return expense;
};

// ==========================================
// Update an expense
// ==========================================
export const updateExpense = async (
  userId: string,
  expenseId: string,
  input: UpdateExpenseInput
) => {
  // Verify expense exists and belongs to user
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, userId },
  });

  if (!existing) {
    throw ApiError.notFound("Expense not found");
  }

  // Verify category if being changed
  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, userId },
    });
    if (!category) {
      throw ApiError.badRequest("Invalid category");
    }
  }

  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.date !== undefined && { date: new Date(input.date) }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.cloudProvider !== undefined && {
        cloudProvider: input.cloudProvider,
      }),
      ...(input.serviceType !== undefined && { serviceType: input.serviceType }),
      ...(input.region !== undefined && { region: input.region }),
    },
    include: {
      category: { select: { id: true, name: true, color: true } },
    },
  });

  return expense;
};

// ==========================================
// Delete an expense
// ==========================================
export const deleteExpense = async (userId: string, expenseId: string) => {
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, userId },
  });

  if (!existing) {
    throw ApiError.notFound("Expense not found");
  }

  await prisma.expense.delete({ where: { id: expenseId } });
};

// ==========================================
// Get expense summary for a given month
// ==========================================
export const getMonthlyExpenseSummary = async (
  userId: string,
  year: number,
  month: number
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const [totalResult, categoryBreakdown, providerBreakdown, allExpensesInRange] =
    await Promise.all([
      // Total for the month
      prisma.expense.aggregate({
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      // Breakdown by category
      prisma.expense.groupBy({
        by: ["categoryId"],
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
      // Breakdown by cloud provider
      prisma.expense.groupBy({
        by: ["cloudProvider"],
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
      // All expenses for daily breakdown
      prisma.expense.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        select: { date: true, amount: true },
      }),
    ]);

  // Compute daily breakdown in JS
  const dailyMap: Record<string, number> = {};
  allExpensesInRange.forEach((e) => {
    const day = new Date(e.date).toISOString().split("T")[0];
    dailyMap[day] = (dailyMap[day] || 0) + Number(e.amount);
  });
  const dailyBreakdown = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Fetch category names
  const categoryIds = categoryBreakdown
    .map((c) => c.categoryId)
    .filter(Boolean) as string[];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return {
    total: Number(totalResult._sum.amount) || 0,
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: categoryMap.get(c.categoryId || "")?.name || "Uncategorized",
      amount: Number(c._sum.amount) || 0,
      color: categoryMap.get(c.categoryId || "")?.color || "#6B7280",
    })),
    providerBreakdown: providerBreakdown.map((p) => ({
      provider: p.cloudProvider || "Unknown",
      amount: Number(p._sum.amount) || 0,
    })),
    dailyBreakdown,
  };
};
