// ==========================================
// Report Routes
// ==========================================
// PDF and CSV export endpoints.
// Rate-limited to prevent abuse.

import { Router } from "express";
import * as reportController from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";
import { reportLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.use(authenticate);

router.get("/export", reportLimiter, reportController.exportReport);

export default router;
