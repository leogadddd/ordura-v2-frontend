import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { InformationCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { roleFormSchema } from "@/pages/roles/schema";
import type { Role } from "@/api/rolesApi";
import { showToast } from "@/lib/toast";
import { useOptions } from "@/context/OptionsProvider";
import PermissionsModal from "@/components/modals/PermissionsModal";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | undefined;
  onSave: (data: any) => Promise<void> | void;
}

export function RoleFormModal({
  isOpen,
  onClose,
  role,
  onSave,
}: RoleFormModalProps) {
  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    permissions: [],
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { refreshRoles } = useOptions();
  const [isPermsOpen, setIsPermsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: role?.name || "",
        description: role?.description || "",
        permissions: Array.isArray(role?.permissions)
          ? role?.permissions || []
          : [],
        isActive: role?.isActive ?? true,
      });
      setErrors({});
    }
  }, [isOpen, role]);

  const togglePermission = (p: string) => {
    setForm((prev: any) => {
      const set = new Set(prev.permissions || []);
      if (set.has(p)) set.delete(p);
      else set.add(p);
      return { ...prev, permissions: Array.from(set) };
    });
  };

  const validate = (): boolean => {
    try {
      roleFormSchema.parse(form);
      setErrors({});
      return true;
    } catch (err: any) {
      const v: Record<string, string> = {};
      err.errors?.forEach((e: any) => {
        v[e.path[0]] = e.message;
      });
      setErrors(v);
      return false;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSave({ ...form });
      await refreshRoles({ force: true }).catch(() => {});
      onClose();
    } catch (err: any) {
      console.error("Failed to save role:", err);
      showToast.error(err?.message || "Failed to save role");
      setErrors({ submit: String(err?.message || "Failed to save role") });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? "Edit Role" : "Add Role"}
      icon={<PlusIcon className="w-6 h-6" />}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-6 pr-4 pt-4 pb-10">
          <section className="flex gap-6">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">Details</h3>
                <Tooltip content="Basic role information" position="right">
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Name and description for this role.
              </p>
            </div>
            <div className="w-[70%]">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Role name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, name: e.target.value }))
                  }
                  error={errors.name}
                />
                <Textarea
                  label="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, description: e.target.value }))
                  }
                />
                <div className="flex items-center gap-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((p: any) => ({
                        ...p,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
                {errors.submit && (
                  <p className="text-sm text-red-600">{errors.submit}</p>
                )}
              </div>
            </div>
          </section>

          <section className="flex gap-6 pt-6 border-t border-gray-100">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  Permissions
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Toggle permissions associated with this role.
              </p>
            </div>
            <div className="w-[70%]">
              <div className="flex flex-col justify-between mb-3">
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => setIsPermsOpen(true)}
                    className="text-sm text-primary"
                  >
                    Edit permissions
                  </Button>
                  <span className="text-sm text-gray-600">
                    ({(form.permissions || []).length} selected)
                  </span>
                </div>
              </div>

              <PermissionsModal
                isOpen={isPermsOpen}
                onClose={() => setIsPermsOpen(false)}
                mode="role"
                initialPermissions={(form.permissions || []) as string[]}
                onSave={(perms: string[]) =>
                  setForm((p: any) => ({ ...p, permissions: perms }))
                }
              />
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 bg-white sticky pb-1 bottom-0">
          <Button onClick={onClose} variant="outline" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary" disabled={isSaving}>
            {isSaving ? "Saving..." : role ? "Update Role" : "Add Role"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default RoleFormModal;
