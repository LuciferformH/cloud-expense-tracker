// ==========================================
// Standardized API Response Wrapper
// ==========================================
// Provides consistent response format across all endpoints.
// All responses follow: { success, message, data, pagination? }

import { Response } from "express";

export interface ApiResponseData<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponse {
  // Success response (200)
  static success<T>(res: Response, message: string, data?: T, statusCode = 200) {
    const response: ApiResponseData<T> = {
      success: true,
      message,
    };
    if (data !== undefined) {
      response.data = data;
    }
    return res.status(statusCode).json(response);
  }

  // Created response (201)
  static created<T>(res: Response, message: string, data?: T) {
    return ApiResponse.success(res, message, data, 201);
  }

  // Paginated success response (200)
  static paginated<T>(
    res: Response,
    message: string,
    data: T,
    page: number,
    limit: number,
    total: number
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  // No content response (204)
  static noContent(res: Response) {
    return res.status(204).send();
  }
}
