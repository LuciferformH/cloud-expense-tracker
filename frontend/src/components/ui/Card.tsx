// ==========================================
// Card Component
// ==========================================
// Container component with consistent styling.

import React from "react";
import { cn } from "../../utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-200 p-6", className)}>
      {children}
    </div>
  );
};

export default Card;
