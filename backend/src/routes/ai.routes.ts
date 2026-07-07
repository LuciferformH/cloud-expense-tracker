// ==========================================
// AI Routes
// ==========================================
// AI-powered suggestions and forecasting endpoints.

import { Router } from "express";
import * as aiController from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/suggestions", aiController.getSuggestions);

router.get("/forecast", aiController.getForecast);

export default router;
