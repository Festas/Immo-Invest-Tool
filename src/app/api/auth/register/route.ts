import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, findUserByUsername } from "@/lib/auth/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, passwordRepeat } = body;

    // Validate input
    if (!username || !password || !passwordRepeat) {
      return NextResponse.json(
        { error: "Username, password, and password confirmation are required" },
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, underscores, and hyphens" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== passwordRepeat) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser(username, passwordHash);

    // Return success (without password hash)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Check for permission errors (EACCES)
    if (error instanceof Error && "code" in error && error.code === "EACCES") {
      return NextResponse.json(
        {
          error:
            "Storage permission error. The server cannot write user data. Please check the DATA_DIR configuration and ensure the directory has write permissions.",
          code: "STORAGE_ERROR",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}
