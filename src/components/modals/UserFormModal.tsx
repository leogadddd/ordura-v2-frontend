import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  PlusIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { userFormSchema } from "@/pages/users/schema";
import RoleFormModal from "@/components/modals/RoleFormModal";
import { ALL_PERMISSIONS } from "@/lib/generated-permissions";
import { modules } from "@/lib/permission/permissions";
import { getUser } from "@/api/usersApi";
import { createRole, updateRole } from "@/api/rolesApi";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userOverrides, setUserOverrides] = useState<
    Record<string, boolean | null>
  >({});
  const [isLoadingOverrides, setIsLoadingOverrides] = useState(false);
  const [isRoleEditorOpen, setIsRoleEditorOpen] = useState(false);

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
      // Load per-user permission overrides when editing an existing user
      if (user?.id) {
        setIsLoadingOverrides(true);
        getUser(user.id)
          .then((res) => {
            const perms = res?.data?.user?.permissions ?? [];
            const map: Record<string, boolean | null> = {};
            // initialize map with explicit overrides
            (ALL_PERMISSIONS as readonly string[])
              .filter((p) => p !== "*" && !p.includes("*:"))
              .forEach((p) => {
                map[p] = null;
              });
            for (const p of perms) {
              map[p.name] = Boolean(p.isAllowed);
            }
            setUserOverrides(map);
          })
          .catch(() => {
            setUserOverrides({});
          })
          .finally(() => setIsLoadingOverrides(false));
      } else {
        // On create, initialize overrides to inherit (null)
        const map: Record<string, boolean | null> = {};
        (ALL_PERMISSIONS as readonly string[])
          .filter((p) => p !== "*" && !p.includes("*:"))
          .forEach((p) => {
            map[p] = null;
          });
        setUserOverrides(map);
      }
    }
  }, [isOpen, user]);

  const cycleOverride = (perm: string) => {
    setUserOverrides((prev) => {
      const cur = perm in prev ? prev[perm] : null;
      const next = cur === null ? true : cur === true ? false : null;
      return { ...prev, [perm]: next };
    });
  };

  const resetOverride = (perm: string) => {
    setUserOverrides((prev) => ({ ...prev, [perm]: null }));
  };

  const resetAllOverrides = () => {
    setUserOverrides(() => {
      const out: Record<string, boolean | null> = {};
      (ALL_PERMISSIONS as readonly string[])
        .filter((p) => p !== "*" && !p.includes("*:"))
        .forEach((p) => (out[p] = null));
      return out;
    });
  };

  const getRolePermissions = () => {
    const r = roles?.find((rr: any) => rr.id === formData.roleId);
    if (!r) return [] as string[];
    if (Array.isArray(r.permissions)) return r.permissions as string[];
    // handle old JSON shape
    const perms: string[] = [];
    const pmap = r.permissions as any;
    for (const m in pmap) {
      for (const a in pmap[m]) {
        if (pmap[m][a]) perms.push(`${m}:${a}`);
      }
    }
    return perms;
  };

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
      // Include per-user permission overrides (only those that are explicit)
      const overrides = Object.entries(userOverrides || {})
        .filter(([, v]) => v !== null)
        .map(([name, v]) => ({ name, isAllowed: !!v }));
      if (overrides.length > 0) payload.permissions = overrides;
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
              <div className="flex items-center justify-end mb-3 gap-2">
                <button
                  type="button"
                  onClick={resetAllOverrides}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Reset all overrides
                </button>
                <button
                  type="button"
                  onClick={() => setIsRoleEditorOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Edit role permissions
                </button>
              </div>
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
          {/* Role editor modal (quick edit) */}
          <RoleFormModal
            isOpen={isRoleEditorOpen}
            onClose={() => setIsRoleEditorOpen(false)}
            role={roles?.find((r: any) => r.id === formData.roleId) as any}
            onSave={async (data: any) => {
              try {
                if (formData.roleId) {
                  await updateRole(formData.roleId, data);
                } else {
                  await createRole(data);
                }
                await refreshRoles({ force: true });
                showToast.success("Role saved");
                setIsRoleEditorOpen(false);
              } catch (err: any) {
                console.error("Failed to save role:", err);
                showToast.error(err?.message || "Failed to save role");
                throw err;
              }
            }}
          />

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
                      type={showPassword ? "text" : "password"}
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
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
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
                      type={showConfirmPassword ? "text" : "password"}
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
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      }
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

          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  Permissions
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Per-user permission overrides. Click a permission to cycle
                between Inherit → Allow → Deny.
              </p>
            </div>
            <div className="w-[70%]">
              {isLoadingOverrides ? (
                <p className="text-sm text-gray-500">Loading permissions…</p>
              ) : (
                <div className="space-y-4 max-h-64 overflow-auto pr-2">
                  {(modules || []).map((m) => {
                    const perms = (ALL_PERMISSIONS as readonly string[]).filter(
                      (p) => p.split(":")[0] === m && !p.includes("*")
                    );
                    if (perms.length === 0) return null;
                    const rolePerms = getRolePermissions();
                    return (
                      <div key={m} className="border rounded p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-sm">{m}</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map((p) => {
                            const state = userOverrides[p];
                            const roleHas = rolePerms.includes(p);
                            const effective = state !== null ? state : roleHas;
                            return (
                              <div
                                key={p}
                                className="flex items-center justify-between gap-4 p-2 rounded hover:bg-white"
                              >
                                <div className="text-sm text-gray-700">
                                  {p.split(":")[1]}
                                  <div className="text-xs text-gray-400">
                                    {p}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    {roleHas && (
                                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                                        role
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => cycleOverride(p)}
                                      disabled={isSaving}
                                      className={`text-sm px-2 py-1 rounded-md font-medium ${
                                        state === true
                                          ? "bg-green-600 text-white"
                                          : state === false
                                          ? "bg-red-600 text-white"
                                          : effective
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                      title={
                                        state === true
                                          ? "Explicitly allowed"
                                          : state === false
                                          ? "Explicitly denied"
                                          : effective
                                          ? "Inherit (allowed by role)"
                                          : "Inherit (not allowed)"
                                      }
                                    >
                                      {state === true
                                        ? "Allow"
                                        : state === false
                                        ? "Deny"
                                        : effective
                                        ? "Inherit (Yes)"
                                        : "Inherit (No)"}
                                    </button>
                                    {state !== null && (
                                      <button
                                        type="button"
                                        onClick={() => resetOverride(p)}
                                        disabled={isSaving}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                        title="Reset to inherit"
                                      >
                                        Reset
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
