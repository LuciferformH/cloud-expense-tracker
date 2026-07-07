// ==========================================
// Report Service
// ==========================================
// Generates PDF and CSV reports for expense data.
// Fetches expenses within date range and delegates
// to the appropriate generator utility.

import { prisma } from "../config/database";
import { generateExpenseReportPDF } from "../utils/pdfGenerator";
import { generateExpenseCSV } from "../utils/csvGenerator";

interface ReportParams {
  userId: string;
  startDate: Date;
  endDate: Date;
  format: "pdf" | "csv";
}

// ==========================================
// Generate expense report
// ==========================================
export const generateReport = async (params: ReportParams) => {
  const { userId, startDate, endDate, format } = params;

  // Fetch expenses within date range with category info
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  // Calculate total
  const totalAmount = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Format period string
  const period = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  const generatedAt = new Date().toLocaleString();

  if (format === "pdf") {
    const pdfBuffer = await generateExpenseReportPDF({
      title: "Cloud Expense Report",
      period,
      totalAmount,
      expenses: expenses.map((e) => ({
        date: new Date(e.date).toLocaleDateString(),
        description: e.description,
        category: e.category?.name || "Uncategorized",
        cloudProvider: e.cloudProvider || "N/A",
        amount: Number(e.amount),
      })),
      generatedAt,
    });

    return {
      buffer: pdfBuffer,
      contentType: "application/pdf",
      filename: `expense-report-${startDate.toISOString().split("T")[0]}.pdf`,
    };
  }

  // CSV format
  const csvData = generateExpenseCSV(
    expenses.map((e) => ({
      date: new Date(e.date).toLocaleDateString(),
      description: e.description,
      category: e.category?.name || "Uncategorized",
      cloudProvider: e.cloudProvider || "N/A",
      serviceType: e.serviceType || "N/A",
      region: e.region || "N/A",
      amount: Number(e.amount),
    }))
  );

  return {
    buffer: Buffer.from(csvData),
    contentType: "text/csv",
    filename: `expense-report-${startDate.toISOString().split("T")[0]}.csv`,
  };
};
