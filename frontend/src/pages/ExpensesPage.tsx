// ==========================================
// Expenses Page
// ==========================================
// Full expense management with table view, filters,
// search, pagination, and add/edit modal.

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "../hooks";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import { expenseSchema, type ExpenseFormData } from "../schemas";
import { formatCurrency, formatDate } from "../utils";
import type { Expense } from "../types";

const ExpensesPage: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, any>>({
    page: 1,
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useExpenses({ ...filters, search: search || undefined });
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  const expenses = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const openCreateModal = () => {
    setEditingExpense(null);
    reset({ amount: 0, description: "", date: new Date().toISOString().split("T")[0] });
    setModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    reset({
      amount: Number(expense.amount),
      description: expense.description,
      date: new Date(expense.date).toISOString().split("T")[0],
      cloudProvider: (expense.cloudProvider as "AWS" | "Azure" | "GCP" | "Other") || undefined,
      serviceType: expense.serviceType || undefined,
      region: expense.region || undefined,
    });
    setModalOpen(true);
  };

  const onSubmit = (data: ExpenseFormData) => {
    const payload = {
      ...data,
      cloudProvider: data.cloudProvider || undefined,
      serviceType: data.serviceType || undefined,
      region: data.region || undefined,
    };
    if (editingExpense) {
      updateMutation.mutate(
        { id: editingExpense.id, data: payload },
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
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-500">Manage your cloud expenses</p>
          </div>
          <Button onClick={openCreateModal}>
            <FiPlus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <Select
              options={[
                { value: "date", label: "Sort by Date" },
                { value: "amount", label: "Sort by Amount" },
              ]}
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-40"
            />
            <Select
              options={[
                { value: "AWS", label: "AWS" },
                { value: "Azure", label: "Azure" },
                { value: "GCP", label: "GCP" },
              ]}
              placeholder="All Providers"
              value={filters.cloudProvider || ""}
              onChange={(e) =>
                setFilters({ ...filters, cloudProvider: e.target.value || undefined, page: 1 })
              }
              className="w-40"
            />
          </div>
        </Card>

        {/* Expenses Table */}
        <Card>
          {isLoading ? (
            <LoadingSpinner />
          ) : expenses.length === 0 ? (
            <EmptyState
              title="No expenses found"
              description="Start tracking your cloud expenses by adding your first one."
              action={
                <Button onClick={openCreateModal}>
                  <FiPlus className="w-4 h-4 mr-2" /> Add Expense
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Provider</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense: Expense) => (
                      <tr key={expense.id} className="border-b last:border-0">
                        <td className="py-3">
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          {expense.serviceType && (
                            <p className="text-xs text-gray-500">{expense.serviceType}</p>
                          )}
                        </td>
                        <td className="py-3 text-sm text-gray-600">{formatDate(expense.date)}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                            {expense.cloudProvider || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {expense.category?.name || "Uncategorized"}
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-900">
                          {formatCurrency(Number(expense.amount))}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(expense)}
                              className="p-1 text-gray-400 hover:text-primary-600"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(expense.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} expenses
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingExpense ? "Edit Expense" : "Add Expense"}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register("amount", { valueAsNumber: true })}
            />
            <Input
              label="Description"
              placeholder="EC2 instances"
              error={errors.description?.message}
              {...register("description")}
            />
            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register("date")}
            />
            <Select
              label="Cloud Provider"
              options={[
                { value: "AWS", label: "AWS" },
                { value: "Azure", label: "Azure" },
                { value: "GCP", label: "GCP" },
                { value: "Other", label: "Other" },
              ]}
              placeholder="Select provider"
              {...register("cloudProvider")}
            />
            <Input
              label="Service Type"
              placeholder="EC2, S3, RDS..."
              {...register("serviceType")}
            />
            <Input
              label="Region"
              placeholder="us-east-1"
              {...register("region")}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                {editingExpense ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Expense"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this expense? This action cannot be undone.
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

export default ExpensesPage;
