import React, { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-light",
  secondary: "border border-primary text-primary hover:bg-primary-pale",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  destructive: "bg-red-500 text-white hover:bg-red-600",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2 text-base",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClass = variantStyles[variant];
    const sizeClass = sizeStyles[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`.trim()}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
