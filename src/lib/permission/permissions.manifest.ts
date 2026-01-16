export const permissionsAction = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
} as const;

export const modules = [
  "USERS",
  "ROLES",
  "PRODUCTS",
  "ORDERS",
  "REPORTS",
  "SETTINGS",
] as const;

export const generatePermissionsManifest = (): Record<
  string,
  Record<string, string>
> => {
  const manifest: Record<string, Record<string, string>> = {};
  modules.forEach((module) => {
    manifest[module] = {};
    Object.keys(permissionsAction).forEach((actionKey) => {
      const action =
        permissionsAction[actionKey as keyof typeof permissionsAction];
      manifest[module][actionKey] = `${module}:${action}`;
    });
  });
  return manifest;
};

export const permissionsManifest = generatePermissionsManifest();

export const checkPermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  return userPermissions.includes(requiredPermission);
};
