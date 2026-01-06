import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  isLoading?: boolean;
  icon?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isLoading ? undefined : onClose}
      />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md m-4">
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-4 flex-1">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            disabled={isLoading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-2">
          <div className="text-sm text-gray-600">{description}</div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            disabled={isLoading}
            className={`flex-1 ${
              confirmVariant === "danger" ? "bg-red-600 hover:bg-red-700" : ""
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;
