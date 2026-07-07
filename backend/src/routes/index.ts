// ==========================================
// Route Aggregator
// ==========================================
// Centralizes all API route registrations.
// Keeps app.ts clean and routes organized by domain.
// All routes are prefixed with /api in app.ts.

import { Router } from "express";
import authRoutes from "./auth.routes";
import expenseRoutes from "./expense.routes";
import budgetRoutes from "./budget.routes";
import analyticsRoutes from "./analytics.routes";
import reportRoutes from "./report.routes";
import userRoutes from "./user.routes";
import aiRoutes from "./ai.routes";

const router = Router();

// Register all route modules
router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);
router.use("/budgets", budgetRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/reports", reportRoutes);
router.use("/users", userRoutes);
router.use("/ai", aiRoutes);

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
