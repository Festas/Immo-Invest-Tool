"use client";

import * as React from "react";
import { Button } from "./button";
import { CoachMark } from "./coach-mark";
import { PresetSelector } from "./preset-selector";
import { Calculator, Sparkles, X, ArrowRight } from "lucide-react";
import { useBodyScrollLock } from "@/lib/hooks";

// Onboarding storage key
const ONBOARDING_STORAGE_KEY = "immocalc-onboarding";

// Transition delays for smooth step changes on mobile
const TRANSITION_DELAY_MS = 150;
const SKIP_DELAY_MS = 100;

interface OnboardingState {
  hasSeenOnboarding: boolean;
  completedSteps: string[];
  dismissedTips: string[];
}

/**
 * Get onboarding state from localStorage
 */
function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") {
    return { hasSeenOnboarding: false, completedSteps: [], dismissedTips: [] };
  }

  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }

  return { hasSeenOnboarding: false, completedSteps: [], dismissedTips: [] };
}

/**
 * Save onboarding state to localStorage
 */
function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore errors
  }
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding() {
  const [state, setState] = React.useState<OnboardingState>(() => getOnboardingState());

  const markAsCompleted = React.useCallback(() => {
    const newState = { ...state, hasSeenOnboarding: true };
    setState(newState);
    saveOnboardingState(newState);
  }, [state]);

  const resetOnboarding = React.useCallback(() => {
    const newState = { hasSeenOnboarding: false, completedSteps: [], dismissedTips: [] };
    setState(newState);
    saveOnboardingState(newState);
  }, []);

  const dismissTip = React.useCallback(
    (tipId: string) => {
      const newState = {
        ...state,
        dismissedTips: [...state.dismissedTips, tipId],
      };
      setState(newState);
      saveOnboardingState(newState);
    },
    [state]
  );

  const isTipDismissed = React.useCallback(
    (tipId: string) => state.dismissedTips.includes(tipId),
    [state.dismissedTips]
  );

  return {
    hasSeenOnboarding: state.hasSeenOnboarding,
    markAsCompleted,
    resetOnboarding,
    dismissTip,
    isTipDismissed,
  };
}

/**
 * Welcome Modal (Step 1)
 */
function WelcomeModal({ onContinue, onSkip }: { onContinue: () => void; onSkip: () => void }) {
  // Lock body scroll when modal is mounted
  useBodyScrollLock();

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSkip();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Ensure body scroll is restored
      document.body.style.overflow = "";
    };
  }, [onSkip]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal */}
      <div className="animate-scale-in relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Schließen"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="mx-auto mb-6 w-fit rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 shadow-lg shadow-indigo-500/30">
          <Calculator className="h-10 w-10 text-white" />
        </div>

        {/* Title */}
        <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
          Willkommen bei ImmoCalc Pro! 🏠
        </h2>

        {/* Description */}
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          Ihr All-in-One Tool für die professionelle Analyse von Immobilien-Investments. Berechnen
          Sie Renditen, vergleichen Sie Szenarien und treffen Sie fundierte Entscheidungen.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={onContinue} className="w-full">
            Los geht{"'"}s
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button
            onClick={onSkip}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
          >
            Tour überspringen
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Quick Start Offer (Step 3)
 */
function QuickStartOffer({
  onLoadExample,
  onOwnData,
}: {
  onLoadExample: () => void;
  onOwnData: () => void;
}) {
  // Lock body scroll when modal is mounted
  useBodyScrollLock();

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOwnData();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Ensure body scroll is restored
      document.body.style.overflow = "";
    };
  }, [onOwnData]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal */}
      <div className="animate-scale-in relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Icon */}
        <div className="mx-auto mb-6 w-fit rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 shadow-lg shadow-orange-500/30">
          <Sparkles className="h-10 w-10 text-white" />
        </div>

        {/* Title */}
        <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
          Wie möchten Sie starten?
        </h2>

        {/* Description */}
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          Laden Sie ein vorgefertigtes Beispiel mit realistischen Werten oder geben Sie direkt Ihre
          eigenen Daten ein.
        </p>

        {/* Options */}
        <div className="space-y-3">
          <Button onClick={onLoadExample} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Mit Beispiel starten
          </Button>
          <Button variant="outline" onClick={onOwnData} className="w-full">
            Eigene Daten eingeben
          </Button>
        </div>
      </div>
    </div>
  );
}

// Coach mark step configuration
const COACH_MARK_STEPS = [
  {
    id: "form",
    targetSelector: "[data-onboarding='form']",
    title: "📝 Eingaben",
    description:
      "Geben Sie hier Ihre Immobiliendaten ein. Kaufpreis, Finanzierung, Mieteinnahmen und steuerliche Parameter – alle wichtigen Informationen an einem Ort.",
    position: "right" as const,
  },
  {
    id: "results",
    targetSelector: "[data-onboarding='results']",
    title: "📊 Ergebnisse",
    description:
      "Hier sehen Sie Ihre Berechnungsergebnisse in Echtzeit. Cashflow, Renditen und wichtige Kennzahlen werden automatisch berechnet.",
    position: "left" as const,
  },
  {
    id: "tabs",
    targetSelector: "[data-onboarding='tabs']",
    title: "🗂️ Weitere Tools",
    description:
      "Entdecken Sie zusätzliche Analysen: Charts, Szenario-Vergleiche, Break-Even-Analyse und vieles mehr.",
    position: "bottom" as const,
  },
];

