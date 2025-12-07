import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getStorageDir } from "@/lib/auth/storage";

/**
 * Health check endpoint
 * Checks backend server, database/storage, and file system accessibility
 */

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    server: {
      status: "up";
      uptime: number;
    };
    storage: {
      status: "accessible" | "inaccessible" | "error";
      path: string;
      writable: boolean;
      readable: boolean;
      error?: string;
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
  };
}

/**
 * Check storage accessibility
 */
async function checkStorage(): Promise<HealthCheckResult["checks"]["storage"]> {
  const storagePath = getStorageDir();

  try {
    // Check if directory exists
    try {
      await fs.access(storagePath);
    } catch {
      // Directory doesn't exist, try to create it
      await fs.mkdir(storagePath, { recursive: true });
    }

    // Check if directory is readable
    let readable = false;
    try {
      await fs.access(storagePath, fs.constants.R_OK);
      readable = true;
    } catch {
      readable = false;
    }

    // Check if directory is writable
    let writable = false;
    try {
      await fs.access(storagePath, fs.constants.W_OK);
      writable = true;
    } catch {
      writable = false;
    }

    // Determine overall status
    const status = readable && writable ? "accessible" : "inaccessible";

    return {
      status,
      path: storagePath,
      readable,
      writable,
    };
  } catch (error) {
    return {
      status: "error",
      path: storagePath,
      readable: false,
      writable: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check database/user data accessibility
 */
async function checkDatabase(): Promise<HealthCheckResult["checks"]["database"]> {
  const storagePath = getStorageDir();
  const usersFilePath = path.join(storagePath, "users.json");

  try {
    // Try to read users file
    try {
      const data = await fs.readFile(usersFilePath, "utf-8");
      const users = JSON.parse(data);
      return {
        status: "accessible",
        userCount: Array.isArray(users) ? users.length : 0,
      };
    } catch (error) {
      // File doesn't exist yet (no users registered) - this is OK
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return {
          status: "accessible",
          userCount: 0,
        };
      }
      // Other errors (permission, corruption, etc.)
      throw error;
    }
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

  // Optional secrets
  const hasSessionSecret = !!process.env.SESSION_SECRET;
  const hasDomain = !!process.env.DOMAIN;

  // Generate warnings for missing secrets
  if (!hasJwtSecret && isProduction) {
    warnings.push("JWT_SECRET is required in production for secure authentication");
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
  if (hasJwtSecret) {
    status = hasSessionSecret && hasDomain ? "complete" : "partial";
  } else {
    status = "missing";
  }

  return {
    status,
    required: {
      JWT_SECRET: hasJwtSecret,
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
    const [storageCheck, databaseCheck] = await Promise.all([checkStorage(), checkDatabase()]);
    const secretsCheck = checkSecrets();

    // Determine overall health status
    let overallStatus: HealthCheckResult["status"] = "healthy";

    if (
      storageCheck.status === "error" ||
      databaseCheck.status === "error" ||
      !storageCheck.writable ||
      !storageCheck.readable ||
      secretsCheck.status === "missing"
    ) {
      overallStatus = "unhealthy";
    } else if (
      storageCheck.status === "inaccessible" ||
      databaseCheck.status === "inaccessible" ||
      secretsCheck.status === "partial"
    ) {
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
        storage: storageCheck,
        database: databaseCheck,
        secrets: secretsCheck,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasJwtSecret: !!process.env.JWT_SECRET,
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
        storage: storageCheck.status,
        database: databaseCheck.status,
        secrets: secretsCheck.status,
        writable: storageCheck.writable,
        readable: storageCheck.readable,
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
