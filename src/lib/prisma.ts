import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Prisma v7 + Accelerate singleton for Next.js serverless
// DATABASE_URL: Prisma Accelerate URL (prisma+postgres://...)
// For local dev without Accelerate, use the DIRECT_URL directly

const globalForPrisma = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any | undefined;
};

function createPrismaClient() {
  const datasourceUrl = process.env.DATABASE_URL;
  if (!datasourceUrl) {
    throw new Error("DATABASE_URL não está definida no .env");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = new (PrismaClient as any)({
    datasourceUrl,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return client.$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
