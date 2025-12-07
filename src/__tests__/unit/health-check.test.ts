/**
 * Unit tests for health check endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/health/route";
import { promises as fs } from "fs";

// Mock fs module
vi.mock("fs", async () => {
  return {
    default: {},
    promises: {
      access: vi.fn(),
      mkdir: vi.fn(),
      readFile: vi.fn(),
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
      delete process.env.JWT_SECRET;
    });

    it("should report JWT_SECRET status correctly when not set", async () => {
      delete process.env.JWT_SECRET;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.environment.hasJwtSecret).toBe(false);
    });

    it("should report correct NODE_ENV", async () => {
      process.env.NODE_ENV = "production";
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.environment.nodeEnv).toBe("production");
    });
  });

  describe("Logging", () => {
    it("should log health check in development mode", async () => {
      process.env.NODE_ENV = "development";
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      await GET();

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Health Check] Status:"),
        expect.any(Object)
      );
    });
  });

  describe("Response Structure", () => {
    it("should include timestamp in ISO format", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(() => new Date(data.timestamp)).not.toThrow();
    });

    it("should include server uptime", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.checks.server.uptime).toBeDefined();
      expect(typeof data.checks.server.uptime).toBe("number");
      expect(data.checks.server.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should include all required check sections", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const response = await GET();
      const data = await response.json();

      expect(data.checks).toBeDefined();
      expect(data.checks.server).toBeDefined();
      expect(data.checks.storage).toBeDefined();
      expect(data.checks.database).toBeDefined();
      expect(data.environment).toBeDefined();
    });
  });
});
