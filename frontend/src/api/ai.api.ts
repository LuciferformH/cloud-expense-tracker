// ==========================================
// AI API Endpoints
// ==========================================

import api from "./client";
import type { AISuggestion, ApiResponse } from "../types";

interface ForecastData {
  historical: { month: string; amount: number; type: "actual" }[];
  forecast: { month: string; amount: number; type: "forecast" }[];
}

export const aiApi = {
  getSuggestions: () =>
    api.get<ApiResponse<AISuggestion[]>>("/ai/suggestions"),

  getForecast: (months?: number) =>
    api.get<ApiResponse<ForecastData>>("/ai/forecast", {
      params: { months },
    }),
};
