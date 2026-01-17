import { useState, useEffect } from "react";
import { EllipsisVerticalIcon, PencilIcon } from "@heroicons/react/24/outline";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { Role } from "@/api/rolesApi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Popover } from "@/components/ui/Popover";
import { Trash } from "lucide-react";

export type EditHandler = (role: Role) => void;
export type DeleteHandler = (id: string) => void | Promise<void>;

function ActionsCell(
  params: ICellRendererParams<Role>,
  handleEdit: EditHandler,
  handleDelete: DeleteHandler
) {
  const role = params.data as Role | undefined;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsDeleteOpen(false);
    setIsDeleting(false);
  }, [role?.id]);

  if (!role) return null;

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDelete(role.id);
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
                  handleEdit(role);
                  close();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
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
        title={`Delete ${role.name}`}
        description={`Are you sure you want to delete role '${role.name}'? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

export function getRoleColumnDefs(
  handleEdit: EditHandler,
  handleDelete: DeleteHandler
): ColDef<Role>[] {
  return [
    { headerName: "ID", field: "id", maxWidth: 140 },
    {
      headerName: "Name",
      field: "name",
      flex: 1,
      minWidth: 180,
      cellRenderer: (params: ICellRendererParams<Role>) => {
        const d = params.data;
        if (!d) return null;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{d.name}</span>
            <span className="text-xs text-gray-500">{d.description}</span>
          </div>
        );
      },
    },
    {
      headerName: "Status",
      field: "isActive",
      maxWidth: 120,
      cellRenderer: (params: ICellRendererParams<Role>) => (
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
      headerName: "Actions",
      field: "id",
      maxWidth: 120,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Role>) =>
        ActionsCell(params, handleEdit, handleDelete),
    },
  ];
}