/**
 * Main Onboarding component
 */
export function Onboarding() {
  const { hasSeenOnboarding, markAsCompleted } = useOnboarding();
  const [currentStep, setCurrentStep] = React.useState<
    "welcome" | "coachmarks" | "quickstart" | "presets" | null
  >(null);
  const [coachMarkStep, setCoachMarkStep] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Cleanup function to ensure all overlays and locks are removed
  const cleanupOverlays = React.useCallback(() => {
    // Remove scroll locks
    document.body.style.overflow = "";

    // Note: We don't forcefully remove overlays as React will handle unmounting them
    // This is just to ensure scroll state is restored between transitions
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanupOverlays();
    };
  }, [cleanupOverlays]);

  // Check if should show onboarding on mount
  React.useEffect(() => {
    if (!hasSeenOnboarding) {
      // Small delay to allow page to render
      const timer = setTimeout(() => {
        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Starting onboarding tour");
        }
        setCurrentStep("welcome");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  const handleWelcomeContinue = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    cleanupOverlays(); // Clean up before transition
    if (process.env.NODE_ENV === "development") {
      console.log("[Onboarding] Transitioning from welcome to coachmarks");
    }

    // Add delay to ensure clean transition
    setTimeout(() => {
      setCurrentStep("coachmarks");
      setCoachMarkStep(1);
      setIsTransitioning(false);
    }, TRANSITION_DELAY_MS);
  };

  const handleSkip = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    cleanupOverlays(); // Clean up before skipping
    if (process.env.NODE_ENV === "development") {
      console.log("[Onboarding] Skipping tour");
    }

    setTimeout(() => {
      setCurrentStep(null);
      markAsCompleted();
      setIsTransitioning(false);
    }, SKIP_DELAY_MS);
  };

  const handleCoachMarkNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    cleanupOverlays(); // Clean up before moving to next step

    if (coachMarkStep < COACH_MARK_STEPS.length) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Onboarding] Moving to coach mark step ${coachMarkStep + 1}`);
      }
      // Add delay between coach mark steps
      setTimeout(() => {
        setCoachMarkStep(coachMarkStep + 1);
        setIsTransitioning(false);
      }, TRANSITION_DELAY_MS);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("[Onboarding] Transitioning from coachmarks to quickstart");
      }
      // Transition to quick start modal
      setTimeout(() => {
        setCurrentStep("quickstart");
        setIsTransitioning(false);
      }, TRANSITION_DELAY_MS);
    }
  };

  const handleLoadExample = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    cleanupOverlays(); // Clean up before transition
    if (process.env.NODE_ENV === "development") {
      console.log("[Onboarding] User chose to load example");
    }

    setTimeout(() => {
      setCurrentStep("presets");
      setIsTransitioning(false);
    }, TRANSITION_DELAY_MS);
  };

  const handleOwnData = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    cleanupOverlays(); // Clean up before closing
    if (process.env.NODE_ENV === "development") {
      console.log("[Onboarding] User chose to enter own data");
    }

    setTimeout(() => {
      setCurrentStep(null);
      markAsCompleted();
      setIsTransitioning(false);
    }, SKIP_DELAY_MS);
  };

  const handlePresetsClose = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    cleanupOverlays(); // Clean up before closing
    if (process.env.NODE_ENV === "development") {
      console.log("[Onboarding] Closing presets, completing tour");
    }

    setTimeout(() => {
      setCurrentStep(null);
      markAsCompleted();
      setIsTransitioning(false);
    }, SKIP_DELAY_MS);
  };

  // Render nothing if no onboarding step is active
  if (currentStep === null) return null;

  // Don't render any modal during transitions to prevent overlapping
  if (isTransitioning) return null;

  return (
    <>
      {currentStep === "welcome" && (
        <WelcomeModal onContinue={handleWelcomeContinue} onSkip={handleSkip} />
      )}

      {currentStep === "coachmarks" && coachMarkStep > 0 && (
        <CoachMark
          targetSelector={COACH_MARK_STEPS[coachMarkStep - 1].targetSelector}
          title={COACH_MARK_STEPS[coachMarkStep - 1].title}
          description={COACH_MARK_STEPS[coachMarkStep - 1].description}
          position={COACH_MARK_STEPS[coachMarkStep - 1].position}
          step={coachMarkStep}
          totalSteps={COACH_MARK_STEPS.length}
          onNext={handleCoachMarkNext}
          onSkip={handleSkip}
          isVisible={true}
          isLastStep={coachMarkStep === COACH_MARK_STEPS.length}
        />
      )}

      {currentStep === "quickstart" && (
        <QuickStartOffer onLoadExample={handleLoadExample} onOwnData={handleOwnData} />
      )}

      {currentStep === "presets" && <PresetSelector isOpen={true} onClose={handlePresetsClose} />}
    </>
  );
}

/**
 * Button to replay onboarding from settings
 */
export function ReplayOnboardingButton() {
  const { resetOnboarding } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const handleReplay = () => {
    resetOnboarding();
    setShowOnboarding(true);
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleReplay}>
        <Sparkles className="mr-1.5 h-4 w-4" />
        Tour wiederholen
      </Button>
      {showOnboarding && <Onboarding />}
    </>
  );
}
