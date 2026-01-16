/**
 * User storage using Prisma ORM
 * Migrated from JSON file-based storage to PostgreSQL database
 */

import * as userDb from "@/lib/db/user";

export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Find a user by username (case-insensitive)
 */
export async function findUserByUsername(username: string): Promise<StoredUser | null> {
  try {
    const user = await userDb.findUserByUsername(username);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (error) {
    // Re-throw with context
    console.error("[Storage] Error finding user by username:", {
      username,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Find a user by ID
 */
export async function findUserById(id: string): Promise<StoredUser | null> {
  const user = await userDb.findUserById(id);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Create a new user
 */
export async function createUser(username: string, passwordHash: string): Promise<StoredUser> {
  // Check if username already exists
  const existingUser = await userDb.findUserByUsername(username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const user = await userDb.createUser(username, passwordHash);

  return {
    id: user.id,
    username: user.username,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt.toISOString(),
  };
}
