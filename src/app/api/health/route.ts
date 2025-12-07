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

export async function GET() {
  const startTime = Date.now();

  try {
    // Check all components
    const [storageCheck, databaseCheck] = await Promise.all([checkStorage(), checkDatabase()]);

    // Determine overall health status
    let overallStatus: HealthCheckResult["status"] = "healthy";

    if (
      storageCheck.status === "error" ||
      databaseCheck.status === "error" ||
      !storageCheck.writable ||
      !storageCheck.readable
    ) {
      overallStatus = "unhealthy";
    } else if (storageCheck.status === "inaccessible" || databaseCheck.status === "inaccessible") {
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
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasJwtSecret: !!process.env.JWT_SECRET,
      },
    };

    const duration = Date.now() - startTime;

    // Log health check in dev mode or if unhealthy
    if (process.env.NODE_ENV === "development" || overallStatus !== "healthy") {
      console.info(`[Health Check] Status: ${overallStatus}, Duration: ${duration}ms`, {
        storage: storageCheck.status,
        database: databaseCheck.status,
        writable: storageCheck.writable,
        readable: storageCheck.readable,
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
