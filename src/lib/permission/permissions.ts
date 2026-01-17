import { ALL_PERMISSIONS } from "@/lib/generated-permissions";

// Derive modules and actions from generated permissions
const PERMS = ALL_PERMISSIONS as readonly string[];

export const modules = Array.from(
  new Set(
    PERMS.filter((p) => p !== "*" && !p.startsWith("*:")).map(
      (p) => p.split(":")[0]
    )
  )
);

export const actions = Array.from(
  new Set(
    PERMS.filter((p) => p.includes(":") && !p.includes("*:")).map(
      (p) => p.split(":")[1]
    )
  )
);
export type Module = (typeof modules)[number];
export type Action = (typeof actions)[number];

/**
 * Create a permission string from module and action, e.g. 'PRODUCTS:create'
 */
export function makePermission(
  module: Module | string,
  action: Action | string
): string {
  return `${module}:${action}`;
}

/**
 * Create a permission string and validate it exists in the generated manifest.
 * Throws an error if the resulting permission is not in the manifest.
 */
export function makePermissionValidated(
  module: Module | string,
  action: Action | string
): string {
  const p = makePermission(module, action);
  if (!PERMS.includes(p) && p !== "*") {
    throw new Error(
      `Permission '${p}' is not defined in the permissions manifest`
    );
  }
  return p;
}

export const checkPermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  for (const perm of userPermissions) {
    if (perm === "*") return true;
    if (perm === requiredPermission) return true;
    // Resource wildcard: 'MODULE:*'
    const [module, action] = requiredPermission.split(":");
    if (perm === `${module}:*`) return true;
    // Action wildcard across resources: '*:action'
    if (action && perm === `*:${action}`) return true;
  }
  return false;
};

export const checkIfCan = (
  userPermissions: string[],
  module: string,
  action: string
): boolean => {
  const permission = `${module}:${action}`;
  return checkPermission(userPermissions, permission);
};

export const checkIfCanView = (
  userPermissions: string[],
  module: string
): boolean => checkIfCan(userPermissions, module, "VIEW");

export const checkIfCanCreate = (
  userPermissions: string[],
  module: string
): boolean => checkIfCan(userPermissions, module, "CREATE");

export const checkIfCanEdit = (
  userPermissions: string[],
  module: string
): boolean => checkIfCan(userPermissions, module, "EDIT");
export const checkIfCanDelete = (
  userPermissions: string[],
  module: string
): boolean => checkIfCan(userPermissions, module, "DELETE");

export const checkIfCanManage = (
  userPermissions: string[],
  module: string
): boolean => checkIfCan(userPermissions, module, "MANAGE");
