// ==========================================
// Sidebar Component
// ==========================================
// Navigation sidebar with links to all main sections.
// Highlights the active route using React Router.
// Collapsible on mobile for responsive design.

import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils";
import {
  FiHome,
  FiCreditCard,
  FiPieChart,
  FiTarget,
  FiFileText,
  FiCpu,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../store/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: FiHome },
  { to: "/expenses", label: "Expenses", icon: FiCreditCard },
  { to: "/budgets", label: "Budgets", icon: FiTarget },
  { to: "/analytics", label: "Analytics", icon: FiPieChart },
  { to: "/reports", label: "Reports", icon: FiFileText },
  { to: "/ai", label: "AI Insights", icon: FiCpu },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CE</span>
            </div>
            <span className="font-bold text-gray-900">CloudExpense</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
              }
              end={item.to === "/"}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
