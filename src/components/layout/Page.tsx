import React from "react";
import clsx from "clsx";

export function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("h-full flex flex-col p-4 md:p-6", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={clsx(
        "flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4 shrink-0",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          {title}
        </h1>
        {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
      </div>

      {actions ? (
        <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-200 bg-white/90 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
