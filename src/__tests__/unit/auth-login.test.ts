/**
 * Comprehensive unit tests for login authentication
 * Tests error handling, validation, and security aspects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/auth/login/route";
import { NextRequest } from "next/server";
import * as storage from "@/lib/auth/storage";
import * as session from "@/lib/auth/session";
import bcrypt from "bcryptjs";

// Mock the modules
vi.mock("@/lib/auth/storage");
vi.mock("@/lib/auth/session");
vi.mock("bcryptjs");

describe("Login API Route - Error Handling", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on console methods to verify logging
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  // Helper to create a mock request
  function createMockRequest(body: unknown): NextRequest {
    return {
      json: async () => body,
    } as NextRequest;
  }

  // ===========================================
  // Input Validation Tests
  // ===========================================
  describe("Input Validation", () => {
    it("should return error when username is missing", async () => {
      const request = createMockRequest({ password: "test123" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Benutzername und Passwort sind erforderlich.");
      expect(data.code).toBe("MISSING_CREDENTIALS");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Missing credentials")
      );
    });

    it("should return error when password is missing", async () => {
      const request = createMockRequest({ username: "testuser" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Benutzername und Passwort sind erforderlich.");
      expect(data.code).toBe("MISSING_CREDENTIALS");
    });

    it("should return error when both credentials are missing", async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("MISSING_CREDENTIALS");
    });
  });

  // ===========================================
  // User Lookup Tests
  // ===========================================
  describe("User Lookup", () => {
    it("should return error for non-existent user", async () => {
      vi.mocked(storage.findUserByUsername).mockResolvedValue(null);

      const request = createMockRequest({
        username: "nonexistent",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Ungültiger Benutzername oder Passwort.");
      expect(data.code).toBe("INVALID_CREDENTIALS");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Failed - user not found"),
        expect.any(Object)
      );
    });

    it("should handle storage permission error (EACCES)", async () => {
      const storageError = new Error("Permission denied") as NodeJS.ErrnoException;
      storageError.code = "EACCES";
      vi.mocked(storage.findUserByUsername).mockRejectedValue(storageError);

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Fehler beim Zugriff auf Benutzerdaten. Bitte kontaktieren Sie den Administrator."
      );
      expect(data.code).toBe("STORAGE_PERMISSION_ERROR");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Storage error"),
        expect.any(Object)
      );
    });

    it("should handle storage not found error (ENOENT)", async () => {
      const storageError = new Error("File not found") as NodeJS.ErrnoException;
      storageError.code = "ENOENT";
      vi.mocked(storage.findUserByUsername).mockRejectedValue(storageError);

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Benutzerdatenbank nicht gefunden. Bitte kontaktieren Sie den Administrator."
      );
      expect(data.code).toBe("STORAGE_NOT_FOUND");
    });

    it("should handle generic storage error", async () => {
      vi.mocked(storage.findUserByUsername).mockRejectedValue(new Error("Database error"));

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Fehler beim Laden der Benutzerdaten. Bitte versuchen Sie es später erneut."
      );
      expect(data.code).toBe("STORAGE_ERROR");
    });
  });

  // ===========================================
  // Password Verification Tests
  // ===========================================
  describe("Password Verification", () => {
    it("should return error for invalid password", async () => {
      vi.mocked(storage.findUserByUsername).mockResolvedValue({
        id: "user123",
        username: "testuser",
        passwordHash: "hashedpassword",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const request = createMockRequest({
        username: "testuser",
        password: "wrongpassword",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Ungültiger Benutzername oder Passwort.");
      expect(data.code).toBe("INVALID_CREDENTIALS");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Failed - invalid password"),
        expect.any(Object)
      );
    });

    it("should handle bcrypt comparison error", async () => {
      vi.mocked(storage.findUserByUsername).mockResolvedValue({
        id: "user123",
        username: "testuser",
        passwordHash: "hashedpassword",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      vi.mocked(bcrypt.compare).mockRejectedValue(new Error("Bcrypt error"));

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Fehler bei der Passwortüberprüfung. Bitte versuchen Sie es erneut.");
      expect(data.code).toBe("PASSWORD_VERIFICATION_ERROR");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Password verification error"),
        expect.any(Object)
      );
    });
  });

  // ===========================================
  // Session Creation Tests
  // ===========================================
  describe("Session Creation", () => {
    beforeEach(() => {
      vi.mocked(storage.findUserByUsername).mockResolvedValue({
        id: "user123",
        username: "testuser",
        passwordHash: "hashedpassword",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    });

    it("should handle JWT_SECRET configuration error", async () => {
      vi.mocked(session.createSession).mockRejectedValue(
        new Error("JWT_SECRET environment variable is required")
      );

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Server-Konfigurationsfehler. Bitte kontaktieren Sie den Administrator."
      );
      expect(data.code).toBe("SESSION_CONFIG_ERROR");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Session creation error"),
        expect.any(Object)
      );
    });

    it("should handle generic session creation error", async () => {
      vi.mocked(session.createSession).mockRejectedValue(new Error("Session error"));

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Fehler beim Erstellen der Sitzung. Bitte versuchen Sie es erneut.");
      expect(data.code).toBe("SESSION_CREATION_ERROR");
    });

    it("should handle cookie setting error", async () => {
      vi.mocked(session.createSession).mockResolvedValue("mock-token");
      vi.mocked(session.setSessionCookie).mockRejectedValue(new Error("Cookie error"));

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Fehler beim Speichern der Sitzung. Bitte versuchen Sie es erneut.");
      expect(data.code).toBe("COOKIE_ERROR");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Cookie setting error"),
        expect.any(Object)
      );
    });
  });

  // ===========================================
  // Successful Login Tests
  // ===========================================
  describe("Successful Login", () => {
    it("should successfully login with valid credentials", async () => {
      vi.mocked(storage.findUserByUsername).mockResolvedValue({
        id: "user123",
        username: "testuser",
        passwordHash: "hashedpassword",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(session.createSession).mockResolvedValue("mock-token");
      vi.mocked(session.setSessionCookie).mockResolvedValue(undefined);

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual({
        id: "user123",
        username: "testuser",
      });
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Success"),
        expect.any(Object)
      );
    });
  });

  // ===========================================
  // Logging Tests
  // ===========================================
  describe("Logging", () => {
    it("should log failed login attempts with username", async () => {
      vi.mocked(storage.findUserByUsername).mockResolvedValue(null);

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      await POST(request);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Failed - user not found"),
        expect.objectContaining({
          username: "testuser",
        })
      );
    });

    it("should log successful login with timing information", async () => {
      vi.mocked(storage.findUserByUsername).mockResolvedValue({
        id: "user123",
        username: "testuser",
        passwordHash: "hashedpassword",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(session.createSession).mockResolvedValue("mock-token");
      vi.mocked(session.setSessionCookie).mockResolvedValue(undefined);

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      await POST(request);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Success"),
        expect.objectContaining({
          username: "testuser",
          userId: "user123",
          duration: expect.stringMatching(/\d+ms/),
        })
      );
    });
  });

  // ===========================================
  // Unexpected Error Tests
  // ===========================================
  describe("Unexpected Errors", () => {
    it("should handle unexpected errors gracefully", async () => {
      // Mock request parsing error (JSON parsing failure)
      const request = {
        json: async () => {
          throw new SyntaxError("Unexpected token in JSON");
        },
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
      expect(data.code).toBe("UNEXPECTED_ERROR");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Login] Unexpected error"),
        expect.any(Object)
      );
    });
  });
});
