import { useState, useEffect } from "react";
import { EllipsisVerticalIcon, PencilIcon } from "@heroicons/react/24/outline";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { UserRow } from ".";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Popover } from "@/components/ui/Popover";
import { Key, Trash } from "lucide-react";

export type EditHandler = (user: UserRow) => void;
export type DeleteHandler = (id: string) => void | Promise<void>;

function ActionsCell(
  params: ICellRendererParams<UserRow>,
  handleEdit: EditHandler,
  handleDelete: DeleteHandler,
  handleChangePassword: (user: UserRow) => void
) {
  const user = params.data as UserRow | undefined;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsDeleteOpen(false);
    setIsDeleting(false);
  }, [user?.id]);

  if (!user) return null;

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDelete(user.id);
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-full">
        <Popover
          trigger={({ toggle }) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              className="p-2 mt-2"
              title="Actions"
            >
              <EllipsisVerticalIcon className="w-6 h-6 text-gray-600" />
            </button>
          )}
          align="right"
        >
          {(close) => (
            <div>
              <button
                onClick={() => {
                  handleEdit(user);
                  close();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  handleChangePassword(user);
                  close();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
              <button
                onClick={() => {
                  close();
                  setIsDeleteOpen(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </Popover>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => (isDeleting ? null : setIsDeleteOpen(false))}
        onConfirm={confirmDelete}
        title={`Delete ${user.username}`}
        description={`Are you sure you want to delete ${user.username}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

export function getUserColumnDefs(
  handleEdit: EditHandler,
  handleDelete: DeleteHandler,
  handleChangePassword: (user: UserRow) => void
): ColDef<UserRow>[] {
  return [
    { headerName: "ID", field: "id", maxWidth: 120 },
    {
      headerName: "Full Name",
      field: "firstName",
      flex: 1.4,
      minWidth: 200,
      cellRenderer: (params: ICellRendererParams<UserRow>) => {
        const d = params.data;
        if (!d) return null;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {d.firstName} {d.lastName}
            </span>
            <span className="text-xs text-gray-500">{d.email}</span>
          </div>
        );
      },
    },
    { headerName: "Username", field: "username", flex: 1, minWidth: 140 },
    {
      headerName: "Role",
      field: "roleDetails.name",
      flex: 1,
      minWidth: 140,
    },
    {
      headerName: "Status",
      field: "isActive",
      maxWidth: 120,
      cellRenderer: (params: ICellRendererParams<UserRow>) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
      cellClass: "flex items-center justify-center",
    },
    {
      headerName: "Created At",
      field: "createdAt",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      },
    },
    {
      headerName: "Actions",
      field: "id",
      maxWidth: 100,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<UserRow>) =>
        ActionsCell(params, handleEdit, handleDelete, handleChangePassword),
    },
  ];
}
