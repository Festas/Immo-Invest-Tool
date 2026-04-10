/**
 * Per-user portfolio storage using Prisma ORM
 * Migrated from JSON file-based storage to PostgreSQL database
 */

import { Property } from "@/types";
import * as propertyDb from "@/lib/db/property";

/**
 * Portfolio data structure for storage (maintained for compatibility)
 */
export interface UserPortfolio {
  userId: string;
  properties: Property[];
  updatedAt: string;
}

/**
 * Load user's portfolio from database
 */
export async function loadUserPortfolio(userId: string): Promise<Property[]> {
  try {
    return await propertyDb.getPropertiesByUserId(userId);
  } catch (error) {
    console.error("[Portfolio Storage] Error loading portfolio:", error);
    throw error;
  }
}

/**
 * Save user's portfolio to database
 * Note: This function is maintained for compatibility but individual
 * property operations (add, update, delete) are preferred
 */
export async function saveUserPortfolio(userId: string, properties: Property[]): Promise<void> {
  // This is a legacy function - in practice, properties should be
  // added/updated/deleted individually through the database layer
  console.warn(
    `[Portfolio Storage] saveUserPortfolio is deprecated - use individual property operations (userId: ${userId}, count: ${properties.length})`
  );
}

/**
 * Add a property to user's portfolio
 */
export async function addPropertyToPortfolio(
  userId: string,
  property: Property
): Promise<Property[]> {
  await propertyDb.createProperty(userId, property);
  return await propertyDb.getPropertiesByUserId(userId);
}

/**
 * Update a property in user's portfolio
 */
export async function updatePropertyInPortfolio(
  userId: string,
  propertyId: string,
  updates: Partial<Property>
): Promise<Property[]> {
  await propertyDb.updateProperty(propertyId, userId, updates);
  return await propertyDb.getPropertiesByUserId(userId);
}

/**
 * Delete a property from user's portfolio
 */
export async function deletePropertyFromPortfolio(
  userId: string,
  propertyId: string
): Promise<Property[]> {
  await propertyDb.deleteProperty(propertyId, userId);
  return await propertyDb.getPropertiesByUserId(userId);
}

/**
 * Get a single property from user's portfolio
 */
export async function getPropertyFromPortfolio(
  userId: string,
  propertyId: string
): Promise<Property | null> {
  return await propertyDb.getPropertyById(propertyId, userId);
}

// Legacy functions kept for backward compatibility but not actively used
export function getUserDataDir(): string {
  console.warn("[Portfolio Storage] getUserDataDir is deprecated");
  return ".data/users";
}

export function getUserPortfolioPath(userId: string): string {
  console.warn("[Portfolio Storage] getUserPortfolioPath is deprecated");
  return `.data/users/${userId}/portfolio.json`;
}
