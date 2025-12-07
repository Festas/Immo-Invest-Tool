/**
 * Portfolio API - Operations on specific properties
 * GET /api/portfolio/[id] - Get a specific property
 * PUT /api/portfolio/[id] - Update a property
 * DELETE /api/portfolio/[id] - Delete a property
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getPropertyFromPortfolio,
  updatePropertyInPortfolio,
  deletePropertyFromPortfolio,
} from "@/lib/storage/user-portfolio";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/portfolio/[id] - Get a specific property
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id } = await params;

    // Get property from user's portfolio
    const property = await getPropertyFromPortfolio(session.userId, id);

    if (!property) {
      return NextResponse.json({ error: "Immobilie nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("[Portfolio API] Error getting property:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Immobilie" }, { status: 500 });
  }
}

/**
 * PUT /api/portfolio/[id] - Update a property
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const updates = body.updates;

    if (!updates) {
      return NextResponse.json({ error: "Keine Änderungen angegeben" }, { status: 400 });
    }

    // Update property in user's portfolio
    const properties = await updatePropertyInPortfolio(session.userId, id, updates);

    return NextResponse.json({ success: true, properties });
  } catch (error) {
    if (error instanceof Error && error.message === "Property not found") {
      return NextResponse.json({ error: "Immobilie nicht gefunden" }, { status: 404 });
    }

    console.error("[Portfolio API] Error updating property:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren der Immobilie" }, { status: 500 });
  }
}

/**
 * DELETE /api/portfolio/[id] - Delete a property
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id } = await params;

    // Delete property from user's portfolio
    const properties = await deletePropertyFromPortfolio(session.userId, id);

    return NextResponse.json({ success: true, properties });
  } catch (error) {
    if (error instanceof Error && error.message === "Property not found") {
      return NextResponse.json({ error: "Immobilie nicht gefunden" }, { status: 404 });
    }

    console.error("[Portfolio API] Error deleting property:", error);
    return NextResponse.json({ error: "Fehler beim Löschen der Immobilie" }, { status: 500 });
  }
}
