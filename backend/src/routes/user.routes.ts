// ==========================================
// User Routes
// ==========================================
// Profile management and category operations.

import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
  createCategorySchema,
} from "../validators/user.validator";

const router = Router();

router.use(authenticate);

// Profile
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  validate(updateProfileSchema),
  userController.updateProfile
);
router.put(
  "/password",
  validate(changePasswordSchema),
  userController.changePassword
);

// Categories
router.get("/categories", userController.getCategories);
router.post(
  "/categories",
  validate(createCategorySchema),
  userController.createCategory
);
router.put(
  "/categories/:id",
  validate(createCategorySchema),
  userController.updateCategory
);
router.delete("/categories/:id", userController.deleteCategory);

export default router;
