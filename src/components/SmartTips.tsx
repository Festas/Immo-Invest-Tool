"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useImmoCalcStore } from "@/store";
import { useOnboarding } from "@/components/ui/onboarding";
import { PropertyInput, PropertyOutput } from "@/types";
import { X, Lightbulb, CheckCircle, TrendingUp, Percent, Wallet } from "lucide-react";

interface SmartTip {
  id: string;
  type: "info" | "warning" | "success";
  icon: React.ReactNode;
  title: string;
  message: string;
  condition: (input: PropertyInput, output: PropertyOutput | null) => boolean;
}

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
  },
];

/**
 * Individual tip item component
 */
function TipItem({ tip, onDismiss }: { tip: SmartTip; onDismiss: (id: string) => void }) {
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
      className={cn(
        "animate-slide-up flex items-start gap-3 rounded-xl border p-4",
        styles.container
      )}
    >
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
  );
}

/**
 * Smart Tips container component
 */
export function SmartTips() {
  const { currentInput, currentOutput } = useImmoCalcStore();
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

  // Don't render if no tips to show
  if (activeTips.length === 0) return null;

  // Limit to 2 tips at a time to avoid overwhelming the user
  const visibleTips = activeTips.slice(0, 2);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Tipps & Hinweise
        </span>
      </div>
      <div className="space-y-2">
        {visibleTips.map((tip) => (
          <TipItem key={tip.id} tip={tip} onDismiss={dismissTip} />
        ))}
      </div>
    </div>
  );
}
