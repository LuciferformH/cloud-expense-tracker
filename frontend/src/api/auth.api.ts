// ==========================================
// Auth API Endpoints
// ==========================================
// Handles all authentication-related API calls.

import api from "./client";
import type { AuthTokens, ApiResponse } from "../types";

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/login", data),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/auth/refresh",
      { refreshToken }
    ),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<null>>("/auth/logout", { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>("/auth/forgot-password", { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post<ApiResponse<null>>("/auth/reset-password", data),

  me: () => api.get<ApiResponse<{ userId: string; email: string }>>("/auth/me"),
};
