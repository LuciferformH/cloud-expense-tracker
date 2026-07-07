// ==========================================
// Expense Routes
// ==========================================
// CRUD operations for expenses.
// All routes require authentication.

import { Router } from "express";
import * as expenseController from "../controllers/expense.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseFilterSchema,
} from "../validators/expense.validator";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  "/",
  validate(createExpenseSchema),
  expenseController.createExpense
);

router.get(
  "/",
  validate(expenseFilterSchema, "query"),
  expenseController.getExpenses
);

router.get("/:id", expenseController.getExpense);

router.put(
  "/:id",
  validate(updateExpenseSchema),
  expenseController.updateExpense
);

router.delete("/:id", expenseController.deleteExpense);

export default router;
