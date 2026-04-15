/**
 * Reference rent data by region (Mietpreisspiegel)
 * Sample data for major German cities - average cold rent per sqm
 */

export const ReferenceRentData: Record<
  string,
  { city: string; avgRentPerSqm: number; minRent: number; maxRent: number; population?: number }
> = {
  MUENCHEN: { city: "München", avgRentPerSqm: 19.5, minRent: 14.0, maxRent: 28.0 },
  FRANKFURT: { city: "Frankfurt am Main", avgRentPerSqm: 16.5, minRent: 12.0, maxRent: 24.0 },
  STUTTGART: { city: "Stuttgart", avgRentPerSqm: 15.0, minRent: 11.0, maxRent: 22.0 },
  BERLIN: { city: "Berlin", avgRentPerSqm: 14.0, minRent: 9.0, maxRent: 20.0 },
  HAMBURG: { city: "Hamburg", avgRentPerSqm: 14.5, minRent: 10.0, maxRent: 21.0 },
  DUESSELDORF: { city: "Düsseldorf", avgRentPerSqm: 13.5, minRent: 10.0, maxRent: 19.0 },
  KOELN: { city: "Köln", avgRentPerSqm: 13.0, minRent: 9.5, maxRent: 18.0 },
  NUERNBERG: { city: "Nürnberg", avgRentPerSqm: 11.5, minRent: 8.5, maxRent: 16.0 },
  HANNOVER: { city: "Hannover", avgRentPerSqm: 10.5, minRent: 7.5, maxRent: 15.0 },
  LEIPZIG: { city: "Leipzig", avgRentPerSqm: 8.5, minRent: 6.0, maxRent: 12.0 },
  DRESDEN: { city: "Dresden", avgRentPerSqm: 9.0, minRent: 6.5, maxRent: 13.0 },
  DORTMUND: { city: "Dortmund", avgRentPerSqm: 9.0, minRent: 6.5, maxRent: 13.0 },
  ESSEN: { city: "Essen", avgRentPerSqm: 8.5, minRent: 6.0, maxRent: 12.0 },
  SONSTIGE: { city: "Sonstige / Ländlich", avgRentPerSqm: 7.5, minRent: 5.0, maxRent: 11.0 },
};

/**
 * Property type labels
 */
import type { PropertyType } from "@/types";

export const PropertyTypeLabels: Record<PropertyType, string> = {
  WOHNUNG: "Wohnung",
  EINFAMILIENHAUS: "Einfamilienhaus",
  MEHRFAMILIENHAUS: "Mehrfamilienhaus",
  GEWERBE: "Gewerbe",
  MISCHNUTZUNG: "Mischnutzung",
};

/**
 * Renovation type labels
 */
import type { RenovationInput } from "@/types";

export const RenovationTypeLabels: Record<
  RenovationInput["renovationType"],
  { label: string; typicalCost: string; typicalRentIncrease: string }
> = {
  BAEDER: {
    label: "Badezimmer",
    typicalCost: "8.000 - 25.000 €",
    typicalRentIncrease: "50 - 150 €/Monat",
  },
  KUECHE: {
    label: "Küche",
    typicalCost: "5.000 - 20.000 €",
    typicalRentIncrease: "30 - 100 €/Monat",
  },
  BOEDEN: {
    label: "Böden",
    typicalCost: "3.000 - 12.000 €",
    typicalRentIncrease: "20 - 60 €/Monat",
  },
  FENSTER: {
    label: "Fenster",
    typicalCost: "5.000 - 15.000 €",
    typicalRentIncrease: "30 - 80 €/Monat",
  },
  FASSADE: {
    label: "Fassade/Dämmung",
    typicalCost: "15.000 - 50.000 €",
    typicalRentIncrease: "50 - 150 €/Monat",
  },
  HEIZUNG: {
    label: "Heizung",
    typicalCost: "8.000 - 25.000 €",
    typicalRentIncrease: "40 - 100 €/Monat",
  },
  DACH: {
    label: "Dach",
    typicalCost: "15.000 - 40.000 €",
    typicalRentIncrease: "30 - 80 €/Monat",
  },
  ELEKTRIK: {
    label: "Elektrik",
    typicalCost: "3.000 - 10.000 €",
    typicalRentIncrease: "20 - 50 €/Monat",
  },
  SONSTIGE: { label: "Sonstige", typicalCost: "variabel", typicalRentIncrease: "variabel" },
};
