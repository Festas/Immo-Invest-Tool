/**
 * Rent Index API (Mietpreisspiegel)
 *
 * Integration layer for German rent data.
 * Structure for real rent data integration with fallback to static data.
 */

import { ReferenceRentData } from "@/types";

export interface RentData {
  city: string;
  district?: string;
  avgRentPerSqm: number;
  rentRange: { min: number; max: number };
  lastUpdated: Date;
  source: string;
}

export interface RentAdjustmentFactor {
  factor: string;
  adjustmentPercent: number;
  description: string;
}

export interface DetailedRentData extends RentData {
  yearBuiltAdjustments: Record<string, number>;
  conditionAdjustments: Record<string, number>;
  equipmentAdjustments: Record<string, number>;
  floorAdjustments: Record<number, number>;
}

// Static rent data from types (acts as fallback)
const getStaticRentData = (city: string): RentData => {
  const data = ReferenceRentData[city] || ReferenceRentData.SONSTIGE;
  return {
    city: data.city,
    avgRentPerSqm: data.avgRentPerSqm,
    rentRange: { min: data.minRent, max: data.maxRent },
    lastUpdated: new Date(),
    source: "Statische Daten (Schätzwerte)",
  };
};

/**
 * Fetch rent data for a city
 */
export async function fetchRentData(city: string): Promise<RentData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In production, this would call a real API
  // For now, return static data
  return getStaticRentData(city);
}

/**
 * Fetch detailed rent data with adjustment factors
 */
export async function fetchDetailedRentData(city: string): Promise<DetailedRentData> {
  const baseData = await fetchRentData(city);

  return {
    ...baseData,
    yearBuiltAdjustments: {
      vor_1918: -10,
      "1918_1948": -5,
      "1949_1978": 0,
      "1979_1990": 5,
      "1991_2010": 10,
      ab_2011: 15,
    },
    conditionAdjustments: {
      RENOVIERUNGSBEDUERFTIG: -15,
      MITTEL: -5,
      GUT: 0,
      SEHR_GUT: 10,
    },
    equipmentAdjustments: {
      EINFACH: -10,
      STANDARD: 0,
      GEHOBEN: 12,
    },
    floorAdjustments: {
      0: -3, // Ground floor
      1: 0,
      2: 2,
      3: 3,
      4: 3,
      5: 2, // High floors without elevator
    },
  };
}

/**
 * Get all available cities
 */
export function getAvailableCities(): string[] {
  return Object.keys(ReferenceRentData);
}

/**
 * Calculate adjusted rent based on property characteristics
 */
export function calculateAdjustedRent(
  baseRent: number,
  yearBuilt: number,
  condition: "SEHR_GUT" | "GUT" | "MITTEL" | "RENOVIERUNGSBEDUERFTIG",
  equipment: "GEHOBEN" | "STANDARD" | "EINFACH",
  floor: number,
  hasBalcony: boolean,
  hasElevator: boolean
): {
  adjustedRent: number;
  adjustments: RentAdjustmentFactor[];
} {
  let adjustedRent = baseRent;
  const adjustments: RentAdjustmentFactor[] = [];

  // Year built adjustment
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearBuilt;
  let yearAdjustment = 0;
  if (age < 5) yearAdjustment = 15;
  else if (age < 15) yearAdjustment = 10;
  else if (age < 30) yearAdjustment = 5;
  else if (age < 50) yearAdjustment = 0;
  else if (age < 80) yearAdjustment = -8;
  else yearAdjustment = -15;

  adjustedRent *= 1 + yearAdjustment / 100;
  adjustments.push({
    factor: "Baujahr",
    adjustmentPercent: yearAdjustment,
    description: `Baujahr ${yearBuilt} (${age} Jahre alt)`,
  });

  // Condition adjustment
  const conditionAdjustments: Record<string, number> = {
    SEHR_GUT: 10,
    GUT: 0,
    MITTEL: -8,
    RENOVIERUNGSBEDUERFTIG: -20,
  };
  const conditionAdj = conditionAdjustments[condition];
  adjustedRent *= 1 + conditionAdj / 100;
  adjustments.push({
    factor: "Zustand",
    adjustmentPercent: conditionAdj,
    description: condition.replace("_", " ").toLowerCase(),
  });

  // Equipment adjustment
  const equipmentAdjustments: Record<string, number> = {
    GEHOBEN: 12,
    STANDARD: 0,
    EINFACH: -10,
  };
  const equipmentAdj = equipmentAdjustments[equipment];
  adjustedRent *= 1 + equipmentAdj / 100;
  adjustments.push({
    factor: "Ausstattung",
    adjustmentPercent: equipmentAdj,
    description: equipment.toLowerCase(),
  });

  // Floor adjustment
  let floorAdj = 0;
  if (floor === 0) floorAdj = -3;
  else if (floor > 4 && !hasElevator) floorAdj = -5;
  else if (floor >= 2) floorAdj = 2;

  adjustedRent *= 1 + floorAdj / 100;
  adjustments.push({
    factor: "Etage",
    adjustmentPercent: floorAdj,
    description: `${floor}. Etage${hasElevator ? " (mit Aufzug)" : ""}`,
  });

  // Balcony bonus
  if (hasBalcony) {
    adjustedRent *= 1.03;
    adjustments.push({
      factor: "Balkon/Terrasse",
      adjustmentPercent: 3,
      description: "Vorhanden",
    });
  }

  return {
    adjustedRent: Math.round(adjustedRent * 100) / 100,
    adjustments,
  };
}

