import { useCallback, useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { RoleFormModal } from "@/components/modals/RoleFormModal";
import { getRoleColumnDefs } from "./column-def";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/useRoles";
import { getRole } from "@/api/rolesApi";
import type { Role } from "@/api/rolesApi";
import { showToast } from "@/lib/toast";
import { useOptions } from "@/context/OptionsProvider";

export function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const { refreshRoles } = useOptions();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Refresh when the route changes and this page is active
  const location = useLocation();
  useEffect(() => {
    handleRefresh();
  }, [location.pathname, handleRefresh]);

  const handleEdit = useCallback((role: Role) => {
    // Fetch full role (including permissions) before opening editor
    getRole(role.id)
      .then((res) => setSelectedRole(res.data))
      .catch((err) => {
        console.error("Failed to load role details:", err);
      })
      .finally(() => setIsModalOpen(true));
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteRole.mutateAsync(id);
        showToast.success("Role deleted");
        refreshRoles({ force: true }).catch(() => {});
      } catch (err: any) {
        console.error("Failed to delete role:", err);
        showToast.error(err?.message || "Failed to delete role");
        throw err;
      }
    },
    [deleteRole, refreshRoles]
  );

  const handleSave = useCallback(
    async (data: any) => {
      try {
        if (selectedRole) {
          await updateRole.mutateAsync({ id: selectedRole.id, data });
          showToast.success("Role updated");
        } else {
          await createRole.mutateAsync(data);
          showToast.success("Role created");
        }
        setIsModalOpen(false);
        setSelectedRole(undefined);
      } catch (err) {
        throw err;
      }
    },
    [selectedRole, createRole, updateRole]
  );

  const columnDefs = useMemo(
    () => getRoleColumnDefs(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  const roles: Role[] = (data?.data?.items as Role[]) || [];

  const filtered = roles.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (r.name + (r.description || "")).toLowerCase().includes(q);
  });

  return (
    <div className="h-full flex flex-col p-6">
      <header className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Roles</h1>
          <p className="text-sm text-gray-600">Manage roles & permissions.</p>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl"
            />
          </div>
          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="md"
            className="flex items-center gap-2 whitespace-nowrap h-10"
            disabled={isRefreshing}
          >
            <ArrowPathIcon
              className="w-4 h-4"
              style={{
                animation: isRefreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            Refresh
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="md"
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4" /> Add Role
          </Button>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col transition-opacity">
        {error ? (
          <div className="flex flex-1 items-center justify-center text-red-500 text-sm">
            Error loading roles. Please try again.
          </div>
        ) : (
          <DataGrid<Role>
            rowData={filtered || []}
            columnDefs={columnDefs}
            loading={isLoading || isRefreshing}
            noRowsMessage={'No roles found. Click "Add Role" to create one.'}
            height="100%"
          />
        )}
      </div>

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRole(undefined);
        }}
        role={selectedRole}
        onSave={handleSave}
      />
    </div>
  );
}

export default RolesPage;
