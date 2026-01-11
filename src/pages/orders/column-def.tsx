import { useEffect, useState } from "react";
import { EllipsisVerticalIcon, EyeIcon } from "@heroicons/react/24/outline";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import type { Order } from "@/api/ordersApi";
import { Popover } from "@/components/ui/Popover";

export type ViewHandler = (order: Order) => void;

export function getOrderColumnDefs(handleView?: ViewHandler): ColDef<Order>[] {
  function ActionsCell(params: ICellRendererParams<Order>) {
    const order = params.data as Order | undefined;
    const [_openKey, setOpenKey] = useState<string>("");

    useEffect(() => {
      setOpenKey("");
    }, [order?.id]);

    if (!order) return null;

    return (
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
            <div className="">
              <button
                onClick={() => {
                  handleView && handleView(order);
                  close();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <EyeIcon className="w-4 h-4" />
                View
              </button>
            </div>
          )}
        </Popover>
      </div>
    );
  }

  return [
    {
      headerName: "Order #",
      field: "orderNumber" as keyof Order,
      width: 120,
      pinned: "left",
    },
    {
      headerName: "Status",
      field: "status" as keyof Order,
      width: 140,
      cellRenderer: (params: ICellRendererParams<Order>) => {
        const status = params.data?.status;
        if (!status) return null;

        const statusColors: Record<string, string> = {
          COMPLETED: "bg-green-100 text-green-700",
          OPEN: "bg-blue-100 text-blue-700",
          CANCELLED: "bg-red-100 text-red-700",
          REFUNDED: "bg-yellow-100 text-yellow-700",
          DRAFT: "bg-gray-100 text-gray-700",
        };

        const style = statusColors[status] || "bg-gray-100 text-gray-700";
        return (
          <div className="flex items-center justify-center h-full">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${style}`}
            >
              {status}
            </span>
          </div>
        );
      },
      cellClass: "flex items-center",
    },
    {
      headerName: "Type",
      field: "type" as keyof Order,
      width: 100,
    },
    {
      headerName: "Customer",
      field: "customerName" as keyof Order,
      minWidth: 140,
      flex: 1,
    },
    {
      headerName: "Subtotal",
      field: "subtotal" as keyof Order,
      width: 120,
      valueFormatter: (params: ValueFormatterParams<Order>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right",
    },
    {
      headerName: "Tax",
      field: "taxTotal" as keyof Order,
      width: 100,
      valueFormatter: (params: ValueFormatterParams<Order>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right",
    },
    {
      headerName: "Discount",
      field: "discountTotal" as keyof Order,
      width: 110,
      valueFormatter: (params: ValueFormatterParams<Order>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right",
    },
    {
      headerName: "Total",
      field: "grandTotal" as keyof Order,
      width: 120,
      valueFormatter: (params: ValueFormatterParams<Order>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right font-medium",
    },
    {
      headerName: "Paid",
      field: "paidTotal" as keyof Order,
      width: 100,
      valueFormatter: (params: ValueFormatterParams<Order>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right",
    },
    {
      headerName: "Due",
      field: "dueAmount" as keyof Order,
      width: 100,
      valueFormatter: (params: ValueFormatterParams<Order>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right",
    },
    {
      headerName: "Created",
      field: "createdAt" as keyof Order,
      width: 180,
      valueFormatter: (params: ValueFormatterParams<Order>) =>
        params.value ? new Date(String(params.value)).toLocaleString() : "",
    },
    {
      headerName: "Actions",
      field: "id" as keyof Order,
      width: 100,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: ActionsCell,
    },
  ];
}
