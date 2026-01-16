/**
 * User CRUD operations with Prisma
 */

import prisma from "./prisma";
import { User } from "@prisma/client";

/**
 * Create a new user
 */
export async function createUser(
  username: string,
  passwordHash: string,
  email?: string
): Promise<User> {
  return await prisma.user.create({
    data: {
      username,
      passwordHash,
      email,
    },
  });
}

/**
 * Find a user by username (case-insensitive)
 */
export async function findUserByUsername(username: string): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });
}

/**
 * Find a user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Update user fields
 */
export async function updateUser(
  id: string,
  data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(id: string): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data: {
      lastLoginAt: new Date(),
    },
  });
}

/**
 * Increment failed login attempts
 */
export async function incrementFailedLogins(id: string): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data: {
      failedLoginAttempts: {
        increment: 1,
      },
    },
  });
}

/**
 * Reset failed login attempts
 */
export async function resetFailedLogins(id: string): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data: {
      failedLoginAttempts: 0,
    },
  });
}
