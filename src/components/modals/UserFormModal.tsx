import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { PlusIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { userFormSchema } from "@/pages/users/schema";
import { useOptions } from "@/context/OptionsProvider";
import { showToast } from "@/lib/toast";
import type { UserFormData } from "@/pages/users/schema";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onSave: (data: any) => Promise<void> | void;
}

export function UserFormModal({
  isOpen,
  onClose,
  user,
  onSave,
}: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    roleId: undefined,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { roles, refreshRoles } = useOptions();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        username: user?.username || "",
        roleId: user?.roleId || undefined,
        isActive: user?.isActive ?? true,
      });
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [isOpen, user]);

  const isFormValid = (): boolean => {
    try {
      userFormSchema.parse(formData);
    } catch {
      return false;
    }

    if (!user) {
      if (!password || password.length < 6) return false;
      if (password !== confirmPassword) return false;
    }

    return true;
  };

  useEffect(() => {
    if (!roles) {
      refreshRoles().catch(() => {});
    }
  }, [roles, refreshRoles]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validate = (): boolean => {
    try {
      userFormSchema.parse(formData);
      setErrors({});
    } catch (err: any) {
      const v: Record<string, string> = {};
      err.errors?.forEach((e: any) => {
        v[e.path[0]] = e.message;
      });
      setErrors(v);
      return false;
    }

    // Additional validation for create: password presence and match
    if (!user) {
      if (!password || password.length < 6) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 6 characters",
        }));
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = { ...formData } as any;
      if (!user) payload.password = password;
      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error("Failed to save user:", err);
      showToast.error(err?.message || "Failed to save user");
      setErrors({ submit: String(err?.message || "Failed to save user") });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Edit User" : "Add User"}
      icon={<PlusIcon className="w-6 h-6" />}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-6 pr-4 pt-4 pb-10">
          <section className="flex gap-6">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  Personal Information
                </h3>
                <Tooltip content="Basic personal details" position="right">
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Name and contact details for this user.
              </p>
            </div>
            <div className="w-[70%]">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  autoComplete="new-password"
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </section>

          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">Account</h3>
                <Tooltip
                  content="Login credentials and account settings"
                  position="right"
                >
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Username and password used to sign in.
              </p>
            </div>
            <div className="w-[70%]">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  error={errors.username}
                  required
                  autoComplete="new-password"
                />
                <Input
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={errors.email}
                  required
                  autoComplete="new-password"
                />
                {!user && (
                  <>
                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors((p) => {
                            const n = { ...p };
                            delete n.password;
                            return n;
                          });
                      }}
                      error={errors.password}
                      required
                      autoComplete="new-password"
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors((p) => {
                            const n = { ...p };
                            delete n.confirmPassword;
                            return n;
                          });
                      }}
                      error={errors.confirmPassword}
                      required
                      autoComplete="new-password"
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  Role & Status
                </h3>
                <Tooltip
                  content="Assign a role and set account status"
                  position="right"
                >
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Assign the user's role and determine if the account is active.
              </p>
            </div>
            <div className="w-[70%]">
              <div className="grid grid-cols-2 gap-4 items-center">
                <Select
                  label="Role"
                  value={formData.roleId ?? ""}
                  onChange={(e) =>
                    handleChange("roleId", e.target.value as string)
                  }
                  options={(roles || []).map((r: any) => ({
                    label: r.name,
                    value: r.id,
                  }))}
                />
                <div className="flex items-center gap-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              {errors.submit && (
                <p className="text-sm text-red-600 mt-3">{errors.submit}</p>
              )}
            </div>
          </section>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 bg-white sticky pb-1 bottom-0">
          <Button onClick={onClose} variant="outline" disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={isSaving || !isFormValid()}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Saving...
              </div>
            ) : user ? (
              "Update User"
            ) : (
              "Add User"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default UserFormModal;
