// ==========================================
// Request Validation Middleware
// ==========================================
// Generic Zod validation middleware that can validate
// request body, params, or query against any Zod schema.
// Returns structured validation errors to the client.

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

type ValidationTarget = "body" | "params" | "query";

/**
 * Creates a middleware that validates the specified request property.
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, params, query)
 */
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = "body"
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[target]);
      // Replace with parsed/transformed data (e.g., coerced types, defaults)
      (req as any)[target] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        return next(ApiError.badRequest(messages.join(", ")));
      }
      next(error);
    }
  };
};
