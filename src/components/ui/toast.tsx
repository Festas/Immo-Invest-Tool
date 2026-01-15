"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { shouldReduceMotion } from "@/lib/animations";

// Toast types
export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

/**
 * Hook to use the toast notification system
 */
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/**
 * Generate a unique ID for toasts
 */
function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Toast Provider component that wraps the app
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timeoutsRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clean up timeouts on unmount
  React.useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  const addToast = React.useCallback(
    (message: string, variant: ToastVariant = "info", duration: number = 4000) => {
      const id = generateToastId();
      const toast: Toast = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after duration
      if (duration > 0) {
        const timeout = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
          timeoutsRef.current.delete(id);
        }, duration);
        timeoutsRef.current.set(id, timeout);
      }
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Toast container that renders all active toasts
 */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile view with proper hydration handling
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col-reverse gap-2",
        // Mobile: bottom center
        "bottom-20 left-1/2 -translate-x-1/2",
        // Desktop: bottom right
        "md:right-6 md:bottom-6 md:left-auto md:translate-x-0"
      )}
      role="region"
      aria-label="Benachrichtigungen"
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          index={index}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

/**
 * Individual toast item
 */
function ToastItem({
  toast,
  onDismiss,
  index,
  isMobile,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
  index: number;
  isMobile: boolean;
}) {
  const [progress, setProgress] = React.useState(100);
  const startTimeRef = React.useRef<number>(0);

  // Initialize start time once on mount
  React.useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const icons: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  };

  const variantStyles: Record<ToastVariant, string> = {
    success:
      "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/90 dark:text-green-100",
    error:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/90 dark:text-red-100",
    info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/90 dark:text-blue-100",
    warning:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-100",
  };

  const progressColors: Record<ToastVariant, string> = {
    success: "bg-green-500 dark:bg-green-400",
    error: "bg-red-500 dark:bg-red-400",
    info: "bg-blue-500 dark:bg-blue-400",
    warning: "bg-amber-500 dark:bg-amber-400",
  };

  // Animation classes for different variants
  const animationClasses: Record<ToastVariant, string> = {
    success: shouldReduceMotion() ? "" : "animate-fade-in",
    error: shouldReduceMotion() ? "" : "animate-fade-in animate-shake",
    info: shouldReduceMotion() ? "" : "animate-fade-in",
    warning: shouldReduceMotion() ? "" : "animate-fade-in animate-pulse-once",
  };

  // Slide-in direction based on device
  const slideAnimation = shouldReduceMotion()
    ? ""
    : isMobile
      ? "animate-slide-in-down"
      : "animate-slide-in-left";

  // Update progress bar
  React.useEffect(() => {
    if (!toast.duration || toast.duration <= 0 || shouldReduceMotion()) return;

    const duration = toast.duration;
    const startTime = Date.now(); // Capture start time in effect
    startTimeRef.current = startTime;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration]);

  return (
    <div
      className={cn(
        "flex max-w-[400px] min-w-[280px] flex-col overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm",
        variantStyles[toast.variant],
        slideAnimation,
        animationClasses[toast.variant]
      )}
      role="alert"
      style={{
        // Stacking effect: slightly offset each toast
        transform: shouldReduceMotion() ? "none" : `translateY(${-index * 4}px)`,
        zIndex: 100 - index,
      }}
    >
      {/* Content */}
      <div className="flex items-center gap-3 px-4 py-3">
        {icons[toast.variant]}
        <span className="flex-1 text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          className="rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Action button if provided */}
      {toast.action && (
        <div className="border-t border-current/10 px-4 py-2">
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="text-sm font-semibold opacity-80 hover:opacity-100"
          >
            {toast.action.label}
          </button>
        </div>
      )}

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && !shouldReduceMotion() && (
        <div className="h-1 w-full bg-black/10 dark:bg-white/10">
          <div
            className={cn(
              "h-full transition-all duration-100 ease-linear",
              progressColors[toast.variant]
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
