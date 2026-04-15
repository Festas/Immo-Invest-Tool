/**
 * Navigation structure and constants
 * Defines the hierarchical navigation categories and items
 *
 * Grouped into 4 primary views:
 * - Analyze: Core calculator + results flow
 * - Visualize: All charts and projections
 * - Compare: Scenario comparison + portfolio dashboard
 * - Tools: Rent index, renovation, location analysis, etc.
 */

import {
  Calculator,
  BarChart3,
  GitCompare,
  LayoutDashboard,
  MapPin,
  Target,
  Wrench,
  LogOut,
  ClipboardCheck,
  LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  value: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export interface NavigationCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  items: NavigationItem[];
}

/**
 * Navigation categories with their items
 * Grouped into 4 primary views to reduce tab overload
 */
export const NAVIGATION_CATEGORIES: NavigationCategory[] = [
  {
    id: "analyse",
    label: "Analysieren",
    emoji: "📊",
    description: "Rechner & Ergebnisse",
    items: [
      {
        value: "calculator",
        label: "Rechner",
        icon: Calculator,
        description: "Immobilienkalkulation & Ergebnisse",
      },
      {
        value: "break-even",
        label: "Break-Even",
        icon: Target,
        description: "Break-Even Analyse",
      },
      {
        value: "exit-strategy",
        label: "Exit-Strategie",
        icon: LogOut,
        description: "Verkaufsanalyse",
      },
    ],
  },
  {
    id: "visualisieren",
    label: "Visualisieren",
    emoji: "📈",
    description: "Charts & Prognosen",
    items: [
      {
        value: "charts",
        label: "Charts",
        icon: BarChart3,
        description: "Tilgung, Cashflow & Vermögensaufbau",
      },
    ],
  },
  {
    id: "vergleichen",
    label: "Vergleichen",
    emoji: "🔀",
    description: "Szenarien & Portfolio",
    items: [
      {
        value: "comparison",
        label: "Vergleich",
        icon: GitCompare,
        description: "Szenario-Vergleich",
      },
      {
        value: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Portfolio-Übersicht",
      },
    ],
  },
  {
    id: "werkzeuge",
    label: "Werkzeuge",
    emoji: "🛠️",
    description: "Zusätzliche Tools",
    items: [
      {
        value: "rent-index",
        label: "Mietspiegel",
        icon: MapPin,
        description: "Mietpreis-Vergleich",
      },
      {
        value: "renovation",
        label: "Renovierung",
        icon: Wrench,
        description: "Renovierungskalkulator",
      },
      {
        value: "location",
        label: "Standort",
        icon: MapPin,
        description: "Standortanalyse",
      },
      {
        value: "checklist",
        label: "Checkliste",
        icon: ClipboardCheck,
        description: "Due Diligence Checkliste",
      },
    ],
  },
];

/**
 * Flat list of all navigation items for quick lookup
 */
export const ALL_NAVIGATION_ITEMS: NavigationItem[] = NAVIGATION_CATEGORIES.flatMap(
  (category) => category.items
);

/**
 * Get category for a given tab value
 */
export function getCategoryForTab(tabValue: string): NavigationCategory | undefined {
  return NAVIGATION_CATEGORIES.find((category) =>
    category.items.some((item) => item.value === tabValue)
  );
}

/**
 * Get navigation item for a given tab value
 */
export function getNavigationItem(tabValue: string): NavigationItem | undefined {
  return ALL_NAVIGATION_ITEMS.find((item) => item.value === tabValue);
}

/**
 * Keyboard shortcuts for quick navigation
 */
export const NAVIGATION_SHORTCUTS: Record<string, string> = {
  calculator: "1",
  charts: "2",
  dashboard: "3",
  comparison: "4",
  "rent-index": "5",
  "break-even": "6",
  renovation: "7",
  "exit-strategy": "8",
  location: "9",
  checklist: "0",
};
