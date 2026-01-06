import React, { forwardRef, TextareaHTMLAttributes } from "react";

export type TextareaProps = {
  label?: string | React.ReactNode;
  error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles =
  "w-full rounded-xl border border-primary-lighter px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 resize-none";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const errorStyles = error ? " border-red-500" : "";
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
        <textarea
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

Textarea.displayName = "Textarea";
