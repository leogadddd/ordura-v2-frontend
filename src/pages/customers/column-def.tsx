import { useEffect, useState } from "react";
import { EllipsisVerticalIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Popover } from "@/components/ui/Popover";
import type { CustomerRow } from ".";
import { Trash } from "lucide-react";

export type EditHandler = (customer: CustomerRow) => void;
export type ViewHandler = (customer: CustomerRow) => void;
export type DeleteHandler = (id: string) => void | Promise<void>;

function ActionsCell(
  params: ICellRendererParams<CustomerRow>,
  handleView: ViewHandler,
  handleEdit: EditHandler,
  handleDelete: DeleteHandler,
) {
  const customer = params.data as CustomerRow | undefined;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsDeleteOpen(false);
    setIsDeleting(false);
  }, [customer?.id]);

  if (!customer) return null;

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDelete(customer.id);
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
                  handleView(customer);
                  close();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <EyeIcon className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => {
                  handleEdit(customer);
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
                Deactivate
              </button>
            </div>
          )}
        </Popover>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => (isDeleting ? null : setIsDeleteOpen(false))}
        onConfirm={confirmDelete}
        title={`Deactivate ${customer.displayName}`}
        description={`Are you sure you want to deactivate ${customer.displayName}?`}
        confirmText="Deactivate"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

export function getCustomerColumnDefs(
  handleView: ViewHandler,
  handleEdit: EditHandler,
  handleDelete: DeleteHandler,
): ColDef<CustomerRow>[] {
  return [
    { headerName: "#", field: "customerNumber", maxWidth: 170 },
    {
      headerName: "Customer",
      field: "displayName",
      flex: 1.6,
      minWidth: 220,
      cellRenderer: (params: ICellRendererParams<CustomerRow>) => {
        const d = params.data;
        if (!d) return null;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{d.displayName}</span>
            <span className="text-xs text-gray-500">
              {(d.email || "") + (d.phone ? ` • ${d.phone}` : "")}
            </span>
          </div>
        );
      },
    },
    {
      headerName: "Lifetime Spend",
      field: "metrics.lifetimeSpend",
      flex: 1,
      minWidth: 160,
      valueFormatter: (params) => {
        const v = Number(params.value ?? 0);
        return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
    },
    {
      headerName: "Orders",
      field: "metrics.ordersCount",
      maxWidth: 120,
      cellClass: "flex items-center justify-center",
    },
    {
      headerName: "Status",
      field: "isActive",
      maxWidth: 120,
      cellRenderer: (params: ICellRendererParams<CustomerRow>) => (
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
        if (!params.value) return "";
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
      cellRenderer: (params: ICellRendererParams<CustomerRow>) =>
        ActionsCell(params, handleView, handleEdit, handleDelete),
    },
  ];
}
