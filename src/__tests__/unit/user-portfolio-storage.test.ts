/**
 * Tests for per-user portfolio storage (Prisma-based)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
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

// Mock the Prisma-based db/property module
vi.mock("@/lib/db/property", () => {
  // In-memory storage to simulate the database per-user
  const storage: Record<string, Property[]> = {};

  return {
    getPropertiesByUserId: vi.fn(async (userId: string) => {
      return storage[userId] || [];
    }),
    createProperty: vi.fn(async (userId: string, data: Property) => {
      if (!storage[userId]) {
        storage[userId] = [];
      }
      storage[userId].push({ ...data });
      return data;
    }),
    getPropertyById: vi.fn(async (id: string, userId: string) => {
      const userProps = storage[userId] || [];
      return userProps.find((p) => p.id === id) || null;
    }),
    updateProperty: vi.fn(async (id: string, userId: string, updates: Partial<Property>) => {
      const userProps = storage[userId] || [];
      const index = userProps.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Property not found or access denied");
      }
      userProps[index] = {
        ...userProps[index],
        ...updates,
        updatedAt: new Date(),
      };
      return userProps[index];
    }),
    deleteProperty: vi.fn(async (id: string, userId: string) => {
      const userProps = storage[userId] || [];
      const index = userProps.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Property not found or access denied");
      }
      userProps.splice(index, 1);
    }),
    // Expose storage for cleanup
    __storage: storage,
  };
});

// Import the mock for cleanup
import * as propertyDb from "@/lib/db/property";

describe("Per-User Portfolio Storage", () => {
  const testUserId = "test-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear in-memory storage
    const storage = (propertyDb as unknown as { __storage: Record<string, Property[]> }).__storage;
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  });

  describe("getUserDataDir", () => {
    it("should return a string containing 'users'", () => {
      const dir = getUserDataDir();
      expect(dir).toContain("users");
    });
  });

  describe("getUserPortfolioPath", () => {
    it("should return correct portfolio path for user", () => {
      const portfolioPath = getUserPortfolioPath(testUserId);
      expect(portfolioPath).toContain(testUserId);
      expect(portfolioPath).toContain("portfolio.json");
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

      await addPropertyToPortfolio(testUserId, mockProperty);
      const properties = await loadUserPortfolio(testUserId);

      expect(properties).toHaveLength(1);
      expect(properties[0].id).toBe("prop-1");
      expect(properties[0].name).toBe("Test Property");
    });

    it("should return properties with Date objects", async () => {
      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await addPropertyToPortfolio(testUserId, mockProperty);
      const properties = await loadUserPortfolio(testUserId);

      expect(properties[0].createdAt).toBeInstanceOf(Date);
      expect(properties[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("saveUserPortfolio", () => {
    it("should log deprecation warning", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const mockProperty: Property = {
        id: "prop-1",
        name: "Test Property",
        createdAt: new Date(),
        updatedAt: new Date(),
        input: getDefaultPropertyInput(),
      };

      await saveUserPortfolio(testUserId, [mockProperty]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("saveUserPortfolio is deprecated")
      );
      consoleSpy.mockRestore();
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
      ).rejects.toThrow("Property not found or access denied");
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
        "Property not found or access denied"
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
