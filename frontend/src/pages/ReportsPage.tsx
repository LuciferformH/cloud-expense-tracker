// ==========================================
// Reports Page
// ==========================================
// Generate and download PDF/CSV expense reports
// with date range selection.

import React, { useState } from "react";
import { FiFile, FiFileText } from "react-icons/fi";
import { useExportReport } from "../hooks";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const exportMutation = useExportReport();

  const handleExport = (format: "pdf" | "csv") => {
    exportMutation.mutate({
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
      format,
    });
  };

  // Quick date ranges
  const quickRanges = [
    { label: "This Month", months: 0 },
    { label: "Last Month", months: 1 },
    { label: "Last 3 Months", months: 3 },
    { label: "Last 6 Months", months: 6 },
    { label: "This Year", months: -1 },
  ];

  const setQuickRange = (monthsBack: number) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (monthsBack === -1) {
      // This year
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
    } else if (monthsBack === 0) {
      // This month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0);
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Export expense reports in PDF or CSV format</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Range Selection */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {quickRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setQuickRange(range.months)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Export Options */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleExport("pdf")}
                disabled={exportMutation.isPending}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
              >
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiFileText className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">PDF Report</p>
                  <p className="text-sm text-gray-500">
                    Professional formatted report with tables and charts
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleExport("csv")}
                disabled={exportMutation.isPending}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
              >
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiFile className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">CSV Export</p>
                  <p className="text-sm text-gray-500">
                    Spreadsheet-compatible format for Excel/Google Sheets
                  </p>
                </div>
              </button>
            </div>

            {exportMutation.isPending && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                Generating report...
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
