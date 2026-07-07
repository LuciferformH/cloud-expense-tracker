// ==========================================
// Analytics API Endpoints
// ==========================================

import api from "./client";
import type { DashboardSummary, AnalyticsData, ApiResponse } from "../types";

export const analyticsApi = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardSummary>>("/analytics/dashboard"),

  getAnalytics: (months?: number) =>
    api.get<ApiResponse<AnalyticsData>>("/analytics", {
      params: { months },
    }),
};
