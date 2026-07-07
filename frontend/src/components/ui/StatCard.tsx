// ==========================================
// Stat Card Component
// ==========================================
// Displays a single statistic with label, value, and trend indicator.
// Used on the dashboard for key metrics.

import React from "react";
import { cn, formatCurrency, formatPercent } from "../../utils";

interface StatCardProps {
  label: string;
  value: number;
  previousValue?: number;
  format?: "currency" | "number" | "percent";
  icon?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  previousValue,
  format = "currency",
  icon,
  className,
}) => {
  const percentChange =
    previousValue && previousValue > 0
      ? ((value - previousValue) / previousValue) * 100
      : null;

  const isPositive = percentChange !== null && percentChange > 0;
  const isNegative = percentChange !== null && percentChange < 0;

  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatCurrency(val);
      case "percent":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-200 p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatValue(value)}</p>
          {percentChange !== null && (
            <div className="flex items-center mt-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-red-600",
                  isNegative && "text-green-600",
                  !isPositive && !isNegative && "text-gray-500"
                )}
              >
                {formatPercent(percentChange)}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
