"use client";

import React, { useEffect } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

export interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Wizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  canGoNext = true,
  canGoPrevious = true,
  children,
  className,
}: WizardProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && canGoNext && !isLastStep) {
        e.preventDefault();
        onStepChange(currentStep + 1);
      } else if (e.key === "ArrowLeft" && canGoPrevious && !isFirstStep) {
        e.preventDefault();
        onStepChange(currentStep - 1);
      } else if (e.key === "Enter" && isLastStep && canGoNext && onComplete) {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, canGoNext, canGoPrevious, isFirstStep, isLastStep, onStepChange, onComplete]);

  const handlePrevious = () => {
    if (!isFirstStep && canGoPrevious) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep && canGoNext) {
      onStepChange(currentStep + 1);
    } else if (isLastStep && canGoNext && onComplete) {
      onComplete();
    }
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Step Indicator */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isAccessible = index <= currentStep;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isAccessible && onStepChange(index)}
                  disabled={!isAccessible}
                  className={cn(
                    "group flex flex-col items-center gap-2 transition-all duration-200",
                    isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  )}
                  aria-label={`${step.title}${isActive ? " (aktuell)" : ""}${isCompleted ? " (abgeschlossen)" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200",
                      isCompleted &&
                        "border-green-500 bg-green-500 text-white dark:border-green-600 dark:bg-green-600",
                      isActive &&
                        !isCompleted &&
                        "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:border-indigo-500 dark:bg-indigo-500",
                      !isActive &&
                        !isCompleted &&
                        "border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400",
                      isAccessible && "group-hover:scale-110"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-xs font-medium transition-colors duration-200 sm:text-sm",
                        isActive && "text-indigo-600 dark:text-indigo-400",
                        isCompleted && "text-green-600 dark:text-green-400",
                        !isActive && !isCompleted && "text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div className="mt-1 hidden text-xs text-slate-400 sm:block">
                        {step.description}
                      </div>
                    )}
                  </div>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1 transition-colors duration-200",
                      index < currentStep
                        ? "bg-green-500 dark:bg-green-600"
                        : "bg-slate-200 dark:bg-slate-700"
                    )}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      <div
        className="animate-fade-in"
        role="region"
        aria-label={`Schritt ${currentStep + 1}: ${steps[currentStep]?.title}`}
      >
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || !canGoPrevious}
          className="gap-2"
          aria-label="Zurück zum vorherigen Schritt"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Zurück
        </Button>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Schritt {currentStep + 1} von {steps.length}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          className="gap-2"
          aria-label={isLastStep ? "Wizard abschließen" : "Weiter zum nächsten Schritt"}
        >
          {isLastStep ? "Abschließen" : "Weiter"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
