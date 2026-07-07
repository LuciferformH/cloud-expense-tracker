// ==========================================
// CORS Configuration
// ==========================================
// Configures Cross-Origin Resource Sharing to allow
// the frontend domain to make API requests.

import { CorsOptions } from "cors";
import { env } from "./env";

export const corsOptions: CorsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
