/**
 * Unit tests for health check endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/health/route";
import { promises as fs } from "fs";

// Mock fs module
vi.mock("fs", () => {
  return {
    default: {},
    promises: {
      access: vi.fn(),
      mkdir: vi.fn(),
      readFile: vi.fn(),
      constants: {
        R_OK: 4,
        W_OK: 2,
      },
    },
    constants: {
      R_OK: 4,
      W_OK: 2,
    },
  };
});

describe("Health Check API Route", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Set default NODE_ENV to development for tests
    process.env.NODE_ENV = "development";
    // Clean up all secret-related env vars
    delete process.env.JWT_SECRET;
    delete process.env.SESSION_SECRET;
    delete process.env.DOMAIN;
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("Database Issues", () => {
    it("should return unhealthy status when database file is corrupted", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue("invalid json{{{");

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.checks.database.status).toBe("error");
      expect(data.checks.database.error).toBeDefined();
    });

    it("should return unhealthy status when database read fails with permission error", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      const error = new Error("EACCES: permission denied") as NodeJS.ErrnoException;
      error.code = "EACCES";
      vi.mocked(fs.readFile).mockRejectedValue(error);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.checks.database.status).toBe("error");
    });
  });

  describe("Environment Information", () => {
    it("should report JWT_SECRET status correctly when set", async () => {
      process.env.JWT_SECRET = "test-secret";
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.environment.hasJwtSecret).toBe(true);
      expect(data.checks.secrets.required.JWT_SECRET).toBe(true);
      delete process.env.JWT_SECRET;
    });

    it("should report JWT_SECRET status correctly when not set", async () => {
      delete process.env.JWT_SECRET;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.environment.hasJwtSecret).toBe(false);
      expect(data.checks.secrets.required.JWT_SECRET).toBe(false);
    });

    it("should report correct NODE_ENV", async () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_SECRET = "test-secret"; // Set JWT_SECRET to avoid unhealthy status
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.environment.nodeEnv).toBe("production");
      delete process.env.JWT_SECRET;
    });
  });

  describe("Secrets Check", () => {
    it("should report complete status when all secrets are set", async () => {
      process.env.JWT_SECRET = "test-jwt-secret";
      process.env.SESSION_SECRET = "test-session-secret";
      process.env.DOMAIN = "example.com";
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.checks.secrets.status).toBe("complete");
      expect(data.checks.secrets.required.JWT_SECRET).toBe(true);
      expect(data.checks.secrets.optional.SESSION_SECRET).toBe(true);
      expect(data.checks.secrets.optional.DOMAIN).toBe(true);
      expect(data.checks.secrets.warnings).toEqual([]);

      delete process.env.JWT_SECRET;
      delete process.env.SESSION_SECRET;
      delete process.env.DOMAIN;
    });

    it("should report partial status when only required secrets are set", async () => {
      process.env.JWT_SECRET = "test-jwt-secret";
      delete process.env.SESSION_SECRET;
      delete process.env.DOMAIN;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.checks.secrets.status).toBe("partial");
      expect(data.checks.secrets.required.JWT_SECRET).toBe(true);
      expect(data.checks.secrets.optional.SESSION_SECRET).toBe(false);
      expect(data.checks.secrets.optional.DOMAIN).toBe(false);

      delete process.env.JWT_SECRET;
    });

    it("should report missing status when JWT_SECRET is not set", async () => {
      delete process.env.JWT_SECRET;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.checks.secrets.status).toBe("missing");
      expect(data.checks.secrets.required.JWT_SECRET).toBe(false);
    });

    it("should include warnings in production when secrets are missing", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.JWT_SECRET;
      delete process.env.SESSION_SECRET;
      delete process.env.DOMAIN;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.checks.secrets.warnings.length).toBeGreaterThan(0);
      expect(data.checks.secrets.warnings).toContain(
        "JWT_SECRET is required in production for secure authentication"
      );
    });

    it("should return unhealthy status when required secrets are missing", async () => {
      delete process.env.JWT_SECRET;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
    });

    it("should report partial secrets status when optional secrets are missing but required are present", async () => {
      process.env.JWT_SECRET = "test-jwt-secret";
      delete process.env.SESSION_SECRET;
      delete process.env.DOMAIN;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      // Verify secrets check reports partial status
      expect(data.checks.secrets.status).toBe("partial");
      expect(data.checks.secrets.required.JWT_SECRET).toBe(true);
      expect(data.checks.secrets.optional.SESSION_SECRET).toBe(false);
      expect(data.checks.secrets.optional.DOMAIN).toBe(false);

      delete process.env.JWT_SECRET;
    });
  });

  describe("Logging", () => {
    it("should log health check in development mode", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.JWT_SECRET; // Will trigger warning
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      await GET();

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Health Check] Status:"),
        expect.any(Object)
      );
    });

    it("should log health check when there are warnings", async () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_SECRET = "test-secret";
      delete process.env.SESSION_SECRET;
      delete process.env.DOMAIN;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      await GET();

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Health Check] Status:"),
        expect.objectContaining({
          warnings: expect.any(Array),
        })
      );

      delete process.env.JWT_SECRET;
    });
  });

  describe("Response Structure", () => {
    it("should include timestamp in ISO format", async () => {
      process.env.JWT_SECRET = "test-secret";
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(() => new Date(data.timestamp)).not.toThrow();

      delete process.env.JWT_SECRET;
    });

    it("should include server uptime", async () => {
      process.env.JWT_SECRET = "test-secret";
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.checks.server.uptime).toBeDefined();
      expect(typeof data.checks.server.uptime).toBe("number");
      expect(data.checks.server.uptime).toBeGreaterThanOrEqual(0);

      delete process.env.JWT_SECRET;
    });

    it("should include all required check sections", async () => {
      process.env.JWT_SECRET = "test-secret";
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.checks).toBeDefined();
      expect(data.checks.server).toBeDefined();
      expect(data.checks.storage).toBeDefined();
      expect(data.checks.database).toBeDefined();
      expect(data.checks.secrets).toBeDefined();
      expect(data.environment).toBeDefined();

      delete process.env.JWT_SECRET;
    });
  });
});
