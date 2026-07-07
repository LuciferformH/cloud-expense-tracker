// ==========================================
// Budgets Page
// ==========================================
// Budget management with progress bars, alerts,
// and CRUD operations via modal forms.

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from "../hooks";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import { budgetSchema, type BudgetFormData } from "../schemas";
import { formatCurrency, cn } from "../utils";
import type { Budget } from "../types";

const BudgetsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useBudgets();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { alertThreshold: 80 },
  });

  const budgets = data?.data?.data || [];

  const openCreateModal = () => {
    setEditingBudget(null);
    reset({
      name: "",
      monthlyLimit: 0,
      alertThreshold: 80,
      startDate: new Date().toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    reset({
      name: budget.name,
      monthlyLimit: Number(budget.monthlyLimit),
      alertThreshold: Number(budget.alertThreshold),
      startDate: new Date(budget.startDate).toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const onSubmit = (data: BudgetFormData) => {
    const payload = {
      ...data,
      endDate: data.endDate || undefined,
    };
    if (editingBudget) {
      updateMutation.mutate(
        { id: editingBudget.id, data: payload },
        { onSuccess: () => { setModalOpen(false); reset(); } }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { setModalOpen(false); reset(); },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
            <p className="text-gray-500">Set and track monthly spending limits</p>
          </div>
          <Button onClick={openCreateModal}>
            <FiPlus className="w-4 h-4 mr-2" /> Add Budget
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : budgets.length === 0 ? (
          <Card>
            <EmptyState
              title="No budgets yet"
              description="Create your first budget to start tracking spending limits."
              action={
                <Button onClick={openCreateModal}>
                  <FiPlus className="w-4 h-4 mr-2" /> Create Budget
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget: Budget) => {
              const percentUsed = budget.percentUsed || 0;
              const spent = budget.spent || 0;
              const limit = Number(budget.monthlyLimit);
              const remaining = budget.remaining || limit - spent;
              const isExceeded = budget.isExceeded || spent > limit;
              const isWarning = budget.isOverThreshold || percentUsed >= Number(budget.alertThreshold);

              return (
                <Card
                  key={budget.id}
                  className={cn(
                    "relative",
                    isExceeded && "border-red-200 bg-red-50",
                    isWarning && !isExceeded && "border-yellow-200 bg-yellow-50"
                  )}
                >
                  {/* Alert badge */}
                  {(isExceeded || isWarning) && (
                    <div className="absolute -top-2 -right-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          isExceeded ? "bg-red-500" : "bg-yellow-500"
                        )}
                      >
                        <FiAlertTriangle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                      <p className="text-sm text-gray-500">
                        Alert at {Number(budget.alertThreshold)}%
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(budget)}
                        className="p-1 text-gray-400 hover:text-primary-600"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(budget.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium">{formatCurrency(spent)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={cn(
                          "h-3 rounded-full transition-all",
                          isExceeded ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-primary-600"
                        )}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {percentUsed.toFixed(1)}% used
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          isExceeded ? "text-red-600" : "text-green-600"
                        )}
                      >
                        {isExceeded ? "Over by " : ""}
                        {formatCurrency(Math.abs(remaining))}
                        {!isExceeded ? " remaining" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                    Limit: {formatCurrency(limit)}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingBudget ? "Edit Budget" : "Create Budget"}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Budget Name"
              placeholder="Monthly Cloud Spend"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Monthly Limit ($)"
              type="number"
              step="0.01"
              placeholder="500.00"
              error={errors.monthlyLimit?.message}
              {...register("monthlyLimit", { valueAsNumber: true })}
            />
            <Input
              label="Alert Threshold (%)"
              type="number"
              min="1"
              max="100"
              error={errors.alertThreshold?.message}
              {...register("alertThreshold", { valueAsNumber: true })}
            />
            <Input
              label="Start Date"
              type="date"
              error={errors.startDate?.message}
              {...register("startDate")}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                {editingBudget ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Budget"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this budget?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default BudgetsPage;
