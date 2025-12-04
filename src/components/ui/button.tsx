import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 focus-visible:ring-indigo-500 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20 dark:hover:from-indigo-500 dark:hover:to-indigo-600",
        destructive:
          "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-red-500",
        outline:
          "border-2 border-indigo-200 bg-white/80 backdrop-blur-sm text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-0.5 dark:border-indigo-800 dark:bg-slate-900/80 dark:text-indigo-300 dark:hover:bg-indigo-950/50 dark:hover:border-indigo-700 focus-visible:ring-indigo-500",
        secondary:
          "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:-translate-y-0.5 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 focus-visible:ring-indigo-500",
        ghost:
          "hover:bg-indigo-100 hover:text-indigo-900 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300 focus-visible:ring-indigo-500",
        link: "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 focus-visible:ring-indigo-500",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
