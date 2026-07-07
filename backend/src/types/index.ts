// ==========================================
// Shared TypeScript Types
// ==========================================
// Common types used across the application.
// Keeps type definitions centralized and consistent.

import { Request } from "express";

// Extended Request type with authenticated user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Pagination query parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

// Expense filter parameters
export interface ExpenseFilterQuery extends PaginationQuery {
  search?: string;
  category?: string;
  cloudProvider?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Dashboard summary response
export interface DashboardSummary {
  totalMonthlyCost: number;
  previousMonthCost: number;
  percentChange: number;
  dailyCosts: { date: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number; color: string }[];
  recentExpenses: any[];
  activeBudgets: any[];
}

// Analytics response
export interface AnalyticsData {
  monthlyTrend: { month: string; amount: number }[];
  categoryDistribution: { category: string; amount: number; color: string }[];
  providerDistribution: { provider: string; amount: number }[];
  dailyCosts: { date: string; amount: number }[];
}

// AI suggestion response
export interface AISuggestion {
  type: "optimization" | "anomaly" | "forecast";
  title: string;
  description: string;
  estimatedSavings?: number;
  severity: "low" | "medium" | "high";
}
