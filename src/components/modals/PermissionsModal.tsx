import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { modules } from "@/lib/permission/permissions";
import { ALL_PERMISSIONS } from "@/lib/generated-permissions";

interface RoleModeProps {
  mode: "role";
  initialPermissions?: string[];
  onSave: (perms: string[]) => Promise<void> | void;
}

interface UserModeProps {
  mode: "user";
  initialOverrides?: Record<string, boolean | null>;
  rolePermissions?: string[];
  onSave: (overrides: Record<string, boolean | null>) => Promise<void> | void;
}

type PermissionsModalProps = (RoleModeProps | UserModeProps) & {
  isOpen: boolean;
  onClose: () => void;
};

export default function PermissionsModal(props: PermissionsModalProps) {
  const { isOpen, onClose } = props as any;
  const [rolePerms, setRolePerms] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Record<string, boolean | null>>(
    {},
  );

  useEffect(() => {
    if (!isOpen) return;
    if (props.mode === "role") {
      setRolePerms(new Set((props as RoleModeProps).initialPermissions || []));
    } else {
      const map: Record<string, boolean | null> = {};
      (ALL_PERMISSIONS as readonly string[])
        .filter((p) => p !== "*" && !p.includes("*:"))
        .forEach((p) => {
          map[p] = null;
        });
      Object.assign(map, (props as UserModeProps).initialOverrides || {});
      setOverrides(map);
    }
  }, [isOpen]);

  const getConcretePermissions = () =>
    (ALL_PERMISSIONS as readonly string[]).filter(
      (p) => p !== "*" && !p.includes("*:"),
    );

  const toggleRolePerm = (p: string) => {
    setRolePerms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const setRolePermsFor = (perms: string[], enabled: boolean) => {
    setRolePerms((prev) => {
      const next = new Set(prev);
      if (enabled) {
        for (const p of perms) next.add(p);
      } else {
        for (const p of perms) next.delete(p);
      }
      return next;
    });
  };

  const cycleOverride = (perm: string) => {
    setOverrides((prev) => {
      const cur = perm in prev ? prev[perm] : null;
      const next = cur === null ? true : cur === true ? false : null;
      return { ...prev, [perm]: next };
    });
  };

  const resetOverride = (perm: string) => {
    setOverrides((prev) => ({ ...prev, [perm]: null }));
  };

  const setOverridesFor = (perms: string[], value: boolean | null) => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const p of perms) next[p] = value;
      return next;
    });
  };

  const resetAll = () => {
    const out: Record<string, boolean | null> = {};
    (ALL_PERMISSIONS as readonly string[])
      .filter((p) => p !== "*" && !p.includes("*:"))
      .forEach((p) => (out[p] = null));
    setOverrides(out);
  };

  const handleSave = async () => {
    if (props.mode === "role") {
      await (props as RoleModeProps).onSave(Array.from(rolePerms));
      onClose();
    } else {
      await (props as UserModeProps).onSave(overrides);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        props.mode === "role"
          ? "Edit Role Permissions"
          : "Edit User Permissions"
      }
      icon={<InformationCircleIcon className="w-6 h-6" />}
    >
      <div className="flex flex-col h-[80vh]">
        <div className="flex-1 overflow-auto space-y-6 pr-4 pt-4 pb-10">
          <section className="flex gap-6">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  {props.mode === "role" ? "Permissions" : "Permissions"}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {props.mode === "role"
                  ? "Toggle permissions associated with this role."
                  : "Set per-user permission overrides. Click a permission to cycle between Inherit → Allow → Deny."}
              </p>
            </div>
            <div className="w-[70%]">
              {props.mode === "role" ? (
                <div className="space-y-4 overflow-auto pr-2">
                  {/* Global wildcard control for roles */}
                  <div className="rounded-xl p-4 bg-primary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-sm text-primary">Global</strong>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <label className="flex items-center gap-2 p-3 rounded-lg hover:bg-primary/20">
                        <input
                          type="checkbox"
                          checked={getConcretePermissions().every((p) =>
                            rolePerms.has(p),
                          )}
                          onChange={(e) =>
                            setRolePermsFor(
                              getConcretePermissions(),
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4"
                        />
                        <div className="text-sm text-gray-700">
                          All permissions
                        </div>
                      </label>
                    </div>
                  </div>

                  {(modules || []).map((m) => {
                    const perms = (ALL_PERMISSIONS as readonly string[]).filter(
                      (p) => p.split(":")[0] === m && !p.includes("*"),
                    );
                    if (perms.length === 0) return null;
                    return (
                      <div
                        key={m}
                        className="rounded-xl p-4 bg-primary/10 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-sm text-primary">{m}</strong>
                          <label className="flex items-center gap-2 text-xs text-gray-500">
                            <input
                              type="checkbox"
                              checked={perms.every((p) => rolePerms.has(p))}
                              onChange={(e) =>
                                setRolePermsFor(perms, e.target.checked)
                              }
                              className="w-4 h-4"
                            />
                            <span className="pl-2">All</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {perms.map((p) => (
                            <label
                              key={p}
                              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-primary/20`}
                            >
                              <input
                                type="checkbox"
                                checked={rolePerms.has(p)}
                                onChange={() => toggleRolePerm(p)}
                                className="w-4 h-4"
                              />
                              <div className="text-sm text-gray-700">
                                {p.split(":")[1]}
                                <div className="text-xs text-gray-400">{p}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 overflow-auto pr-2">
                  {/* Global wildcard control for users */}
                  <div className="rounded-xl p-4 bg-primary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-sm text-primary">Global</strong>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <label className="flex items-center gap-2 p-3 rounded-lg hover:bg-primary/20">
                        <input
                          type="checkbox"
                          checked={getConcretePermissions().every(
                            (p) => overrides[p] === true,
                          )}
                          onChange={(e) =>
                            setOverridesFor(
                              getConcretePermissions(),
                              e.target.checked ? true : null,
                            )
                          }
                          className="w-4 h-4"
                        />
                        <div className="text-sm text-gray-700">
                          All permissions
                        </div>
                      </label>
                    </div>
                  </div>

                  {(modules || []).map((m) => {
                    const perms = (ALL_PERMISSIONS as readonly string[]).filter(
                      (p) => p.split(":")[0] === m && !p.includes("*"),
                    );
                    if (perms.length === 0) return null;
                    const roleHas =
                      (props as UserModeProps).rolePermissions || [];
                    const moduleAllSelected = perms.every(
                      (p) => overrides[p] === true,
                    );
                    return (
                      <div
                        key={m}
                        className="rounded-xl p-4 bg-primary/10 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-sm text-primary">{m}</strong>
                          <label className="flex items-center gap-2 text-xs text-gray-500">
                            <input
                              type="checkbox"
                              checked={moduleAllSelected}
                              onChange={(e) =>
                                setOverridesFor(
                                  perms,
                                  e.target.checked ? true : null,
                                )
                              }
                              className="w-4 h-4"
                            />
                            <span className="pl-2">All</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {perms.map((p) => {
                            const state = overrides[p];
                            const rHas = (roleHas as string[]).includes(p);
                            const effective = state !== null ? state : rHas;
                            return (
                              <div
                                key={p}
                                className={`flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-primary/20`}
                              >
                                <div className="text-sm text-gray-700">
                                  {p.split(":")[1]}
                                  <div className="text-xs text-gray-400">
                                    {p}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    {rHas && (
                                      <span className="text-xs px-2 py-0.5 rounded bg-white text-primary">
                                        role
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => cycleOverride(p)}
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 bg-white sticky pb-1 bottom-0">
          {props.mode === "user" && (
            <Button variant="outline" onClick={resetAll}>
              Reset all
            </Button>
          )}
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
