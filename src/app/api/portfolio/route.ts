/**
 * Portfolio API - Get all properties for the authenticated user
 * GET /api/portfolio - List all properties
 * POST /api/portfolio - Create a new property
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { loadUserPortfolio, addPropertyToPortfolio } from "@/lib/storage/user-portfolio";
import { Property } from "@/types";

/**
 * GET /api/portfolio - Get all properties for authenticated user
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    // Load user's portfolio
    const properties = await loadUserPortfolio(session.userId);

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("[Portfolio API] Error loading portfolio:", error);
    return NextResponse.json({ error: "Fehler beim Laden des Portfolios" }, { status: 500 });
  }
}

/**
 * POST /api/portfolio - Create a new property
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const property: Property = body.property;

    // Validate required fields
    if (!property || !property.id || !property.name) {
      return NextResponse.json(
        { error: "Ungültige Immobiliendaten: ID und Name sind erforderlich" },
        { status: 400 }
      );
    }

    // Validate property structure
    if (!property.input || typeof property.input !== "object") {
      return NextResponse.json(
        { error: "Ungültige Immobiliendaten: Eingabedaten fehlen" },
        { status: 400 }
      );
    }

    // Validate dates
    if (!property.createdAt || !property.updatedAt) {
      return NextResponse.json(
        { error: "Ungültige Immobiliendaten: Zeitstempel fehlen" },
        { status: 400 }
      );
    }

    // Add property to user's portfolio
    const properties = await addPropertyToPortfolio(session.userId, property);

    return NextResponse.json({ success: true, properties });
  } catch (error) {
    console.error("[Portfolio API] Error creating property:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen der Immobilie" }, { status: 500 });
  }
}
