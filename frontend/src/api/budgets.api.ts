// ==========================================
// Budgets API Endpoints
// ==========================================

import api from "./client";
import type { Budget, ApiResponse } from "../types";

export const budgetsApi = {
  getAll: () => api.get<ApiResponse<Budget[]>>("/budgets"),

  getById: (id: string) =>
    api.get<ApiResponse<Budget>>(`/budgets/${id}`),

  create: (data: {
    name: string;
    monthlyLimit: number;
    alertThreshold?: number;
    startDate: string;
    endDate?: string;
  }) => api.post<ApiResponse<Budget>>("/budgets", data),

  update: (
    id: string,
    data: Partial<{
      name: string;
      monthlyLimit: number;
      alertThreshold: number;
      startDate: string;
      endDate: string;
    }>
  ) => api.put<ApiResponse<Budget>>(`/budgets/${id}`, data),

  delete: (id: string) => api.delete(`/budgets/${id}`),

  getAlerts: () =>
    api.get<ApiResponse<any[]>>("/budgets/alerts"),
};
