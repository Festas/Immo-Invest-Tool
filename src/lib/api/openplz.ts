/**
 * OpenPLZ API Integration
 * Kostenlose API für deutsche PLZ und Ortsdaten
 * https://openplzapi.org/
 */

export interface PLZResult {
  postalCode: string;
  name: string; // Ortsname
  district?: string; // Landkreis
  state: string; // Bundesland
  latitude: number;
  longitude: number;
}

/**
 * Suche nach PLZ oder Ortsname
 */
export async function searchLocations(query: string): Promise<PLZResult[]> {
  if (!query || query.length < 2) return [];

  try {
    // PLZ-Suche (wenn Zahl)
    if (/^\d+$/.test(query)) {
      const response = await fetch(
        `https://openplzapi.org/de/Localities?postalCode=${encodeURIComponent(query)}&page=1&pageSize=10`
      );
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      return mapApiResponse(data);
    }

    // Ortsname-Suche
    const response = await fetch(
      `https://openplzapi.org/de/Localities?name=${encodeURIComponent(query)}&page=1&pageSize=10`
    );
    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    return mapApiResponse(data);
  } catch (error) {
    console.error("OpenPLZ API Error:", error);
    return [];
  }
}

function mapApiResponse(data: Array<Record<string, unknown>>): PLZResult[] {
  return data.map((item) => ({
    postalCode: item.postalCode as string,
    name: item.name as string,
    district: (item.district as Record<string, unknown>)?.name as string | undefined,
    state: ((item.federalState as Record<string, unknown>)?.name as string) || "",
    latitude: (item.latitude as number) || 0,
    longitude: (item.longitude as number) || 0,
  }));
}

/**
 * Bundesland zu Grunderwerbsteuer-Key mappen
 */
export function mapStateToBundesland(stateName: string): string {
  const mapping: Record<string, string> = {
    "Baden-Württemberg": "BADEN_WUERTTEMBERG",
    Bayern: "BAYERN",
    Berlin: "BERLIN",
    Brandenburg: "BRANDENBURG",
    Bremen: "BREMEN",
    Hamburg: "HAMBURG",
    Hessen: "HESSEN",
    "Mecklenburg-Vorpommern": "MECKLENBURG_VORPOMMERN",
    Niedersachsen: "NIEDERSACHSEN",
    "Nordrhein-Westfalen": "NORDRHEIN_WESTFALEN",
    "Rheinland-Pfalz": "RHEINLAND_PFALZ",
    Saarland: "SAARLAND",
    Sachsen: "SACHSEN",
    "Sachsen-Anhalt": "SACHSEN_ANHALT",
    "Schleswig-Holstein": "SCHLESWIG_HOLSTEIN",
    Thüringen: "THUERINGEN",
  };
  return mapping[stateName] || "BAYERN";
}
