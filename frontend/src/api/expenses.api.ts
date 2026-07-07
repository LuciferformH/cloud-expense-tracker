// ==========================================
// Expenses API Endpoints
// ==========================================
// CRUD operations for expense management.

import api from "./client";
import type { Expense, ApiResponse, PaginatedResponse } from "../types";

interface ExpenseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  cloudProvider?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const expensesApi = {
  getAll: (filters?: ExpenseFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    return api.get<PaginatedResponse<Expense[]>>(`/expenses?${params.toString()}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<Expense>>(`/expenses/${id}`),

  create: (data: {
    amount: number;
    description: string;
    date: string;
    categoryId?: string | null;
    cloudProvider?: string;
    serviceType?: string;
    region?: string;
  }) => api.post<ApiResponse<Expense>>("/expenses", data),

  update: (
    id: string,
    data: Partial<{
      amount: number;
      description: string;
      date: string;
      categoryId: string | null;
      cloudProvider: string;
      serviceType: string;
      region: string;
    }>
  ) => api.put<ApiResponse<Expense>>(`/expenses/${id}`, data),

  delete: (id: string) => api.delete(`/expenses/${id}`),
};
