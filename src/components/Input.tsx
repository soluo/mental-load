import { forwardRef } from "react";
import { cn } from "../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
