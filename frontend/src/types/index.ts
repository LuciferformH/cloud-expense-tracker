// ==========================================
// TypeScript Type Definitions
// ==========================================
// Centralized type definitions shared across the frontend.
// Mirrors the backend API response shapes.

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface UserProfile extends User {
  _count: {
    expenses: number;
    categories: number;
    budgets: number;
  };
}

export interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  _count?: { expenses: number };
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  cloudProvider?: string | null;
  serviceType?: string | null;
  region?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  monthlyLimit: number;
  alertThreshold: number;
  startDate: string;
  endDate?: string | null;
  spent?: number;
  remaining?: number;
  percentUsed?: number;
  isOverThreshold?: boolean;
  isExceeded?: boolean;
}

export interface DashboardSummary {
  totalMonthlyCost: number;
  previousMonthCost: number;
  percentChange: number;
  expenseCount: number;
  dailyCosts: { date: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number; color: string }[];
  recentExpenses: Expense[];
  activeBudgets: Budget[];
}

export interface AnalyticsData {
  monthlyTrend: { month: string; amount: number }[];
  categoryDistribution: { category: string; amount: number; color: string }[];
  providerDistribution: { provider: string; amount: number }[];
}

export interface AISuggestion {
  type: "optimization" | "anomaly" | "forecast";
  title: string;
  description: string;
  estimatedSavings?: number;
  severity: "low" | "medium" | "high";
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthTokens {
  user: User;
  accessToken: string;
  refreshToken: string;
}
