/**
 * German federal states (Bundesländer) with property transfer tax rates
 * Data valid as of 2024
 */

export interface GermanState {
  name: string;
  taxRate: number; // Grunderwerbsteuer in %
}

export const GERMAN_STATES: Record<string, GermanState> = {
  BAYERN: { name: "Bayern", taxRate: 3.5 },
  BADEN_WUERTTEMBERG: { name: "Baden-Württemberg", taxRate: 5.0 },
  BERLIN: { name: "Berlin", taxRate: 6.0 },
  BRANDENBURG: { name: "Brandenburg", taxRate: 6.5 },
  BREMEN: { name: "Bremen", taxRate: 5.0 },
  HAMBURG: { name: "Hamburg", taxRate: 5.5 },
  HESSEN: { name: "Hessen", taxRate: 6.0 },
  MECKLENBURG_VORPOMMERN: { name: "Mecklenburg-Vorpommern", taxRate: 6.0 },
  NIEDERSACHSEN: { name: "Niedersachsen", taxRate: 5.0 },
  NORDRHEIN_WESTFALEN: { name: "Nordrhein-Westfalen", taxRate: 6.5 },
  RHEINLAND_PFALZ: { name: "Rheinland-Pfalz", taxRate: 5.0 },
  SAARLAND: { name: "Saarland", taxRate: 6.5 },
  SACHSEN: { name: "Sachsen", taxRate: 5.5 },
  SACHSEN_ANHALT: { name: "Sachsen-Anhalt", taxRate: 5.0 },
  SCHLESWIG_HOLSTEIN: { name: "Schleswig-Holstein", taxRate: 6.5 },
  THUERINGEN: { name: "Thüringen", taxRate: 5.0 },
};

/**
 * Smart defaults for various fields
 */
export const WIZARD_DEFAULTS = {
  brokerPercent: 3.57,
  notaryPercent: 1.5,
  maintenanceReservePerSqm: 10, // €/m²/Jahr
  personalTaxRate: 42,
  buildingSharePercent: 80,
};
