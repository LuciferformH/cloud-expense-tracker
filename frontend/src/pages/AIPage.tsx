// ==========================================
// AI Insights Page
// ==========================================
// Displays AI-powered cost optimization suggestions,
// anomaly detection, and spending forecasts.

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FiZap, FiAlertTriangle, FiTrendingUp, FiDollarSign } from "react-icons/fi";
import { useAISuggestions, useAIForecast } from "../hooks";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { cn, formatCurrency } from "../utils";
import type { AISuggestion } from "../types";

const severityConfig = {
  high: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", badge: "bg-red-100 text-red-700" },
  medium: { bg: "bg-yellow-50", border: "border-yellow-200", icon: "text-yellow-600", badge: "bg-yellow-100 text-yellow-700" },
  low: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
};

const typeIcons = {
  optimization: FiZap,
  anomaly: FiAlertTriangle,
  forecast: FiTrendingUp,
};

const AIPage: React.FC = () => {
  const { data: suggestionsData, isLoading: loadingSuggestions } = useAISuggestions();
  const { data: forecastData, isLoading: loadingForecast } = useAIForecast(6);

  if (loadingSuggestions || loadingForecast) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const suggestions = (suggestionsData?.data?.data || []) as AISuggestion[];
  const forecast = forecastData?.data?.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-500">AI-powered cost optimization and anomaly detection</p>
        </div>

        {/* Suggestions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimization Suggestions</h2>
          {suggestions.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <FiZap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No suggestions at this time. Keep tracking your expenses!</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => {
                const config = severityConfig[suggestion.severity];
                const Icon = typeIcons[suggestion.type];

                return (
                  <Card key={index} className={cn(config.bg, config.border)}>
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-lg", config.badge)}>
                        <Icon className={cn("w-5 h-5", config.icon)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                          <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", config.badge)}>
                            {suggestion.severity}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            {suggestion.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                        {suggestion.estimatedSavings && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-green-700 font-medium">
                            <FiDollarSign className="w-4 h-4" />
                            Estimated potential savings: {formatCurrency(suggestion.estimatedSavings)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Forecast Chart */}
        {forecast && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Forecast</h2>
            <p className="text-sm text-gray-500 mb-4">
              Historical spending with projected trend for the next 6 months
            </p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[...(forecast.historical || []), ...(forecast.forecast || [])]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Amount"]} />
                  <Legend />
                  <Line
                    dataKey="amount"
                    name="Actual"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    dataKey="amount"
                    name="Forecast"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIPage;
