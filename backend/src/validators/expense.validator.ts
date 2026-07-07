// ==========================================
// Expense Validators (Zod Schemas)
// ==========================================
// Validates expense creation and update requests.
// Ensures amounts are positive and dates are valid.

import { z } from "zod";

// Create expense schema
export const createExpenseSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(999999999.99, "Amount is too large"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be at most 500 characters")
    .trim(),
  date: z.string().datetime().or(z.date()),
  categoryId: z.string().uuid().optional().nullable(),
  cloudProvider: z
    .enum(["AWS", "Azure", "GCP", "Other"])
    .optional()
    .nullable(),
  serviceType: z
    .string()
    .max(100, "Service type must be at most 100 characters")
    .optional()
    .nullable(),
  region: z
    .string()
    .max(50, "Region must be at most 50 characters")
    .optional()
    .nullable(),
});

// Update expense schema (all fields optional)
export const updateExpenseSchema = createExpenseSchema.partial();

// Expense filter query schema
export const expenseFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().uuid().optional(),
  cloudProvider: z.enum(["AWS", "Azure", "GCP", "Other"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z
    .enum(["date", "amount", "createdAt"])
    .default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>;
