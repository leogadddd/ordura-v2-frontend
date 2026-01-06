import { PropsWithChildren, ReactNode, useCallback, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  onBeforeClose?: () => boolean | Promise<boolean>;
  title?: string;
  icon?: ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  onBeforeClose,
  title,
  icon,
  maxWidth = "max-w-7xl",
  children,
}: ModalProps) {
  const attemptClose = useCallback(async () => {
    if (!onBeforeClose) {
      onClose();
      return;
    }

    const shouldClose = await onBeforeClose();
    if (shouldClose !== false) {
      onClose();
    }
  }, [onBeforeClose, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        attemptClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, attemptClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={attemptClose} />

      {/* Modal Content */}
      <div
        className={`overflow-hidden relative bg-white rounded-xl shadow-xl w-full h-auto m-4 md:m-8 flex flex-col ${maxWidth} max-h-[95vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 px-4 bg-primary border-gray-200">
          <div className="flex items-center gap-2">
            {icon && <div className="text-white">{icon}</div>}
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={attemptClose}
            className="p-2 rounded-lg text-white hover:bg-primary-dark"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-4 pt-0">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
