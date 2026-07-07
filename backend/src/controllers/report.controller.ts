// ==========================================
// Report Controller
// ==========================================
// Handles PDF and CSV report generation and download.

import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as reportService from "../services/report.service";
import { AuthRequest } from "../types";

// GET /api/reports/export
export const exportReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { startDate, endDate, format } = req.query;

    if (!startDate || !endDate) {
      throw ApiError.badRequest("startDate and endDate are required");
    }

    if (format !== "pdf" && format !== "csv") {
      throw ApiError.badRequest("format must be 'pdf' or 'csv'");
    }

    const result = await reportService.generateReport({
      userId: req.user!.userId,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      format: format as "pdf" | "csv",
    });

    // Set headers for file download
    res.setHeader("Content-Type", result.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`
    );

    // Send the buffer
    res.send(result.buffer);
  }
);
