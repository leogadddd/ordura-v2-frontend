import React, { forwardRef, InputHTMLAttributes } from "react";

export type InputProps = {
  label?: string | React.ReactNode;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const baseStyles =
  "w-full rounded-xl border border-primary-lighter px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const errorStyles = error ? " border-red-500 focus:ring-red-500" : "";
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
        <input
          ref={ref}
          className={`${baseStyles}${errorStyles} ${className}`.trim()}
          {...props}
        />
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
