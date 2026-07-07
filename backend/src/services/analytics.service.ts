// ==========================================
// Analytics Service
// ==========================================
// Provides aggregated data for dashboard and analytics views.
// Uses database-level aggregation for performance.
// Returns data formatted for chart consumption.

import { prisma } from "../config/database";

// ==========================================
// Get dashboard summary
// ==========================================
export const getDashboardSummary = async (userId: string) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Current month range
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  // Previous month range
  const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  // Last 30 days for daily costs
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    currentMonthTotal,
    previousMonthTotal,
    recentExpenses,
    activeBudgets,
    allExpenses,
    allCategories,
  ] = await Promise.all([
    // Current month total
    prisma.expense.aggregate({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
      _count: true,
    }),
    // Previous month total
    prisma.expense.aggregate({
      where: { userId, date: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    }),
    // Recent expenses
    prisma.expense.findMany({
      where: { userId },
      include: {
        category: { select: { name: true, color: true } },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
    // Active budgets
    prisma.budget.findMany({
      where: {
        userId,
        startDate: { lte: monthEnd },
        OR: [{ endDate: null }, { endDate: { gte: monthStart } }],
      },
      take: 3,
    }),
    // All expenses for daily and category computation
    prisma.expense.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      select: { date: true, amount: true, categoryId: true },
    }),
    // All categories
    prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const currentTotal = Number(currentMonthTotal._sum.amount) || 0;
  const prevTotal = Number(previousMonthTotal._sum.amount) || 0;
  const percentChange =
    prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

  // Compute daily costs in JS
  const dailyMap: Record<string, number> = {};
  allExpenses.forEach((e) => {
    const day = new Date(e.date).toISOString().split("T")[0];
    dailyMap[day] = (dailyMap[day] || 0) + Number(e.amount);
  });
  const dailyCosts = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Compute category breakdown for current month
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));
  const catTotals: Record<string, number> = {};
  allExpenses.forEach((e) => {
    if (e.date >= monthStart && e.date <= monthEnd && e.categoryId) {
      catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + Number(e.amount);
    }
  });
  const categoryBreakdown = Object.entries(catTotals)
    .map(([catId, amount]) => ({
      category: categoryMap.get(catId)?.name || "Uncategorized",
      amount,
      color: categoryMap.get(catId)?.color || "#6B7280",
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return {
    totalMonthlyCost: currentTotal,
    previousMonthCost: prevTotal,
    percentChange: Math.round(percentChange * 100) / 100,
    expenseCount: currentMonthTotal._count,
    dailyCosts,
    categoryBreakdown,
    recentExpenses,
    activeBudgets,
  };
};

// ==========================================
// Get analytics data for charts
// ==========================================
export const getAnalytics = async (
  userId: string,
  months: number = 12
) => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - months);

  // Fetch all data using Prisma ORM (no raw SQL)
  const [expenses, categories] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: startDate } },
      select: { date: true, amount: true, categoryId: true, cloudProvider: true },
    }),
    prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Monthly trend
  const monthlyMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const month = new Date(e.date).toISOString().slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] || 0) + Number(e.amount);
  });
  const monthlyTrend = Object.entries(monthlyMap)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Category distribution
  const catTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const catId = e.categoryId || "none";
    catTotals[catId] = (catTotals[catId] || 0) + Number(e.amount);
  });
  const categoryDistribution = Object.entries(catTotals)
    .map(([catId, amount]) => ({
      category: categoryMap.get(catId)?.name || "Uncategorized",
      amount,
      color: categoryMap.get(catId)?.color || "#6B7280",
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Provider distribution
  const providerTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const provider = e.cloudProvider || "Unknown";
    providerTotals[provider] = (providerTotals[provider] || 0) + Number(e.amount);
  });
  const providerDistribution = Object.entries(providerTotals)
    .map(([provider, amount]) => ({ provider, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    monthlyTrend,
    categoryDistribution,
    providerDistribution,
  };
};
