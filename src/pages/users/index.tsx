import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getUsers, createUser, updateUser, deleteUser } from "@/api/usersApi";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import { showToast } from "@/lib/toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import UserFormModal from "@/components/modals/UserFormModal";
import { getUserColumnDefs } from "./column-def";

export type UserRow = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  roleId?: string;
  roleDetails?: { id: string; name: string } | null;
  isActive?: boolean;
  createdAt?: string;
};

export function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<UserRow[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getUsers({
        page: 1,
        limit: 50,
        search: searchQuery || undefined,
      });
      setUsers(res?.data?.items ?? []);
    } finally {
      setIsRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    // initial load
    handleRefresh();
  }, [handleRefresh]);

  // Refresh whenever the route/pathname changes while this component is mounted
  const location = useLocation();
  useEffect(() => {
    handleRefresh();
  }, [location.pathname, handleRefresh]);

  const handleEdit = useCallback((user: UserRow) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<UserRow | undefined>();

  const handleOpenChangePassword = useCallback((user: UserRow) => {
    setPasswordUser(user);
    setIsChangePasswordOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast.success("User deactivated");
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      showToast.error(err?.message || "Failed to delete user");
    }
  }, []);

  const handleSelectionChanged = useCallback(
    (selected: UserRow[]) => setSelectedRows(selected),
    []
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;
    setIsBulkDeleteOpen(true);
  }, [selectedRows]);

  const confirmBulkDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;
    try {
      await Promise.all(selectedRows.map((s) => deleteUser(s.id)));
      setUsers((prev) =>
        prev.filter((u) => !selectedRows.some((s) => s.id === u.id))
      );
      setSelectedRows([]);
      setIsBulkDeleteOpen(false);
      showToast.success("Selected users deactivated");
    } catch (err: any) {
      console.error("Bulk delete failed:", err);
      showToast.error(err?.message || "Failed to delete selected users");
    }
  }, [selectedRows]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleSaveUser = useCallback(
    async (data: any) => {
      try {
        if (selectedUser) {
          const res = await updateUser(selectedUser.id, data);
          const updated = res?.data?.user;
          if (updated) {
            setUsers((prev) =>
              prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
            );
            showToast.success("User updated");
          }
        } else {
          const res = await createUser(data);
          const created = res?.data?.user;
          if (created) {
            setUsers((prev) => [created, ...prev]);
            showToast.success("User created");
          }
        }
        setIsModalOpen(false);
        setSelectedUser(undefined);
      } catch (err: any) {
        console.error("Save user failed:", err);
        showToast.error(err?.message || "Failed to save user");
        throw err;
      }
    },
    [selectedUser]
  );

  const columnDefs = useMemo(
    () => getUserColumnDefs(handleEdit, handleDelete, handleOpenChangePassword),
    [handleEdit, handleDelete, handleOpenChangePassword]
  );

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (u.email + u.username + (u.firstName || "") + (u.lastName || ""))
      .toLowerCase()
      .includes(q);
  });

  return (
    <div className="h-full flex flex-col p-6">
      <header className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Users</h1>
          <p className="text-sm text-gray-600">
            Manage user accounts and roles.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search users..."
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
            Refresh
          </Button>
          {selectedRows.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <TrashIcon className="w-4 h-4" /> Delete Selected (
              {selectedRows.length})
            </Button>
          )}
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="md"
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4" /> Add User
          </Button>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <DataGrid<UserRow>
          rowData={filtered}
          columnDefs={columnDefs}
          loading={false}
          noRowsMessage={'No users yet. Click "Add User" to create one.'}
          height="100%"
          rowSelection={{ mode: "multiRow" }}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userId={passwordUser?.id}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedRows.length} Users`}
        description={`Are you sure you want to delete ${selectedRows.length} selected users? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}

export default UsersPage;
