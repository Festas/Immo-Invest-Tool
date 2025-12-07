/**
 * Tests for per-user portfolio storage
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import {
  getUserDataDir,
  getUserPortfolioPath,
  loadUserPortfolio,
  saveUserPortfolio,
  addPropertyToPortfolio,
  updatePropertyInPortfolio,
  deletePropertyFromPortfolio,
  getPropertyFromPortfolio,
} from "@/lib/storage/user-portfolio";
import { Property } from "@/types";
import { getDefaultPropertyInput } from "@/lib/calculations";

describe("Per-User Portfolio Storage", () => {
  const testUserId = "test-user-123";

  beforeEach(async () => {
    // Set up test environment with custom data directory
    process.env.DATA_DIR = path.join(process.cwd(), ".data", "test");

    // Clean up test data for this specific user before each test
    const userDir = path.join(getUserDataDir(), testUserId);
    try {
      await fs.rm(userDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up after tests
    const testDataDir = path.join(process.cwd(), ".data", "test");
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
    delete process.env.DATA_DIR;
  });

  describe("getUserDataDir", () => {
    it("should return custom data directory when DATA_DIR is set", () => {
      process.env.DATA_DIR = "/custom/data";
      expect(getUserDataDir()).toBe("/custom/data/users");
    });

    it("should return production path in production mode", () => {
      delete process.env.DATA_DIR;
      process.env.NODE_ENV = "production";
      expect(getUserDataDir()).toBe("/data/users");
    });

    it("should return development path in development mode", () => {
      delete process.env.DATA_DIR;
      process.env.NODE_ENV = "development";
      expect(getUserDataDir()).toContain(".data/users");
    });
  });

  describe("getUserPortfolioPath", () => {
    it("should return correct portfolio path for user", () => {
      const path = getUserPortfolioPath(testUserId);
      expect(path).toContain(testUserId);
      expect(path).toContain("portfolio.json");
    });
  });

  describe("loadUserPortfolio", () => {
    it("should return empty array for new user", async () => {
      const properties = await loadUserPortfolio(testUserId);
      expect(properties).toEqual([]);
    });

    it("should load saved properties", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        address: "Test Street 1",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await saveUserPortfolio(testUserId, [mockProperty]);
      const properties = await loadUserPortfolio(testUserId);

      expect(properties).toHaveLength(1);
      expect(properties[0].id).toBe("prop-1");
      expect(properties[0].name).toBe("Test Property");
    });

    it("should convert date strings to Date objects", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await saveUserPortfolio(testUserId, [mockProperty]);
      const properties = await loadUserPortfolio(testUserId);

      expect(properties[0].createdAt).toBeInstanceOf(Date);
      expect(properties[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("saveUserPortfolio", () => {
    it("should create user directory if it doesn't exist", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await saveUserPortfolio(testUserId, [mockProperty]);

      const portfolioPath = getUserPortfolioPath(testUserId);
      const exists = await fs
        .access(portfolioPath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it("should save properties to JSON file", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await saveUserPortfolio(testUserId, [mockProperty]);

      const portfolioPath = getUserPortfolioPath(testUserId);
      const data = await fs.readFile(portfolioPath, "utf-8");
      const portfolio = JSON.parse(data);

      expect(portfolio.userId).toBe(testUserId);
      expect(portfolio.properties).toHaveLength(1);
      expect(portfolio.updatedAt).toBeDefined();
    });
  });

  describe("addPropertyToPortfolio", () => {
    it("should add property to empty portfolio", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      const properties = await addPropertyToPortfolio(testUserId, mockProperty);

      expect(properties).toHaveLength(1);
      expect(properties[0].id).toBe("prop-1");
    });

    it("should add property to existing portfolio", async () => {
      const property1: Property = {
        id: "prop-1",
        name: "Property 1",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      const property2: Property = {
        id: "prop-2",
        name: "Property 2",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await addPropertyToPortfolio(testUserId, property1);
      const properties = await addPropertyToPortfolio(testUserId, property2);

      expect(properties).toHaveLength(2);
      expect(properties[0].id).toBe("prop-1");
      expect(properties[1].id).toBe("prop-2");
    });
  });

  describe("updatePropertyInPortfolio", () => {
    it("should update existing property", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await addPropertyToPortfolio(testUserId, mockProperty);

      const properties = await updatePropertyInPortfolio(testUserId, "prop-1", {
        name: "Updated Property",
        address: "New Address",
      });

      expect(properties[0].name).toBe("Updated Property");
      expect(properties[0].address).toBe("New Address");
    });

    it("should throw error for non-existent property", async () => {
      await expect(
        updatePropertyInPortfolio(testUserId, "non-existent", { name: "Test" })
      ).rejects.toThrow("Property not found");
    });

    it("should update updatedAt timestamp", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date("2020-01-01"),
        updatedAt: new Date("2020-01-01"),
        input: getDefaultPropertyInput(),
      };

      await addPropertyToPortfolio(testUserId, mockProperty);

      const properties = await updatePropertyInPortfolio(testUserId, "prop-1", {
        name: "Updated",
      });

      expect(properties[0].updatedAt.getTime()).toBeGreaterThan(new Date("2020-01-01").getTime());
    });
  });

  describe("deletePropertyFromPortfolio", () => {
    it("should delete existing property", async () => {
      const property1: Property = {
        id: "prop-1",
        name: "Property 1",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      const property2: Property = {
        id: "prop-2",
        name: "Property 2",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await addPropertyToPortfolio(testUserId, property1);
      await addPropertyToPortfolio(testUserId, property2);

      const properties = await deletePropertyFromPortfolio(testUserId, "prop-1");

      expect(properties).toHaveLength(1);
      expect(properties[0].id).toBe("prop-2");
    });

    it("should throw error for non-existent property", async () => {
      await expect(deletePropertyFromPortfolio(testUserId, "non-existent")).rejects.toThrow(
        "Property not found"
      );
    });
  });

  describe("getPropertyFromPortfolio", () => {
    it("should return property if it exists", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await addPropertyToPortfolio(testUserId, mockProperty);
      const property = await getPropertyFromPortfolio(testUserId, "prop-1");

      expect(property).toBeDefined();
      expect(property?.id).toBe("prop-1");
      expect(property?.name).toBe("Test Property");
    });

    it("should return null for non-existent property", async () => {
      const property = await getPropertyFromPortfolio(testUserId, "non-existent");
      expect(property).toBeNull();
    });
  });

  describe("User isolation", () => {
    it("should keep user portfolios separate", async () => {
      const user1Id = "user-1";
      const user2Id = "user-2";

      const property1: Property = {
        id: "prop-1",
        name: "User 1 Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      const property2: Property = {
        id: "prop-2",
        name: "User 2 Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await addPropertyToPortfolio(user1Id, property1);
      await addPropertyToPortfolio(user2Id, property2);

      const user1Portfolio = await loadUserPortfolio(user1Id);
      const user2Portfolio = await loadUserPortfolio(user2Id);

      expect(user1Portfolio).toHaveLength(1);
      expect(user1Portfolio[0].name).toBe("User 1 Property");

      expect(user2Portfolio).toHaveLength(1);
      expect(user2Portfolio[0].name).toBe("User 2 Property");
    });
  });
});
