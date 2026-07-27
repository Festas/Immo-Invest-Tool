/**
 * Lazy-loaded component imports for code splitting.
 * Centralizes all dynamic imports to keep page.tsx clean.
 */

import dynamic from "next/dynamic";
import { ChartSkeleton, DashboardSkeleton, CalculatorSkeleton } from "@/components/skeletons";

// Chart components
export const AmortizationChart = dynamic(
  () => import("@/components/Charts").then((mod) => ({ default: mod.AmortizationChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const CumulativeCashflowChart = dynamic(
  () => import("@/components/Charts").then((mod) => ({ default: mod.CumulativeCashflowChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const CashflowDevelopmentChart = dynamic(
  () => import("@/components/Charts").then((mod) => ({ default: mod.CashflowDevelopmentChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const InterestPrincipalChart = dynamic(
  () => import("@/components/Charts").then((mod) => ({ default: mod.InterestPrincipalChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const EquityBuildupChart = dynamic(
  () => import("@/components/Charts").then((mod) => ({ default: mod.EquityBuildupChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

// Feature components
export const ScenarioComparison = dynamic(
  () =>
    import("@/components/ScenarioComparison").then((mod) => ({ default: mod.ScenarioComparison })),
  { loading: () => <DashboardSkeleton />, ssr: false }
);

export const PortfolioDashboard = dynamic(
  () =>
    import("@/components/PortfolioDashboard").then((mod) => ({ default: mod.PortfolioDashboard })),
  { loading: () => <DashboardSkeleton />, ssr: false }
);

export const BreakEvenCalculator = dynamic(
  () =>
    import("@/components/BreakEvenCalculator").then((mod) => ({
      default: mod.BreakEvenCalculator,
    })),
  { loading: () => <CalculatorSkeleton />, ssr: false }
);

export const ExitStrategyCalculator = dynamic(
  () =>
    import("@/components/ExitStrategyCalculator").then((mod) => ({
      default: mod.ExitStrategyCalculator,
    })),
  { loading: () => <CalculatorSkeleton />, ssr: false }
);
