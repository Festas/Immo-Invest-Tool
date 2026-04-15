/**
 * Default due diligence checklist items
 */

import type { ChecklistItem } from "@/types";

export const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItem, "isCompleted" | "notes">[] = [
  // Documents
  {
    id: "doc-1",
    category: "DOKUMENTE",
    title: "Grundbuchauszug",
    description: "Aktueller Grundbuchauszug (max. 3 Monate alt)",
    isRequired: true,
  },
  {
    id: "doc-2",
    category: "DOKUMENTE",
    title: "Energieausweis",
    description: "Gültiger Energieausweis nach EnEV",
    isRequired: true,
  },
  {
    id: "doc-3",
    category: "DOKUMENTE",
    title: "Teilungserklärung",
    description: "Bei Eigentumswohnungen erforderlich",
    isRequired: false,
  },
  {
    id: "doc-4",
    category: "DOKUMENTE",
    title: "Protokolle Eigentümerversammlung",
    description: "Letzte 3 Jahre",
    isRequired: false,
  },
  {
    id: "doc-5",
    category: "DOKUMENTE",
    title: "Nebenkostenabrechnung",
    description: "Letzte 2-3 Jahre",
    isRequired: true,
  },
  {
    id: "doc-6",
    category: "DOKUMENTE",
    title: "Mietvertrag",
    description: "Aktuelle Mietverträge aller Einheiten",
    isRequired: true,
  },
  {
    id: "doc-7",
    category: "DOKUMENTE",
    title: "Wirtschaftsplan",
    description: "Aktueller WEG-Wirtschaftsplan",
    isRequired: false,
  },
  {
    id: "doc-8",
    category: "DOKUMENTE",
    title: "Baugenehmigung",
    description: "Original-Baugenehmigung und Änderungen",
    isRequired: false,
  },

  // Inspection
  {
    id: "bes-1",
    category: "BESICHTIGUNG",
    title: "Außenbesichtigung",
    description: "Fassade, Dach, Fenster, Außenanlagen",
    isRequired: true,
  },
  {
    id: "bes-2",
    category: "BESICHTIGUNG",
    title: "Innenbesichtigung",
    description: "Alle Räume, Keller, Dachboden",
    isRequired: true,
  },
  {
    id: "bes-3",
    category: "BESICHTIGUNG",
    title: "Haustechnik prüfen",
    description: "Heizung, Elektrik, Wasserleitungen",
    isRequired: true,
  },
  {
    id: "bes-4",
    category: "BESICHTIGUNG",
    title: "Feuchtigkeitsschäden",
    description: "Keller, Bäder, Fensteranschlüsse prüfen",
    isRequired: true,
  },
  {
    id: "bes-5",
    category: "BESICHTIGUNG",
    title: "Umgebung erkunden",
    description: "Infrastruktur, Nachbarschaft, Lärm",
    isRequired: true,
  },

  // Finances
  {
    id: "fin-1",
    category: "FINANZEN",
    title: "Kaufpreisverhandlung",
    description: "Marktvergleich, Verhandlungsspielraum",
    isRequired: true,
  },
  {
    id: "fin-2",
    category: "FINANZEN",
    title: "Finanzierungszusage",
    description: "Schriftliche Bankzusage einholen",
    isRequired: true,
  },
  {
    id: "fin-3",
    category: "FINANZEN",
    title: "Renditeberechnung",
    description: "Vollständige Kalkulation durchführen",
    isRequired: true,
  },
  {
    id: "fin-4",
    category: "FINANZEN",
    title: "Rücklagenprüfung",
    description: "WEG-Rücklagen und Instandhaltung",
    isRequired: false,
  },
  {
    id: "fin-5",
    category: "FINANZEN",
    title: "Mietpotenzial",
    description: "Mietpreisspiegel und Erhöhungspotenzial",
    isRequired: true,
  },

  // Legal
  {
    id: "rec-1",
    category: "RECHTLICHES",
    title: "Kaufvertragsentwurf",
    description: "Vom Notar prüfen lassen",
    isRequired: true,
  },
  {
    id: "rec-2",
    category: "RECHTLICHES",
    title: "Grunddienstbarkeiten",
    description: "Wegerechte, Leitungsrechte prüfen",
    isRequired: true,
  },
  {
    id: "rec-3",
    category: "RECHTLICHES",
    title: "Baulastenverzeichnis",
    description: "Bei der Gemeinde abfragen",
    isRequired: true,
  },
  {
    id: "rec-4",
    category: "RECHTLICHES",
    title: "Denkmalschutz",
    description: "Status und Auflagen klären",
    isRequired: false,
  },
  {
    id: "rec-5",
    category: "RECHTLICHES",
    title: "Mietverhältnisse",
    description: "Kündigungsfristen, Mieterhöhungen prüfen",
    isRequired: true,
  },

  // Technical
  {
    id: "tec-1",
    category: "TECHNISCH",
    title: "Baujahr und Bausubstanz",
    description: "Alter und Zustand der Substanz",
    isRequired: true,
  },
  {
    id: "tec-2",
    category: "TECHNISCH",
    title: "Heizungsanlage",
    description: "Alter, Effizienz, Wartungszustand",
    isRequired: true,
  },
  {
    id: "tec-3",
    category: "TECHNISCH",
    title: "Elektroinstallation",
    description: "Alter, Zustand, Modernisierungsbedarf",
    isRequired: true,
  },
  {
    id: "tec-4",
    category: "TECHNISCH",
    title: "Dachzustand",
    description: "Letzte Sanierung, Zustand",
    isRequired: true,
  },
  {
    id: "tec-5",
    category: "TECHNISCH",
    title: "Sanitärinstallationen",
    description: "Alter und Zustand der Leitungen",
    isRequired: true,
  },
  {
    id: "tec-6",
    category: "TECHNISCH",
    title: "Gutachter beauftragen",
    description: "Bei Bedarf Sachverständigen einschalten",
    isRequired: false,
  },
];
