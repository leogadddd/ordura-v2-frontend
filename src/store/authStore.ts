import { create } from "zustand";
import { persist } from "zustand/middleware";
import { checkPermission } from "@/lib/permission/permissions";

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  roleDetails?: {
    id: string;
    name: string;
    description?: string;
    permissions?: string[] | Record<string, Record<string, boolean>>;
  };
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
  getPermissions: () => string[];
  hasPermission: (permission: string) => boolean;
}

// Extended state with in-memory permissions (not persisted)
interface AuthStateWithPerms extends AuthState {
  permissions: string[];
  setPermissions: (perms: string[] | undefined) => void;
  clearPermissions: () => void;
}

const parsePermissions = (
  permissions?: string[] | Record<string, Record<string, boolean>>
): string[] => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) return permissions;
  // Handle old JSON format
  const perms: string[] = [];
  for (const module in permissions) {
    for (const action in permissions[module]) {
      if (permissions[module][action]) {
        perms.push(`${module}:${action.toLowerCase()}`);
      }
    }
  }
  return perms;
};

export const useAuthStore = create<AuthStateWithPerms>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      setUser: (user) => {
        if (!user) return set({ user: null, permissions: [] });

        // Extract permissions from possible shapes (user.permissions, user.role, user.roleDetails)
        const rawPerms: any =
          (user as any).permissions ??
          (user as any).role?.permissions ??
          (user as any).roleDetails?.permissions;
        const perms = parsePermissions(rawPerms as any);

        // Build sanitized minimal user to persist (no permissions)
        const roleSource = (user as any).role ?? (user as any).roleDetails;
        const sanitized: User = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          roleDetails: roleSource
            ? {
                id: roleSource.id,
                name: roleSource.name,
                description: roleSource.description,
              }
            : undefined,
        };

        set({ user: sanitized, permissions: perms });
      },
      clearUser: () => set({ user: null, permissions: [] }),
      isAuthenticated: () => get().user !== null,
      // Permissions are kept in-memory and not persisted
      setPermissions: (perms) =>
        set({ permissions: parsePermissions(perms as any) }),
      clearPermissions: () => set({ permissions: [] }),
      getPermissions: () => {
        return get().permissions;
      },
      hasPermission: (permission: string) => {
        const permissions = get().getPermissions();
        return checkPermission(permissions, permission);
      },
    }),
    {
      name: "auth-storage",
      // Persist only minimal user info (exclude permissions)
      partialize: (state) => {
        const u = state.user;
        if (!u) return { user: null } as any;
        return {
          user: {
            id: u.id,
            email: u.email,
            username: u.username,
            firstName: u.firstName,
            lastName: u.lastName,
            roleDetails: u.roleDetails
              ? { id: u.roleDetails.id, name: u.roleDetails.name }
              : undefined,
          },
        } as any;
      },
    }
  )
);
