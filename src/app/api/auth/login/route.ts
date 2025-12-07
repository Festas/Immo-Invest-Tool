import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByUsername } from "@/lib/auth/storage";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Find user
    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Create session
    const token = await createSession(user.id, user.username);
    await setSessionCookie(token);

    // Return success
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    );
  }
}
