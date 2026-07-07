// ==========================================
// Dashboard Page
// ==========================================
// Main dashboard displaying key metrics, spending trends,
// budget status, category breakdown, and recent expenses.
// Uses React Query for data fetching with loading states.

import React from "react";
import { Link } from "react-router-dom";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDashboard } from "../hooks";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { formatCurrency, formatDate, CHART_COLORS } from "../utils";

const DashboardPage: React.FC = () => {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const summary = data?.data?.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your cloud expenses</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Monthly Spend"
            value={summary?.totalMonthlyCost || 0}
            previousValue={summary?.previousMonthCost}
            icon={<FiDollarSign className="w-6 h-6" />}
          />
          <StatCard
            label="vs Last Month"
            value={Math.abs(summary?.percentChange || 0)}
            format="percent"
            icon={
              (summary?.percentChange || 0) > 0 ? (
                <FiTrendingUp className="w-6 h-6" />
              ) : (
                <FiTrendingDown className="w-6 h-6" />
              )
            }
          />
          <StatCard
            label="Total Expenses"
            value={summary?.expenseCount || 0}
            format="number"
            icon={<FiCreditCard className="w-6 h-6" />}
          />
          <StatCard
            label="Active Budgets"
            value={summary?.activeBudgets?.length || 0}
            format="number"
            icon={<FiTrendingUp className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Trend Chart */}
          <Card className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary?.dailyCosts || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">By Category</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary?.categoryBreakdown || []}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {(summary?.categoryBreakdown || []).map((entry: any, index: number) => (
                      <Cell
                        key={entry.category}
                        fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {(summary?.categoryBreakdown || []).map((item: any, index: number) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || CHART_COLORS[index] }}
                    />
                    <span>{item.category}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Expenses & Budget Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Expenses */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
              <Link to="/expenses" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {(summary?.recentExpenses || []).length === 0 ? (
                <p className="text-gray-500 text-sm">No expenses yet</p>
              ) : (
                (summary?.recentExpenses || []).map((expense: any) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(expense.date)}
                        {expense.category && ` • ${expense.category.name}`}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(expense.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Budget Status */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Budget Status</h2>
              <Link to="/budgets" className="text-sm text-primary-600 hover:text-primary-700">
                Manage
              </Link>
            </div>
            <div className="space-y-4">
              {(summary?.activeBudgets || []).length === 0 ? (
                <p className="text-gray-500 text-sm">No active budgets</p>
              ) : (
                (summary?.activeBudgets || []).map((budget: any) => (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{budget.name}</span>
                      <span className="text-gray-500">
                        {formatCurrency(Number(budget.monthlyLimit))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (Number(budget.spent || 0) / Number(budget.monthlyLimit)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
