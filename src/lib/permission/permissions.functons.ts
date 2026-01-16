import { permissionsAction, modules } from "./permissions.manifest";

type Module = (typeof modules)[number]; // "USERS" | "ROLES" | "PRODUCTS" | ...
type ActionKey = keyof typeof permissionsAction; // "VIEW" | "CREATE" | "EDIT" | "DELETE"

export type PermissionManifest = Record<Module, Record<ActionKey, string>>;

export const generatePermissionsManifest = (): PermissionManifest => {
  const manifest: Partial<PermissionManifest> = {};
  modules.forEach((module) => {
    manifest[module] = {} as Record<ActionKey, string>;
    Object.keys(permissionsAction).forEach((actionKey) => {
      const action = permissionsAction[actionKey as ActionKey];
      (manifest[module] as Record<ActionKey, string>)[
        actionKey as ActionKey
      ] = `${module}:${action}`;
    });
  });
  return manifest as PermissionManifest;
};

export const permissionsManifest = generatePermissionsManifest();

export const checkPermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  for (const perm of userPermissions) {
    if (perm === "*") return true;
    if (perm === requiredPermission) return true;
    // Check for module wildcard (e.g., "USERS:*")
    const [module] = requiredPermission.split(":");
    if (perm === `${module}:*`) return true;
  }
  return false;
};

export const checkModulePermission = (
  userPermissions: string[],
  module: Module,
  action: ActionKey
): boolean => {
  const permission = permissionsManifest[module]?.[action];
  if (!permission) {
    return false;
  }
  return checkPermission(userPermissions, permission);
};

export const checkIfCanView = (
  userPermissions: string[],
  module: Module
): boolean => {
  return checkModulePermission(userPermissions, module, "VIEW");
};

export const checkIfCanCreate = (
  userPermissions: string[],
  module: Module
): boolean => {
  return checkModulePermission(userPermissions, module, "CREATE");
};

export const checkIfCanEdit = (
  userPermissions: string[],
  module: Module
): boolean => {
  return checkModulePermission(userPermissions, module, "EDIT");
};

export const checkIfCanDelete = (
  userPermissions: string[],
  module: Module
): boolean => {
  return checkModulePermission(userPermissions, module, "DELETE");
};
