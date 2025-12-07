/**
 * Session management utilities
 * Uses JWT tokens for stateless sessions
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.JWT_SECRET;

// In production environments (not during build), enforce JWT_SECRET
if (!SECRET_KEY && process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
  throw new Error("JWT_SECRET environment variable is required in production");
}

if (!SECRET_KEY) {
  console.warn("JWT_SECRET not set. Using default secret key for development only.");
}

const secret = new TextEncoder().encode(SECRET_KEY || "default-dev-secret-key-change-me");

export interface SessionData {
  userId: string;
  username: string;
  createdAt?: number;
  [key: string]: string | number | undefined;
}

const SESSION_COOKIE_NAME = "auth-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Create a new session token
 */
export async function createSession(userId: string, username: string): Promise<string> {
  const token = await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionData;
  } catch {
    return null;
  }
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Set the session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
