// ==========================================
// Frontend Validation Schemas (Zod)
// ==========================================
// Shared validation schemas for React Hook Form.
// Matches backend validation for consistency.

import { z } from "zod";

// ==========================================
// Auth Schemas
// ==========================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

// ==========================================
// Expense Schemas
// ==========================================

export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(500),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().optional().nullable(),
  cloudProvider: z.enum(["AWS", "Azure", "GCP", "Other"]).optional().nullable(),
  serviceType: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
});

// ==========================================
// Budget Schemas
// ==========================================

export const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required").max(100),
  monthlyLimit: z.number().positive("Monthly limit must be positive"),
  alertThreshold: z
    .number()
    .min(1, "Must be at least 1%")
    .max(100, "Must be at most 100%")
    .default(80),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
});

// ==========================================
// Profile Schemas
// ==========================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

// ==========================================
// Category Schema
// ==========================================

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
});

// ==========================================
// Inferred Types
// ==========================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
