// ==========================================
// Budget Routes
// ==========================================
// CRUD operations for budgets and alert checking.

import { Router } from "express";
import * as budgetController from "../controllers/budget.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { createBudgetSchema, updateBudgetSchema } from "../validators/budget.validator";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createBudgetSchema),
  budgetController.createBudget
);

router.get("/", budgetController.getBudgets);

router.get("/alerts", budgetController.checkAlerts);

router.get("/:id", budgetController.getBudget);

router.put(
  "/:id",
  validate(updateBudgetSchema),
  budgetController.updateBudget
);

router.delete("/:id", budgetController.deleteBudget);

export default router;
