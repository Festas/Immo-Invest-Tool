"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

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

    if (!open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        {/* Sheet */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
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
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          )}
          {children}
        </div>
      </>
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
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold text-slate-900 dark:text-white", className)}
      {...props}
    />
  )
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
      className={cn(
        "rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900",
        "dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      <X className="h-5 w-5" />
      <span className="sr-only">Close</span>
    </button>
  );
});
SheetClose.displayName = "SheetClose";

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose };
