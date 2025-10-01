import { forwardRef } from "react";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-slate-800 text-white hover:bg-slate-700 focus:ring-slate-500":
              variant === "primary",
            "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400":
              variant === "secondary",
            "bg-transparent text-slate-600 hover:bg-slate-50 focus:ring-slate-400":
              variant === "ghost",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2.5 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