/**
 * Calculate rent increase potential
 */
export function calculateRentPotential(
  currentRent: number,
  marketRent: number,
  yearsAtCurrentRent: number = 0
): {
  potentialIncrease: number;
  potentialPercent: number;
  cappedIncrease: number; // Kappungsgrenze (15-20% in 3 years)
  timeToReachMarket: number; // years
  recommendation: string;
} {
  const potential = marketRent - currentRent;
  const potentialPercent = currentRent > 0 ? (potential / currentRent) * 100 : 0;

  // Kappungsgrenze: max 15-20% increase in 3 years (depends on local market)
  const maxIncreasePercent = 15; // Conservative estimate
  const cappedIncrease = Math.min(potential, (currentRent * maxIncreasePercent) / 100);

  // Time to reach market rent with yearly increases
  const yearlyIncreasePercent = 5; // Assumption
  const timeToReachMarket =
    potential > 0
      ? Math.ceil(Math.log(marketRent / currentRent) / Math.log(1 + yearlyIncreasePercent / 100))
      : 0;

  let recommendation: string;
  if (potentialPercent > 20) {
    recommendation =
      "Erhebliches Mieterhöhungspotenzial. Eine schrittweise Anpassung innerhalb der gesetzlichen Grenzen ist empfehlenswert.";
  } else if (potentialPercent > 10) {
    recommendation =
      "Moderates Mieterhöhungspotenzial vorhanden. Eine Mietanpassung könnte geprüft werden.";
  } else if (potentialPercent > 0) {
    recommendation =
      "Geringes Mieterhöhungspotenzial. Die aktuelle Miete liegt nahe am Marktniveau.";
  } else {
    recommendation =
      "Die aktuelle Miete liegt über dem Marktniveau. Bei Neuvermietungen ist Vorsicht geboten.";
  }

  return {
    potentialIncrease: Math.round(potential * 100) / 100,
    potentialPercent: Math.round(potentialPercent * 10) / 10,
    cappedIncrease: Math.round(cappedIncrease * 100) / 100,
    timeToReachMarket,
    recommendation,
  };
}

/**
 * Get rent comparison with similar properties
 */
export async function fetchComparableRents(
  city: string,
  livingArea: number,
  yearBuilt: number,
  rooms: number
): Promise<{
  comparables: Array<{ rentPerSqm: number; area: number; yearBuilt: number }>;
  avgRentPerSqm: number;
  medianRentPerSqm: number;
}> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const baseData = await fetchRentData(city);
  const baseRent = baseData.avgRentPerSqm;

  // Generate mock comparable properties
  const comparables = Array.from({ length: 5 }, () => {
    const areaVariation = livingArea * (0.8 + Math.random() * 0.4);
    const yearVariation = yearBuilt + Math.floor((Math.random() - 0.5) * 20);
    const rentVariation = baseRent * (0.85 + Math.random() * 0.3);

    return {
      rentPerSqm: Math.round(rentVariation * 100) / 100,
      area: Math.round(areaVariation),
      yearBuilt: yearVariation,
    };
  });

  const rents = comparables.map((c) => c.rentPerSqm);
  const avgRentPerSqm = rents.reduce((a, b) => a + b, 0) / rents.length;
  const sortedRents = [...rents].sort((a, b) => a - b);
  const medianRentPerSqm = sortedRents[Math.floor(sortedRents.length / 2)];

  return {
    comparables,
    avgRentPerSqm: Math.round(avgRentPerSqm * 100) / 100,
    medianRentPerSqm: Math.round(medianRentPerSqm * 100) / 100,
  };
}
