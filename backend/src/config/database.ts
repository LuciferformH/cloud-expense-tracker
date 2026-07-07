// ==========================================
// Database Configuration (Prisma Client)
// ==========================================
// Singleton pattern prevents multiple Prisma Client instances
// in development (caused by hot-reload creating new instances).
// In production, a single instance is used per process.

import { PrismaClient } from "@prisma/client";

// Declare global type for development hot-reload singleton
declare global {
  var prisma: PrismaClient | undefined;
}

// Create PrismaClient with logging in development
const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Assign to global in development to survive hot-reload
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
