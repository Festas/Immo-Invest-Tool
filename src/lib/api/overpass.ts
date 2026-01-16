/**
 * Overpass API Integration
 * Kostenlose API für OpenStreetMap POI-Daten
 */

export interface POI {
  id: number;
  type: "school" | "transit" | "supermarket" | "hospital";
  name: string;
  lat: number;
  lon: number;
}

export interface POIStats {
  schools: number;
  transitStops: number;
  supermarkets: number;
  hospitals: number;
  pois: POI[];
}

/**
 * Lade POIs im Umkreis eines Standorts
 */
export async function fetchPOIsNearby(
  lat: number,
  lon: number,
  radiusMeters: number = 1000
): Promise<POIStats> {
  const query = `
    [out:json][timeout:25];
    (
      // Schulen
      node["amenity"="school"](around:${radiusMeters},${lat},${lon});
      way["amenity"="school"](around:${radiusMeters},${lat},${lon});
      // ÖPNV Haltestellen
      node["public_transport"="stop_position"](around:${radiusMeters},${lat},${lon});
      node["highway"="bus_stop"](around:${radiusMeters},${lat},${lon});
      node["railway"="station"](around:${radiusMeters},${lat},${lon});
      node["railway"="halt"](around:${radiusMeters},${lat},${lon});
      // Supermärkte
      node["shop"="supermarket"](around:${radiusMeters},${lat},${lon});
      way["shop"="supermarket"](around:${radiusMeters},${lat},${lon});
      // Krankenhäuser
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
    );
    out center;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) throw new Error("Overpass API Error");

    const data = await response.json();
    return parsePOIResponse(data.elements);
  } catch (error) {
    console.error("Overpass API Error:", error);
    return { schools: 0, transitStops: 0, supermarkets: 0, hospitals: 0, pois: [] };
  }
}

function parsePOIResponse(elements: Array<Record<string, unknown>>): POIStats {
  const pois: POI[] = [];
  let schools = 0;
  let transitStops = 0;
  let supermarkets = 0;
  let hospitals = 0;

  for (const el of elements) {
    // Type guards for coordinates
    const centerObj = el.center as Record<string, unknown> | undefined;
    const lat =
      typeof el.lat === "number"
        ? el.lat
        : typeof centerObj?.lat === "number"
          ? centerObj.lat
          : null;
    const lon =
      typeof el.lon === "number"
        ? el.lon
        : typeof centerObj?.lon === "number"
          ? centerObj.lon
          : null;

    if (lat === null || lon === null || typeof el.id !== "number") continue;

    const tags = (el.tags as Record<string, string>) || {};

    if (tags.amenity === "school") {
      schools++;
      pois.push({
        id: el.id,
        type: "school",
        name: tags.name || "Schule",
        lat,
        lon,
      });
    } else if (tags.public_transport || tags.highway === "bus_stop" || tags.railway) {
      transitStops++;
      pois.push({
        id: el.id,
        type: "transit",
        name: tags.name || "Haltestelle",
        lat,
        lon,
      });
    } else if (tags.shop === "supermarket") {
      supermarkets++;
      pois.push({
        id: el.id,
        type: "supermarket",
        name: tags.name || "Supermarkt",
        lat,
        lon,
      });
    } else if (tags.amenity === "hospital") {
      hospitals++;
      pois.push({
        id: el.id,
        type: "hospital",
        name: tags.name || "Krankenhaus",
        lat,
        lon,
      });
    }
  }

  return { schools, transitStops, supermarkets, hospitals, pois };
}

/**
 * Berechne Infrastruktur-Scores basierend auf POI-Anzahl
 */
export function calculateInfrastructureScores(stats: POIStats): {
  publicTransportScore: number;
  shoppingScore: number;
  schoolsScore: number;
  infrastructureScore: number;
} {
  // Score-Berechnung: 0-10 basierend auf Anzahl
  const publicTransportScore = Math.min(10, Math.round(stats.transitStops / 2));
  const shoppingScore = Math.min(10, Math.round(stats.supermarkets * 2));
  const schoolsScore = Math.min(10, Math.round(stats.schools * 2.5));
  const infrastructureScore = Math.round(
    (publicTransportScore + shoppingScore + schoolsScore + (stats.hospitals > 0 ? 2 : 0)) / 3.5
  );

  return {
    publicTransportScore: Math.max(1, publicTransportScore),
    shoppingScore: Math.max(1, shoppingScore),
    schoolsScore: Math.max(1, schoolsScore),
    infrastructureScore: Math.max(1, Math.min(10, infrastructureScore)),
  };
}
