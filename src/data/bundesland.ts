/**
 * German federal states with property transfer tax rates (2024)
 */

import type { Bundesland } from "@/types";

export const BundeslandData: Record<Bundesland, { name: string; taxRate: number }> = {
  BADEN_WUERTTEMBERG: { name: "Baden-Württemberg", taxRate: 5.0 },
  BAYERN: { name: "Bayern", taxRate: 3.5 },
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
