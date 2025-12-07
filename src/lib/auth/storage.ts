/**
 * Simple user storage for basic authentication
 * In production, this should be replaced with a proper database
 */

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

// Storage directory - configurable via environment variable
// Default: .data for development, /data/.auth for production
const getStorageDir = () => {
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }
  // In Docker/production, use /data/.auth (writable location)
  // In development, use .data in project root
  return process.env.NODE_ENV === "production" ? "/data/.auth" : path.join(process.cwd(), ".data");
};

// Storage file path - in production this would be a database
const STORAGE_PATH = path.join(getStorageDir(), "users.json");

// Ensure storage directory exists
async function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Load users from storage
async function loadUsers(): Promise<StoredUser[]> {
  try {
    await ensureStorageDir();
    const data = await fs.readFile(STORAGE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Save users to storage
async function saveUsers(users: StoredUser[]): Promise<void> {
  await ensureStorageDir();
  await fs.writeFile(STORAGE_PATH, JSON.stringify(users, null, 2), "utf-8");
}

/**
 * Find a user by username
 */
export async function findUserByUsername(username: string): Promise<StoredUser | null> {
  const users = await loadUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * Find a user by ID
 */
export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await loadUsers();
  return users.find((u) => u.id === id) || null;
}

/**
 * Create a new user
 */
export async function createUser(username: string, passwordHash: string): Promise<StoredUser> {
  const users = await loadUsers();

  // Check if username already exists
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Username already exists");
  }

  const newUser: StoredUser = {
    id: randomUUID(),
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  return newUser;
}
