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
  matchTriggerWidth?: boolean;
}

export function Popover({
  trigger,
  children,
  align = "right",
  className,
  matchTriggerWidth = false,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = () => setOpen(false);
  const toggle = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen((prev) => !prev);
  };

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
        className={clsx("relative inline-block", className)}
      >
        {trigger({ open, toggle, close })}
      </div>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className={clsx(
              "fixed min-w-40 rounded-lg border border-gray-200 bg-white shadow-lg"
            )}
            style={{
              top: position.top + 8,
              left:
                align === "right"
                  ? position.left + position.width - 160
                  : position.left,
              zIndex: 9999,
              width: matchTriggerWidth ? position.width : undefined,
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
