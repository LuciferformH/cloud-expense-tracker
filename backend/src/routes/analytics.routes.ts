// ==========================================
// Analytics Routes
// ==========================================
// Dashboard summary and analytics data endpoints.

import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/dashboard", analyticsController.getDashboard);

router.get("/", analyticsController.getAnalytics);

export default router;
