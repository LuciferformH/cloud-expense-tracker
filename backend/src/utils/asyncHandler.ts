// ==========================================
// Async Handler Wrapper
// ==========================================
// Eliminates repetitive try/catch blocks in route handlers.
// Catches async errors and forwards them to the error middleware.
// Without this, unhandled promise rejections in async routes
// would crash the process or be silently swallowed.

import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
