import React, { forwardRef, useMemo } from "react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Popover } from "./Popover";

export type SelectOption = {
  label: string | React.ReactNode;
  value: string | number;
  disabled?: boolean;
};

export type SelectProps = {
  label?: string | React.ReactNode;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  value?: string | number;
  onChange?: (event: { target: { value: string | number } }) => void;
  disabled?: boolean;
  className?: string;
};

const baseStyles =
  "w-full rounded-xl border border-primary-lighter px-4 py-3 bg-white text-gray-900 text-left flex items-center justify-between gap-2";

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      options = [],
      placeholder = "Select…",
      value,
      onChange,
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const selected = useMemo(
      () => options.find((opt) => opt.value === value),
      [options, value]
    );

    const handleSelect = (val: string | number) => {
      if (disabled) return;
      onChange?.({ target: { value: val } });
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <Popover
          className="w-full"
          align="left"
          matchTriggerWidth
          trigger={({ toggle }) => (
            <button
              ref={ref as any}
              type="button"
              onClick={() => !disabled && toggle()}
              className={clsx(baseStyles, className, {
                "border-red-500": !!error,
                "bg-gray-100 text-gray-500 cursor-not-allowed": disabled,
              })}
            >
              <span
                className={clsx("flex-1 text-sm", !selected && "text-gray-500")}
              >
                {selected ? selected.label : placeholder}
              </span>
              <ChevronUpDownIcon className="w-5 h-5 text-gray-500" />
            </button>
          )}
        >
          {(close) => (
            <div className="py-1">
              {options.map((opt) => {
                const isActive = opt.value === value;
                const isDisabled = disabled || opt.disabled;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      if (isDisabled) return;
                      handleSelect(opt.value);
                      close();
                    }}
                    className={clsx(
                      "flex w-full items-center gap-2 px-3 py-3 text-sm text-left",
                      isActive
                        ? "bg-primary-pale text-primary font-medium"
                        : "hover:bg-gray-100",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="flex-1">{opt.label}</span>
                    {isActive && <CheckIcon className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </Popover>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
