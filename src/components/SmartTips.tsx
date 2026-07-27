"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useImmoCalcStore } from "@/store";
import { useOnboarding } from "@/components/ui/onboarding";
import { PropertyInput, PropertyOutput } from "@/types";
import {
  X,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  Percent,
  Wallet,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface SmartTip {
  id: string;
  type: "info" | "warning" | "success";
  icon: React.ReactNode;
  title: string;
  message: string;
  condition: (input: PropertyInput, output: PropertyOutput | null) => boolean;
  relatedTabs?: string[]; // Related tabs/functions
}

interface TabTip {
  id: string;
  tab: string;
  type: "info";
  icon: React.ReactNode;
  title: string;
  message: string;
  relatedTabs?: string[];
}

/**
 * Tab-specific contextual tips
 */
const TAB_TIPS: TabTip[] = [
  {
    id: "calculator-tip",
    tab: "calculator",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Geben Sie die Kaufdaten Ihrer Immobilie ein und sehen Sie sofort die wichtigsten Kennzahlen wie Rendite, Cashflow und Tilgungsverlauf.",
    relatedTabs: ["charts", "dashboard"],
  },
  {
    id: "charts-tip",
    tab: "charts",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Visualisieren Sie den Tilgungsverlauf und die Cashflow-Entwicklung über die Jahre. Nutzen Sie die Diagramme für Präsentationen.",
    relatedTabs: ["comparison", "dashboard"],
  },
  {
    id: "comparison-tip",
    tab: "comparison",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Vergleichen Sie verschiedene Szenarien nebeneinander. Ändern Sie Parameter und sehen Sie sofort die Auswirkungen.",
    relatedTabs: ["calculator", "charts"],
  },
  {
    id: "dashboard-tip",
    tab: "dashboard",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Behalten Sie den Überblick über Ihr gesamtes Portfolio. Sehen Sie Gesamtrendite, Cashflow und weitere KPIs auf einen Blick.",
    relatedTabs: ["calculator", "charts"],
  },
  {
    id: "rent-index-tip",
    tab: "rent-index",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Analysieren Sie Mietpreisentwicklungen und vergleichen Sie mit dem regionalen Mietspiegel. Optimieren Sie Ihre Mietstrategie.",
    relatedTabs: ["location", "calculator"],
  },
  {
    id: "break-even-tip",
    tab: "break-even",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Ermitteln Sie den Break-Even Point Ihrer Investition. Sehen Sie, wann sich die Immobilie rentiert.",
    relatedTabs: ["calculator", "charts"],
  },
  {
    id: "renovation-tip",
    tab: "renovation",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Planen Sie Renovierungen und Sanierungen. Kalkulieren Sie Kosten und deren Einfluss auf Rendite und Wert.",
    relatedTabs: ["calculator", "exit-strategy"],
  },
  {
    id: "exit-strategy-tip",
    tab: "exit-strategy",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Planen Sie den Verkauf Ihrer Immobilie. Berechnen Sie Verkaufserlös, Steuern und Nettogewinn.",
    relatedTabs: ["calculator", "renovation"],
  },
  {
    id: "location-tip",
    tab: "location",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Analysieren Sie die Lage und das Umfeld der Immobilie. Bewerten Sie Infrastruktur, Entwicklungspotenzial und Risiken.",
    relatedTabs: ["rent-index", "calculator"],
  },
  {
    id: "checklist-tip",
    tab: "checklist",
    type: "info",
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Was kann ich hier tun?",
    message:
      "Nutzen Sie die Due Diligence Checkliste für einen strukturierten Kaufprozess. Vergessen Sie keine wichtigen Prüfpunkte.",
    relatedTabs: ["location", "calculator"],
  },
];

/**
 * All available smart tips
 */
const SMART_TIPS: SmartTip[] = [
  {
    id: "low-yield",
    type: "warning",
    icon: <Percent className="h-4 w-4" />,
    title: "Niedrige Rendite",
    message:
      "Die Bruttomietrendite liegt unter 3%. Prüfen Sie alternative Objekte oder Optimierungsmöglichkeiten.",
    condition: (input, output) => {
      if (!output) return false;
      return output.yields.grossRentalYield < 3 && input.purchasePrice > 0;
    },
    relatedTabs: ["comparison", "rent-index"],
  },
  {
    id: "low-equity",
    type: "warning",
    icon: <Wallet className="h-4 w-4" />,
    title: "Geringes Eigenkapital",
    message:
      "Banken bevorzugen mindestens 20% Eigenkapital. Aktuell liegt Ihr Eigenkapitalanteil darunter.",
    condition: (input, output) => {
      if (!output) return false;
      const totalInvestment = output.investmentVolume.totalInvestment;
      const equityPercent = totalInvestment > 0 ? (input.equity / totalInvestment) * 100 : 0;
      return equityPercent < 20 && input.equity > 0;
    },
  },
  {
    id: "positive-cashflow",
    type: "success",
    icon: <CheckCircle className="h-4 w-4" />,
    title: "Positiver Cashflow",
    message: "Gute Wahl! Diese Immobilie erzielt bereits ab Tag 1 einen positiven Cashflow.",
    condition: (input, output) => {
      if (!output) return false;
      return output.cashflow.monthlyCashflowAfterTax > 0 && input.purchasePrice > 0;
    },
    relatedTabs: ["charts", "dashboard"],
  },
  {
    id: "high-yield",
    type: "success",
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Überdurchschnittliche Rendite",
    message: "Die Bruttomietrendite liegt über 5% – das ist überdurchschnittlich gut!",
    condition: (input, output) => {
      if (!output) return false;
      return output.yields.grossRentalYield > 5 && input.purchasePrice > 0;
    },
    relatedTabs: ["charts", "dashboard"],
  },
  {
    id: "high-interest",
    type: "warning",
    icon: <Percent className="h-4 w-4" />,
    title: "Hoher Zinssatz",
    message:
      "Der aktuelle Marktzins liegt bei ca. 3,5-4%. Prüfen Sie, ob Sie bessere Konditionen erhalten können.",
    condition: (input) => {
      return input.interestRate > 5 && input.purchasePrice > 0;
    },
    relatedTabs: ["comparison", "break-even"],
  },
  {
    id: "low-repayment",
    type: "info",
    icon: <Lightbulb className="h-4 w-4" />,
    title: "Niedrige Tilgung",
    message:
      "Mit nur 1% Tilgung dauert die Entschuldung sehr lange. Erwägen Sie eine höhere Tilgungsrate.",
    condition: (input) => {
      return input.repaymentRate <= 1 && input.repaymentRate > 0;
    },
    relatedTabs: ["charts", "break-even"],
  },
  {
    id: "no-repayment",
    type: "warning",
    icon: <Percent className="h-4 w-4" />,
    title: "Keine Tilgung",
    message:
      "Ohne Tilgung (0%) wird das Darlehen innerhalb des Betrachtungszeitraums nie vollständig zurückgezahlt. Kennzahlen zur Entschuldung sind daher nicht aussagekräftig.",
    condition: (input, output) => {
      if (!output) return false;
      return (
        input.repaymentRate <= 0 &&
        input.interestRate > 0 &&
        output.financing.loanAmount > 0 &&
        input.purchasePrice > 0
      );
    },
    relatedTabs: ["charts", "break-even"],
  },
  {
    id: "no-equity",
    type: "warning",
    icon: <Wallet className="h-4 w-4" />,
    title: "Kein Eigenkapital",
    message:
      "Ohne Eigenkapital (100% Finanzierung) ist die Eigenkapitalrendite mathematisch nicht definiert (Division durch 0) und wird als 0 dargestellt. Zudem ist eine Vollfinanzierung mit erhöhtem Risiko verbunden.",
    condition: (input) => {
      return input.equity <= 0 && input.purchasePrice > 0;
    },
    relatedTabs: ["calculator"],
  },
  {
    id: "excess-equity",
    type: "info",
    icon: <Wallet className="h-4 w-4" />,
    title: "Eigenkapital übersteigt Investition",
    message:
      "Ihr Eigenkapital ist höher als das gesamte Investitionsvolumen. Der überschüssige Betrag wird nicht in dieses Objekt investiert und fließt nicht in die Renditeberechnung ein.",
    condition: (input, output) => {
      if (!output) return false;
      return input.equity > output.investmentVolume.totalInvestment && input.purchasePrice > 0;
    },
    relatedTabs: ["calculator"],
  },
];

/**
 * Individual tip item component
 */
function TipItem({
  tip,
  onDismiss,
  onNavigate,
}: {
  tip: SmartTip | TabTip;
  onDismiss: (id: string) => void;
  onNavigate?: (tab: string) => void;
}) {
  const typeStyles = {
    info: {
      container: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50",
      icon: "text-blue-500 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-100",
      message: "text-blue-700 dark:text-blue-300",
    },
    warning: {
      container: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50",
      icon: "text-amber-500 dark:text-amber-400",
      title: "text-amber-900 dark:text-amber-100",
      message: "text-amber-700 dark:text-amber-300",
    },
    success: {
      container: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50",
      icon: "text-green-500 dark:text-green-400",
      title: "text-green-900 dark:text-green-100",
      message: "text-green-700 dark:text-green-300",
    },
  };

  const styles = typeStyles[tip.type];

  return (
    <div
      className={cn("animate-slide-up flex flex-col gap-3 rounded-xl border p-4", styles.container)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 flex-shrink-0", styles.icon)}>{tip.icon}</div>
        <div className="min-w-0 flex-1">
          <h4 className={cn("text-sm font-semibold", styles.title)}>
            {tip.type === "warning" && "⚠️ "}
            {tip.type === "success" && "✅ "}
            {tip.type === "info" && "💡 "}
            {tip.title}
          </h4>
          <p className={cn("mt-1 text-sm", styles.message)}>{tip.message}</p>
        </div>
        <button
          onClick={() => onDismiss(tip.id)}
          className="flex-shrink-0 rounded-lg p-1 opacity-50 transition-opacity hover:opacity-100"
          aria-label="Tipp ausblenden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Related tabs/functions */}
      {tip.relatedTabs && tip.relatedTabs.length > 0 && onNavigate && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={cn("font-medium", styles.message)}>Siehe auch:</span>
          {tip.relatedTabs.map((tabValue) => (
            <button
              key={tabValue}
              onClick={() => onNavigate(tabValue)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-colors",
                "bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800",
                styles.message
              )}
            >
              <span>{getTabLabel(tabValue)}</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Helper to get readable tab labels
 */
function getTabLabel(tabValue: string): string {
  const labels: Record<string, string> = {
    calculator: "Rechner",
    charts: "Charts",
    comparison: "Vergleich",
    dashboard: "Dashboard",
    "rent-index": "Mietspiegel",
    "break-even": "Break-Even",
    renovation: "Renovierung",
    "exit-strategy": "Exit-Strategie",
    location: "Standort",
    checklist: "Checkliste",
  };
  return labels[tabValue] || tabValue;
}

/**
 * Smart Tips container component
 */
export function SmartTips() {
  const { currentInput, currentOutput, activeTab, setActiveTab } = useImmoCalcStore();
  const { isTipDismissed, dismissTip } = useOnboarding();

  // Find active tips based on current conditions
  const activeTips = React.useMemo(() => {
    return SMART_TIPS.filter((tip) => {
      // Check if tip is dismissed
      if (isTipDismissed(tip.id)) return false;
      // Check if condition is met
      return tip.condition(currentInput, currentOutput);
    });
  }, [currentInput, currentOutput, isTipDismissed]);

  // Get tab-specific tip for current tab
  const tabTip = React.useMemo(() => {
    const tip = TAB_TIPS.find((t) => t.tab === activeTab);
    // Only show if not dismissed
    return tip && !isTipDismissed(tip.id) ? tip : null;
  }, [activeTab, isTipDismissed]);

  // Don't render if no tips to show
  if (activeTips.length === 0 && !tabTip) return null;

  // Limit to 2 tips at a time to avoid overwhelming the user
  const visibleTips = activeTips.slice(0, 2);

  // Combine tab tip with condition-based tips
  const allTips = tabTip ? [tabTip, ...visibleTips] : visibleTips;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Tipps & Hinweise
        </span>
      </div>
      <div className="space-y-2">
        {allTips.map((tip) => (
          <TipItem key={tip.id} tip={tip} onDismiss={dismissTip} onNavigate={setActiveTab} />
        ))}
      </div>
    </div>
  );
}
