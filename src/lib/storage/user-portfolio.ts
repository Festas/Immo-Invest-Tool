/**
 * Per-user portfolio storage
 * Each user has their own private portfolio file under /data/users/<userId>/portfolio.json
 */

import fs from "fs/promises";
import path from "path";
import { Property } from "@/types";

/**
 * Get the base storage directory for user data
 */
export function getUserDataDir(): string {
  if (process.env.DATA_DIR) {
    return path.join(process.env.DATA_DIR, "users");
  }
  // In Docker/production, use /data/users
  // In development, use .data/users in project root
  return process.env.NODE_ENV === "production"
    ? "/data/users"
    : path.join(process.cwd(), ".data", "users");
}

/**
 * Validate and sanitize user ID to prevent path traversal attacks
 */
function validateUserId(userId: string): string {
  // Only allow alphanumeric characters, hyphens, and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
    throw new Error("Invalid user ID format");
  }
  // Prevent path traversal
  if (userId.includes("..") || userId.includes("/") || userId.includes("\\")) {
    throw new Error("Invalid user ID format");
  }
  return userId;
}

/**
 * Get the portfolio file path for a specific user
 */
export function getUserPortfolioPath(userId: string): string {
  const sanitizedUserId = validateUserId(userId);
  return path.join(getUserDataDir(), sanitizedUserId, "portfolio.json");
}

/**
 * Ensure user directory exists
 */
async function ensureUserDir(userId: string): Promise<void> {
  const sanitizedUserId = validateUserId(userId);
  const userDir = path.join(getUserDataDir(), sanitizedUserId);
  try {
    await fs.access(userDir);
  } catch {
    await fs.mkdir(userDir, { recursive: true });
  }
}

/**
 * Portfolio data structure for storage
 */
export interface UserPortfolio {
  userId: string;
  properties: Property[];
  updatedAt: string;
}

/**
 * Load user's portfolio from their private file
 */
export async function loadUserPortfolio(userId: string): Promise<Property[]> {
  try {
    const portfolioPath = getUserPortfolioPath(userId);
    const data = await fs.readFile(portfolioPath, "utf-8");
    const portfolio: UserPortfolio = JSON.parse(data);

    // Convert date strings back to Date objects
    return portfolio.properties.map((prop) => ({
      ...prop,
      createdAt: new Date(prop.createdAt),
      updatedAt: new Date(prop.updatedAt),
    }));
  } catch (error) {
    // If file doesn't exist, return empty portfolio
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Save user's portfolio to their private file
 */
export async function saveUserPortfolio(userId: string, properties: Property[]): Promise<void> {
  await ensureUserDir(userId);

  const portfolio: UserPortfolio = {
    userId,
    properties,
    updatedAt: new Date().toISOString(),
  };

  const portfolioPath = getUserPortfolioPath(userId);
  await fs.writeFile(portfolioPath, JSON.stringify(portfolio, null, 2), "utf-8");
}

/**
 * Add a property to user's portfolio
 */
export async function addPropertyToPortfolio(
  userId: string,
  property: Property
): Promise<Property[]> {
  const properties = await loadUserPortfolio(userId);
  properties.push(property);
  await saveUserPortfolio(userId, properties);
  return properties;
}

/**
 * Update a property in user's portfolio
 */
export async function updatePropertyInPortfolio(
  userId: string,
  propertyId: string,
  updates: Partial<Property>
): Promise<Property[]> {
  const properties = await loadUserPortfolio(userId);
  const index = properties.findIndex((p) => p.id === propertyId);

  if (index === -1) {
    throw new Error("Immobilie nicht gefunden");
  }

  properties[index] = {
    ...properties[index],
    ...updates,
    updatedAt: new Date(),
  };

  await saveUserPortfolio(userId, properties);
  return properties;
}

/**
 * Delete a property from user's portfolio
 */
export async function deletePropertyFromPortfolio(
  userId: string,
  propertyId: string
): Promise<Property[]> {
  const properties = await loadUserPortfolio(userId);
  const filtered = properties.filter((p) => p.id !== propertyId);

  if (filtered.length === properties.length) {
    throw new Error("Immobilie nicht gefunden");
  }

  await saveUserPortfolio(userId, filtered);
  return filtered;
}

/**
 * Get a single property from user's portfolio
 */
export async function getPropertyFromPortfolio(
  userId: string,
  propertyId: string
): Promise<Property | null> {
  const properties = await loadUserPortfolio(userId);
  return properties.find((p) => p.id === propertyId) || null;
}
