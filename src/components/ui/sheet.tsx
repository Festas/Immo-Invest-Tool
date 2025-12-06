"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  titleId?: string;
}

const SheetContext = React.createContext<SheetContextType | undefined>(undefined);

function useSheet() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet");
  }
  return context;
}

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Sheet = ({ children, open: controlledOpen, onOpenChange }: SheetProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const newValue = typeof value === "function" ? value(open) : value;
      if (onOpenChange) {
        onOpenChange(newValue);
      } else {
        setInternalOpen(newValue);
      }
    },
    [open, onOpenChange]
  );

  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
};

type SheetTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { setOpen } = useSheet();

    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          setOpen(true);
          onClick?.(e);
        }}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SheetTrigger.displayName = "SheetTrigger";

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, side = "bottom", ...props }, ref) => {
    const { open, setOpen } = useSheet();
    const sheetRef = React.useRef<HTMLDivElement>(null);
    const previousActiveElement = React.useRef<Element | null>(null);
    const titleId = React.useId();

    // Store the previously focused element when opening
    React.useEffect(() => {
      if (open) {
        previousActiveElement.current = document.activeElement;
      }
    }, [open]);

    // Close on escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, setOpen]);

    // Prevent body scroll when open
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    // Focus trap and focus management
    React.useEffect(() => {
      if (!open || !sheetRef.current) return;

      // Focus the first focusable element in the sheet
      const focusableElements = sheetRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], details'
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      // Focus first element
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Handle tab key for focus trap
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleTab);
      return () => {
        document.removeEventListener("keydown", handleTab);
        // Return focus to previously focused element when closing
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }, [open]);

    if (!open) return null;

    return (
      <SheetContext.Provider value={{ open, setOpen, titleId }}>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        {/* Sheet */}
        <div
          ref={(node) => {
            // Handle both internal ref and forwarded ref
            (sheetRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "fixed z-[101] bg-white shadow-xl transition-transform duration-300 ease-out dark:bg-slate-900",
            "border-t border-indigo-100/50 dark:border-indigo-900/30",
            side === "bottom" && "animate-sheet-up inset-x-0 bottom-0 rounded-t-2xl",
            side === "top" && "inset-x-0 top-0 rounded-b-2xl",
            side === "left" && "inset-y-0 left-0 rounded-r-2xl",
            side === "right" && "inset-y-0 right-0 rounded-l-2xl",
            className
          )}
          {...props}
        >
          {/* Drag handle for bottom sheet */}
          {side === "bottom" && (
            <div className="flex justify-center pt-3 pb-2" aria-hidden="true">
              <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          )}
          {children}
        </div>
      </SheetContext.Provider>
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between px-4 py-3", className)}
      {...props}
    />
  )
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId } = useSheet();
    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn("text-lg font-semibold text-slate-900 dark:text-white", className)}
        {...props}
      />
    );
  }
);
SheetTitle.displayName = "SheetTitle";

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { setOpen } = useSheet();

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(false)}
      aria-label="Schließen"
      className={cn(
        "rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900",
        "dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      <X className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only">Schließen</span>
    </button>
  );
});
SheetClose.displayName = "SheetClose";

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose };
