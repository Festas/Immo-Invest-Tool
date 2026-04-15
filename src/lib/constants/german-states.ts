/**
 * German federal states (Bundesländer) with property transfer tax rates
 *
 * This file re-exports BundeslandData as GERMAN_STATES for backward compatibility.
 * The canonical source of truth is src/data/bundesland.ts.
 */

import { BundeslandData } from "@/data/bundesland";

export interface GermanState {
  name: string;
  taxRate: number; // Grunderwerbsteuer in %
}

export const GERMAN_STATES: Record<string, GermanState> = BundeslandData;

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
