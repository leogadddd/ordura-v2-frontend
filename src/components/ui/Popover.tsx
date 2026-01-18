import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface PopoverProps {
  trigger: (controls: {
    open: boolean;
    toggle: () => void;
    close: () => void;
  }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  className?: string;
  panelClassName?: string;
  matchTriggerWidth?: boolean;
  /** Where to position the panel relative to the trigger. Supports side placements now. */
  placement?: "top" | "bottom" | "right" | "left";
  /** When true, open/close will be handled on hover/focus with short delays to avoid flicker. */
  hover?: boolean;
  /** Delay in ms before opening on hover (default 100ms) */
  hoverOpenDelay?: number;
  /** Delay in ms before closing after mouse leaves (default 150ms) */
  hoverCloseDelay?: number;
}

export function Popover({
  trigger,
  children,
  align = "right",
  className,
  panelClassName,
  matchTriggerWidth = false,
  placement = "bottom",
  hover = false,
  hoverOpenDelay = 200,
  hoverCloseDelay = 250,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = () => setOpen(false);
  const toggle = () => {
    setOpen((prev) => {
      const newOpen = !prev;

      // Calculate position when opening
      if (newOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }

      return newOpen;
    });
  };

  // Hover timers (used when `hover` is true to avoid immediate close when moving
  // from trigger to panel). Use number because window.setTimeout returns a number in browsers.
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearOpenTimer = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const startOpenTimer = () => {
    clearCloseTimer();
    clearOpenTimer();
    openTimerRef.current = window.setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
      setOpen(true);
      openTimerRef.current = null;
    }, hoverOpenDelay);
  };

  const startCloseTimer = () => {
    clearOpenTimer();
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, hoverCloseDelay);
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = containerRef.current?.contains(target) ?? false;
      const clickedPanel = panelRef.current?.contains(target) ?? false;
      if (!clickedTrigger && !clickedPanel) close();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <div
        ref={containerRef}
        className={clsx("relative", className)}
        onMouseEnter={() => hover && startOpenTimer()}
        onMouseLeave={() => hover && startCloseTimer()}
        onFocus={() => hover && startOpenTimer()}
        onBlur={() => hover && startCloseTimer()}
      >
        {trigger({ open, toggle, close })}
      </div>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className={clsx(
              "fixed min-w-40 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden",
              panelClassName
            )}
            onMouseEnter={() => hover && clearCloseTimer()}
            onMouseLeave={() => hover && startCloseTimer()}
            style={{
              // Vertical position defaults to align with trigger top for side placements
              top:
                placement === "top"
                  ? position.top - 8
                  : placement === "bottom"
                  ? position.top + position.height + 8
                  : position.top,
              // Horizontal position: support side placements (right/left) and default behavior
              left:
                placement === "right"
                  ? position.left + position.width + 8
                  : placement === "left"
                  ? Math.max(8, position.left - 160 - 8)
                  : align === "right"
                  ? Math.max(8, position.left + position.width - 160)
                  : position.left,
              zIndex: 9999,
              width: matchTriggerWidth ? position.width : undefined,
              transform:
                placement === "top"
                  ? "translateY(-100%)"
                  : placement === "left"
                  ? "translateX(-100%)"
                  : undefined,
            }}
          >
            {children(close)}
          </div>,
          document.body
        )}
    </>
  );
}

export default Popover;
