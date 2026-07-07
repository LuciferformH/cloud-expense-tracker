// ==========================================
// Analytics Page
// ==========================================
// Visual analytics with line, bar, and pie charts
// showing spending trends and breakdowns.

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAnalytics } from "../hooks";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { formatCurrency, CHART_COLORS } from "../utils";

const AnalyticsPage: React.FC = () => {
  const [months, setMonths] = useState(12);
  const { data, isLoading } = useAnalytics(months);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const analytics = data?.data?.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500">Detailed spending analysis and insights</p>
          </div>
          <Select
            options={[
              { value: "3", label: "Last 3 months" },
              { value: "6", label: "Last 6 months" },
              { value: "12", label: "Last 12 months" },
            ]}
            value={String(months)}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-44"
          />
        </div>

        {/* Monthly Trend */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Spending"]} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.categoryDistribution || []}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ category, percent }) =>
                      `${category} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(analytics?.categoryDistribution || []).map((entry: any, index: number) => (
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
          </Card>

          {/* Provider Distribution */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Provider</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.providerDistribution || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <YAxis type="category" dataKey="provider" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Spending"]} />
                  <Bar dataKey="amount" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Breakdown Table */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">% of Total</th>
                  <th className="pb-3 font-medium">Visual</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.categoryDistribution || []).map((item: any, index: number) => {
                  const total = (analytics?.categoryDistribution || []).reduce(
                    (sum: number, c: any) => sum + c.amount,
                    0
                  );
                  const percent = total > 0 ? (item.amount / total) * 100 : 0;
                  return (
                    <tr key={item.category} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color || CHART_COLORS[index] }}
                          />
                          <span className="font-medium">{item.category}</span>
                        </div>
                      </td>
                      <td className="py-3 font-medium">{formatCurrency(item.amount)}</td>
                      <td className="py-3 text-gray-600">{percent.toFixed(1)}%</td>
                      <td className="py-3">
                        <div className="w-full bg-gray-100 rounded-full h-2 max-w-[200px]">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: item.color || CHART_COLORS[index],
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
