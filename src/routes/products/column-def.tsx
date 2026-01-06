import { useEffect, useState } from "react";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import type { Product } from "@/api/productsApi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Popover } from "@/components/ui/Popover";

export type EditHandler = (product: Product) => void;
export type DeleteHandler = (id: string) => void | Promise<void>;

export function getProductColumnDefs(
  handleEdit: EditHandler,
  handleDelete: DeleteHandler
): ColDef<Product>[] {
  function ActionsCell(params: ICellRendererParams<Product>) {
    const product = params.data as Product | undefined;
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
      setIsDeleteOpen(false);
      setIsDeleting(false);
    }, [product?.id]);

    if (!product) return null;

    const confirmDelete = async () => {
      setIsDeleting(true);
      try {
        await handleDelete(product.id);
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
              <div className="py-1">
                <button
                  onClick={() => {
                    handleEdit(product);
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
                  <TrashIcon className="w-4 h-4" />
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
          title={`Delete ${product.name}`}
          description={`Are you sure you want to delete ${product.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          isLoading={isDeleting}
        />
      </>
    );
  }

  return [
    {
      headerName: "ID",
      field: "id" as keyof Product,
      maxWidth: 120,
    },
    {
      headerName: "SKU",
      field: "sku" as keyof Product,
      flex: 1,
      minWidth: 140,
    },
    {
      headerName: "Product Name",
      field: "name" as keyof Product,
      flex: 1.4,
      minWidth: 200,
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const data = params.data as Product | undefined;
        if (!data) return null;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{data.name}</span>
            {data.isDraft && (
              <span className="text-xs text-yellow-600">(Draft)</span>
            )}
          </div>
        );
      },
    },
    {
      headerName: "Category",
      field: "category" as keyof Product,
      flex: 1,
      minWidth: 140,
    },
    {
      headerName: "Cost",
      field: "cost" as keyof Product,
      maxWidth: 140,
      valueFormatter: (params: ValueFormatterParams<Product>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right",
    },
    {
      headerName: "Price",
      field: "sellingPrice" as keyof Product,
      maxWidth: 140,
      valueFormatter: (params: ValueFormatterParams<Product>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right font-medium",
    },
    {
      headerName: "Status",
      field: "status" as keyof Product,
      maxWidth: 150,
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const status = params.value as Product["status"];
        const style =
          status === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : status === "INACTIVE"
            ? "bg-gray-100 text-gray-700"
            : "bg-red-100 text-red-700";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}
          >
            {status}
          </span>
        );
      },
      cellClass: "flex items-center justify-center",
    },
    {
      headerName: "Actions",
      field: "id" as keyof Product,
      maxWidth: 100,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: ActionsCell,
    },
  ];
}
