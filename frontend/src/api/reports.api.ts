// ==========================================
// Reports API Endpoints
// ==========================================

import api from "./client";

export const reportsApi = {
  exportReport: async (params: {
    startDate: string;
    endDate: string;
    format: "pdf" | "csv";
  }) => {
    const response = await api.get("/reports/export", {
      params,
      responseType: "blob",
    });
    return response;
  },
};
