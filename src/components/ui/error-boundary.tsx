"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback UI to display when an error occurs */
  fallback?: React.ReactNode;
  /** Tab/feature name for the error message */
  featureName?: string;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree.
 * Prevents a crash in one feature tab from taking down the entire application.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(
      `[ErrorBoundary] Error in ${this.props.featureName || "component"}:`,
      error,
      errorInfo
    );
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
            {this.props.featureName
              ? `Fehler in "${this.props.featureName}"`
              : "Ein Fehler ist aufgetreten"}
          </h3>
          <p className="mb-4 max-w-md text-sm text-red-600 dark:text-red-300">
            In diesem Bereich ist ein unerwarteter Fehler aufgetreten. Die restliche Anwendung
            funktioniert weiterhin normal.
          </p>
          {this.state.error && (
            <p className="mb-4 max-w-md text-xs text-red-500 dark:text-red-400">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <RotateCcw className="h-4 w-4" />
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component for use with dynamic imports and feature tabs.
 * Provides a consistent error boundary around lazy-loaded content.
 */
export function FeatureErrorBoundary({
  children,
  featureName,
}: {
  children: React.ReactNode;
  featureName: string;
}) {
  return <ErrorBoundary featureName={featureName}>{children}</ErrorBoundary>;
}
