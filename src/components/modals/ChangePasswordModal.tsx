import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { showToast } from "@/lib/toast";
import { changePassword as apiChangePassword } from "@/api/usersApi";
import { formatApiError, extractValidationErrors } from "@/lib/apiError";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  userId,
}: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!password || password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !userId) return;
    setIsSaving(true);
    try {
      await apiChangePassword(userId, { newPassword: password });
      showToast.success("Password changed");
      onClose();
    } catch (err: any) {
      console.error("Change password failed:", err);
      const msg = formatApiError(err);
      showToast.error(msg);
      const validation = extractValidationErrors(err);
      if (validation) setErrors(validation);
      else setErrors({ submit: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-4 pr-4 pt-4 pb-10">
          <div className="grid grid-cols-1 gap-4 max-w-md">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              //   do not autofill the password field
              autoComplete="new-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="p-1 text-gray-600 hover:text-gray-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              }
            />
            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="p-1 text-gray-600 hover:text-gray-800"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              }
            />
            {errors.submit && (
              <p className="text-sm text-red-600">{errors.submit}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 bg-white sticky pb-1 bottom-0">
          <Button onClick={onClose} variant="outline" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary" disabled={isSaving}>
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>{" "}
                Saving...
              </div>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ChangePasswordModal;
