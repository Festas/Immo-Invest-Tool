import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * Health check endpoint
 * Checks backend server, database connectivity, and configuration
 */

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    server: {
      status: "up";
      uptime: number;
    };
    database: {
      status: "accessible" | "inaccessible" | "error";
      userCount?: number;
      error?: string;
    };
    secrets: {
      status: "complete" | "partial" | "missing";
      required: {
        JWT_SECRET: boolean;
        DATABASE_URL: boolean;
      };
      optional: {
        SESSION_SECRET: boolean;
        DOMAIN: boolean;
      };
      warnings: string[];
    };
  };
  environment: {
    nodeEnv: string;
    hasJwtSecret: boolean;
    hasDatabaseUrl: boolean;
  };
}

/**
 * Check database connectivity and accessibility
 */
async function checkDatabase(): Promise<HealthCheckResult["checks"]["database"]> {
  try {
    // Try to count users (simple query to test database connection)
    const userCount = await prisma.user.count();
    return {
      status: "accessible",
      userCount,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check required and optional secrets configuration
 */
function checkSecrets(): HealthCheckResult["checks"]["secrets"] {
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  // Required secrets
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const hasDatabaseUrl = !!process.env.DATABASE_URL;

  // Optional secrets
  const hasSessionSecret = !!process.env.SESSION_SECRET;
  const hasDomain = !!process.env.DOMAIN;

  // Generate warnings for missing secrets
  if (!hasJwtSecret && isProduction) {
    warnings.push("JWT_SECRET is required in production for secure authentication");
  }

  if (!hasDatabaseUrl) {
    warnings.push("DATABASE_URL is required for database connectivity");
  }

  if (!hasSessionSecret && isProduction) {
    warnings.push(
      "SESSION_SECRET is recommended for enhanced security (defaults to JWT_SECRET if not set)"
    );
  }

  if (!hasDomain && isProduction) {
    warnings.push("DOMAIN is recommended for proper production configuration");
  }

  // Determine overall status
  let status: "complete" | "partial" | "missing";
  if (hasJwtSecret && hasDatabaseUrl) {
    status = hasSessionSecret && hasDomain ? "complete" : "partial";
  } else {
    status = "missing";
  }

  return {
    status,
    required: {
      JWT_SECRET: hasJwtSecret,
      DATABASE_URL: hasDatabaseUrl,
    },
    optional: {
      SESSION_SECRET: hasSessionSecret,
      DOMAIN: hasDomain,
    },
    warnings,
  };
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Check all components
    const databaseCheck = await checkDatabase();
    const secretsCheck = checkSecrets();

    // Determine overall health status
    let overallStatus: HealthCheckResult["status"] = "healthy";

    if (databaseCheck.status === "error" || secretsCheck.status === "missing") {
      overallStatus = "unhealthy";
    } else if (databaseCheck.status === "inaccessible" || secretsCheck.status === "partial") {
      overallStatus = "degraded";
    }

    const healthCheck: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        server: {
          status: "up",
          uptime: process.uptime(),
        },
        database: databaseCheck,
        secrets: secretsCheck,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
    };

    const duration = Date.now() - startTime;

    // Log health check in dev mode, if unhealthy, or if there are warnings
    if (
      process.env.NODE_ENV === "development" ||
      overallStatus !== "healthy" ||
      secretsCheck.warnings.length > 0
    ) {
      console.info(`[Health Check] Status: ${overallStatus}, Duration: ${duration}ms`, {
        database: databaseCheck.status,
        secrets: secretsCheck.status,
        warnings: secretsCheck.warnings.length > 0 ? secretsCheck.warnings : undefined,
      });
    }

    // Return appropriate status code based on health
    let statusCode: number;
    if (overallStatus === "unhealthy") {
      statusCode = 503;
    } else {
      // Both "healthy" and "degraded" return 200
      statusCode = 200;
    }

    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Health Check] Unexpected error (${duration}ms):`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
