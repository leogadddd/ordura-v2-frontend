import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRolesList,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  type Role,
} from "@/api/rolesApi";

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: () => [...roleKeys.lists(), {}] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

export function useRoles() {
  return useQuery({ queryKey: roleKeys.list(), queryFn: () => getRolesList() });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => getRole(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Role>) => createRole(data as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.lists() }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) =>
      updateRole(id, data as any),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: roleKeys.lists() });
      qc.invalidateQueries({ queryKey: roleKeys.detail(vars.id) });
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.lists() }),
  });
}
