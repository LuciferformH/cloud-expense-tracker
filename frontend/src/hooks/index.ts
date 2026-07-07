// ==========================================
// Custom React Hooks
// ==========================================
// Reusable hooks that encapsulate common patterns.
// Wraps React Query mutations/queries for cleaner components.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "../api/expenses.api";
import { budgetsApi } from "../api/budgets.api";
import { analyticsApi } from "../api/analytics.api";
import { reportsApi } from "../api/reports.api";
import { aiApi } from "../api/ai.api";
import toast from "react-hot-toast";

// ==========================================
// Expense Hooks
// ==========================================
export function useExpenses(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => expensesApi.getAll(filters),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Expense created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create expense");
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      expensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Expense updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update expense");
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Expense deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete expense");
    },
  });
}

// ==========================================
// Budget Hooks
// ==========================================
export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: budgetsApi.getAll,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create budget");
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget updated");
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
    },
  });
}

// ==========================================
// Dashboard & Analytics Hooks
// ==========================================
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: analyticsApi.getDashboard,
  });
}

export function useAnalytics(months?: number) {
  return useQuery({
    queryKey: ["analytics", months],
    queryFn: () => analyticsApi.getAnalytics(months),
  });
}

// ==========================================
// Report Hooks
// ==========================================
export function useExportReport() {
  return useMutation({
    mutationFn: async (params: {
      startDate: string;
      endDate: string;
      format: "pdf" | "csv";
    }) => {
      const response = await reportsApi.exportReport(params);
      // Create download link
      const blob = new Blob([response.data as any], {
        type: params.format === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `expense-report.${params.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success("Report downloaded");
    },
  });
}

// ==========================================
// AI Hooks
// ==========================================
export function useAISuggestions() {
  return useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: aiApi.getSuggestions,
  });
}

export function useAIForecast(months?: number) {
  return useQuery({
    queryKey: ["ai-forecast", months],
    queryFn: () => aiApi.getForecast(months),
  });
}
