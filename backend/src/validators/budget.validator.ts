// ==========================================
// Budget Validators (Zod Schemas)
// ==========================================
// Validates budget creation and update requests.
// Ensures alert thresholds are valid percentages.

import { z } from "zod";

// Create budget schema
export const createBudgetSchema = z.object({
  name: z
    .string()
    .min(1, "Budget name is required")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  monthlyLimit: z
    .number()
    .positive("Monthly limit must be positive")
    .max(999999999.99, "Limit is too large"),
  alertThreshold: z
    .number()
    .min(1, "Threshold must be at least 1%")
    .max(100, "Threshold must be at most 100%")
    .default(80),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional(),
});

// Update budget schema
export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
