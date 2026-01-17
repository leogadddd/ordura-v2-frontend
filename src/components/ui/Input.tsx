import React, { forwardRef, InputHTMLAttributes } from "react";

export type InputProps = {
  label?: string | React.ReactNode;
  error?: string;
  suffix?: React.ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

const baseStyles =
  "w-full rounded-xl border border-primary-lighter px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, suffix, className = "", ...props }, ref) => {
    const errorStyles = error ? " border-red-500 focus:ring-red-500" : "";
    const hasSuffix = Boolean(suffix);
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`${baseStyles}${errorStyles} ${
              hasSuffix ? "pr-12" : ""
            } ${className}`.trim()}
            {...props}
          />
          {hasSuffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
