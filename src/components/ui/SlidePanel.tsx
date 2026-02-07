import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SlidePanelProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string; // e.g., "w-3/4", "w-11/12", default "w-11/12" (88%)
  showHeader?: boolean; // default true
  showCloseButton?: boolean; // default true
}

export function SlidePanel({
  isOpen,
  onClose,
  children,
  title,
  width = "w-11/12",
  showHeader = true,
  showCloseButton = true,
}: SlidePanelProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div
        className={`relative ml-auto h-full ${width} bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden h-full">{children}</div>
      </div>
    </div>
  );
}
