import { create } from "zustand";
import { persist } from "zustand/middleware";
import { checkPermission } from "@/lib/permission/permissions.functons";

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      isAuthenticated: () => get().user !== null,
      getPermissions: () => {
        const user = get().user;
        return parsePermissions(user?.roleDetails?.permissions);
      },
      hasPermission: (permission: string) => {
        const permissions = get().getPermissions();
        return checkPermission(permissions, permission);
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
