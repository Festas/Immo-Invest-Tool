import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByUsername } from "@/lib/auth/storage";
import { createSession, setSessionCookie } from "@/lib/auth/session";

/**
 * Helper to check if an error has a specific error code
 */
function hasErrorCode(error: unknown, code: string): boolean {
  return (
    error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === code
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let username: string | undefined;

  try {
    const body = await request.json();
    username = body.username;
    const password = body.password;

    // Validate input
    if (!username || !password) {
      console.warn("[Login] Missing credentials - username or password not provided");
      return NextResponse.json(
        {
          error: "Benutzername und Passwort sind erforderlich.",
          code: "MISSING_CREDENTIALS",
        },
        { status: 400 }
      );
    }

    // Find user
    let user;
    try {
      user = await findUserByUsername(username);
    } catch (storageError) {
      // Log storage errors with details
      console.error("[Login] Storage error while finding user:", {
        username,
        error: storageError instanceof Error ? storageError.message : String(storageError),
        code: (storageError as NodeJS.ErrnoException).code,
        stack: storageError instanceof Error ? storageError.stack : undefined,
      });

      // Check for specific file system errors
      if (hasErrorCode(storageError, "EACCES")) {
        return NextResponse.json(
          {
            error:
              "Fehler beim Zugriff auf Benutzerdaten. Bitte kontaktieren Sie den Administrator.",
            code: "STORAGE_PERMISSION_ERROR",
          },
          { status: 500 }
        );
      }

      if (hasErrorCode(storageError, "ENOENT")) {
        return NextResponse.json(
          {
            error: "Benutzerdatenbank nicht gefunden. Bitte kontaktieren Sie den Administrator.",
            code: "STORAGE_NOT_FOUND",
          },
          { status: 500 }
        );
      }

      // Generic storage error
      return NextResponse.json(
        {
          error: "Fehler beim Laden der Benutzerdaten. Bitte versuchen Sie es später erneut.",
          code: "STORAGE_ERROR",
        },
        { status: 500 }
      );
    }

    if (!user) {
      const duration = Date.now() - startTime;
      console.warn("[Login] Failed - user not found:", { username, duration: `${duration}ms` });
      return NextResponse.json(
        {
          error: "Ungültiger Benutzername oder Passwort.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    // Verify password
    let isValidPassword: boolean;
    try {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } catch (bcryptError) {
      console.error("[Login] Password verification error:", {
        username,
        error: bcryptError instanceof Error ? bcryptError.message : String(bcryptError),
      });
      return NextResponse.json(
        {
          error: "Fehler bei der Passwortüberprüfung. Bitte versuchen Sie es erneut.",
          code: "PASSWORD_VERIFICATION_ERROR",
        },
        { status: 500 }
      );
    }

    if (!isValidPassword) {
      const duration = Date.now() - startTime;
      console.warn("[Login] Failed - invalid password:", { username, duration: `${duration}ms` });
      return NextResponse.json(
        {
          error: "Ungültiger Benutzername oder Passwort.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    // Create session
    let token: string;
    try {
      token = await createSession(user.id, user.username);
    } catch (sessionError) {
      console.error("[Login] Session creation error:", {
        username,
        userId: user.id,
        error: sessionError instanceof Error ? sessionError.message : String(sessionError),
        stack: sessionError instanceof Error ? sessionError.stack : undefined,
      });

      // Check if JWT_SECRET is missing
      if (sessionError instanceof Error && sessionError.message.includes("JWT_SECRET")) {
        return NextResponse.json(
          {
            error: "Server-Konfigurationsfehler. Bitte kontaktieren Sie den Administrator.",
            code: "SESSION_CONFIG_ERROR",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Fehler beim Erstellen der Sitzung. Bitte versuchen Sie es erneut.",
          code: "SESSION_CREATION_ERROR",
        },
        { status: 500 }
      );
    }

    // Set session cookie
    try {
      await setSessionCookie(token);
    } catch (cookieError) {
      console.error("[Login] Cookie setting error:", {
        username,
        userId: user.id,
        error: cookieError instanceof Error ? cookieError.message : String(cookieError),
      });
      return NextResponse.json(
        {
          error: "Fehler beim Speichern der Sitzung. Bitte versuchen Sie es erneut.",
          code: "COOKIE_ERROR",
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.info("[Login] Success:", { username, userId: user.id, duration: `${duration}ms` });

    // Return success
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Login] Unexpected error:", {
      username: username || "unknown",
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        code: "UNEXPECTED_ERROR",
      },
      { status: 500 }
    );
  }
}
