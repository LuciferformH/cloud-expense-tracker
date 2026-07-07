// ==========================================
// AI Service
// ==========================================
// Provides AI-powered cost optimization suggestions.
// Uses rule-based analysis (can be extended with LLM APIs).
// Analyzes spending patterns, detects anomalies, and forecasts.

import { prisma } from "../config/database";
import { AISuggestion } from "../types";

// ==========================================
// Analyze spending and generate suggestions
// ==========================================
export const analyzeSpending = async (userId: string): Promise<AISuggestion[]> => {
  const suggestions: AISuggestion[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Current and previous month ranges
  const thisMonthStart = new Date(currentYear, currentMonth, 1);
  const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  // Fetch spending data for analysis
  const [thisMonthExpenses, lastMonthExpenses, allExpenses] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: thisMonthStart, lte: thisMonthEnd } },
      orderBy: { amount: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: new Date(currentYear - 1, 0, 1) } },
      orderBy: { date: "asc" },
    }),
  ]);

  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const lastMonthTotal = lastMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);

  // ==========================================
  // 1. Detect spending increase
  // ==========================================
  if (lastMonthTotal > 0) {
    const increase = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    if (increase > 20) {
      suggestions.push({
        type: "anomaly",
        title: "Significant Spending Increase Detected",
        description: `Your spending has increased by ${increase.toFixed(1)}% compared to last month ($${lastMonthTotal.toFixed(2)} → $${thisMonthTotal.toFixed(2)}). Review your recent expenses to identify the cause.`,
        severity: increase > 50 ? "high" : "medium",
      });
    }
  }

  // ==========================================
  // 2. Top spending optimization
  // ==========================================
  if (thisMonthExpenses.length > 0) {
    const topExpense = thisMonthExpenses[0];
    if (Number(topExpense.amount) > thisMonthTotal * 0.3) {
      suggestions.push({
        type: "optimization",
        title: "High Single-Expense Concentration",
        description: `"${topExpense.description}" accounts for ${((Number(topExpense.amount) / thisMonthTotal) * 100).toFixed(1)}% of your monthly spending ($${Number(topExpense.amount).toFixed(2)}). Consider right-sizing or exploring alternatives.`,
        estimatedSavings: Number(topExpense.amount) * 0.2,
        severity: "medium",
      });
    }
  }

  // ==========================================
  // 3. Provider-specific suggestions
  // ==========================================
  const providerTotals = thisMonthExpenses.reduce((acc, e) => {
    const provider = e.cloudProvider || "Unknown";
    acc[provider] = (acc[provider] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const sortedProviders = Object.entries(providerTotals).sort(([, a], [, b]) => b - a);
  if (sortedProviders.length > 1) {
    const [topProvider, topAmount] = sortedProviders[0];
    if (topAmount > thisMonthTotal * 0.7) {
      suggestions.push({
        type: "optimization",
        title: `${topProvider} Concentration Risk`,
        description: `${topAmount.toFixed(1)}% of your spending is on ${topProvider}. Consider multi-cloud strategies or reserved instances for cost savings.`,
        estimatedSavings: topAmount * 0.15,
        severity: "low",
      });
    }
  }

  // ==========================================
  // 4. Unused category detection
  // ==========================================
  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      expenses: {
        where: { date: { gte: thisMonthStart, lte: thisMonthEnd } },
      },
    },
  });

  const emptyCategories = categories.filter((c) => c.expenses.length === 0);
  if (emptyCategories.length > 0) {
    suggestions.push({
      type: "optimization",
      title: "Unused Categories Detected",
      description: `You have ${emptyCategories.length} categories with no expenses this month: ${emptyCategories.map((c) => c.name).join(", ")}. Consider cleaning up your category structure.`,
      severity: "low",
    });
  }

  // ==========================================
  // 5. Month-over-month trend forecast
  // ==========================================
  if (allExpenses.length >= 30) {
    const monthlyTotals: Record<string, number> = {};
    allExpenses.forEach((e) => {
      const monthKey = new Date(e.date).toISOString().slice(0, 7);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(e.amount);
    });

    const values = Object.values(monthlyTotals);
    const avgMonthly = values.reduce((s, v) => s + v, 0) / values.length;
    const trend = values.length >= 2
      ? (values[values.length - 1] - values[0]) / values.length
      : 0;

    const forecastedNextMonth = avgMonthly + trend;
    if (forecastedNextMonth > avgMonthly * 1.2) {
      suggestions.push({
        type: "forecast",
        title: "Spending Trend Alert",
        description: `Based on your spending pattern, next month's costs are forecasted at approximately $${forecastedNextMonth.toFixed(2)} (current average: $${avgMonthly.toFixed(2)}/month).`,
        severity: "medium",
      });
    }

    // Annual projection
    const annualProjection = forecastedNextMonth * 12;
    suggestions.push({
      type: "forecast",
      title: "Annual Cost Projection",
      description: `Based on current trends, your annual cloud costs are projected at approximately $${annualProjection.toFixed(2)}.`,
      estimatedSavings: annualProjection * 0.1,
      severity: "low",
    });
  }

  return suggestions;
};

// ==========================================
// Get spending forecast
// ==========================================
export const getForecast = async (userId: string, months: number = 6) => {
  const now = new Date();
  const historyStart = new Date(now);
  historyStart.setMonth(historyStart.getMonth() - 12);

  // Get historical monthly data
  const expenses = await prisma.expense.findMany({
    where: { userId, date: { gte: historyStart } },
    orderBy: { date: "asc" },
  });

  // Aggregate by month
  const monthlyTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const key = new Date(e.date).toISOString().slice(0, 7);
    monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(e.amount);
  });

  const historicalData = Object.entries(monthlyTotals).map(([month, amount]) => ({
    month,
    amount,
    type: "actual" as const,
  }));

  // Simple linear regression for forecasting
  const values = historicalData.map((d) => d.amount);
  const n = values.length;
  let forecast: { month: string; amount: number; type: "forecast" }[] = [];

  if (n >= 2) {
    const avgX = (n - 1) / 2;
    const avgY = values.reduce((s, v) => s + v, 0) / n;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - avgX) * (values[i] - avgY);
      denominator += (i - avgX) ** 2;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = avgY - slope * avgX;

    for (let i = 0; i < months; i++) {
      const forecastDate = new Date(now);
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);
      const monthKey = forecastDate.toISOString().slice(0, 7);
      const predictedAmount = Math.max(0, slope * (n + i) + intercept);

      forecast.push({
        month: monthKey,
        amount: Math.round(predictedAmount * 100) / 100,
        type: "forecast",
      });
    }
  }

  return { historical: historicalData, forecast };
};
