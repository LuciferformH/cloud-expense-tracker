// ==========================================
// CSV Export Generator
// ==========================================
// Converts expense data to CSV format for spreadsheet import.
// Uses csv-stringify for reliable RFC 4180 compliant output.

import { stringify } from "csv-stringify/sync";

interface ExpenseRow {
  date: string;
  description: string;
  category: string;
  cloudProvider: string;
  serviceType: string;
  region: string;
  amount: number;
}

/**
 * Generates a CSV string from expense data.
 * Includes proper headers and handles special characters.
 */
export const generateExpenseCSV = (expenses: ExpenseRow[]): string => {
  const headers = [
    "Date",
    "Description",
    "Category",
    "Cloud Provider",
    "Service Type",
    "Region",
    "Amount",
  ];

  const rows = expenses.map((e) => [
    e.date,
    e.description,
    e.category,
    e.cloudProvider,
    e.serviceType,
    e.region,
    e.amount.toFixed(2),
  ]);

  return stringify([headers, ...rows]);
};
