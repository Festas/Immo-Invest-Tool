import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Get or create the Prisma client instance.
 * Uses lazy initialization to avoid errors during Next.js build time.
 */
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Check if we're in build-time context where PrismaClient shouldn't be instantiated.
 * This checks for the dummy DATABASE_URL used during Docker builds.
 */
function isBuildTimeContext(): boolean {
  const dbUrl = process.env.DATABASE_URL || "";
  return dbUrl.includes("build:build@localhost") || dbUrl === "";
}

/**
 * Lazy-loading Prisma client that delays instantiation until first use.
 * This prevents errors during Next.js build when DATABASE_URL is a dummy value.
 *
 * Uses a Proxy to intercept all property access and method calls, only creating
 * the actual PrismaClient instance when it's actually needed at runtime.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // Handle Promise detection (for await detection)
    if (prop === "then") return undefined;

    // Check if we're in build time and throw a helpful error
    if (isBuildTimeContext()) {
      throw new Error(
        `PrismaClient cannot be used during build time. ` +
          `Ensure database operations only run at runtime. ` +
          `Property accessed: ${String(prop)}`
      );
    }

    // Get the actual client (lazy initialization happens here)
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];

    // Bind methods to the client instance
    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});

export default prisma;
