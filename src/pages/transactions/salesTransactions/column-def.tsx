import { useEffect, useState } from "react";
import { EllipsisVerticalIcon, EyeIcon } from "@heroicons/react/24/outline";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import type { SalesTransaction } from "@/api/salesTransactionsApi";
import { Popover } from "@/components/ui/Popover";

export type ViewHandler = (txn: SalesTransaction) => void;

export function getSalesTransactionColumnDefs(
  handleView?: ViewHandler
): ColDef<SalesTransaction>[] {
  function ActionsCell(params: ICellRendererParams<SalesTransaction>) {
    const txn = params.data as SalesTransaction | undefined;
    const [_openKey, setOpenKey] = useState<string>("");

    useEffect(() => setOpenKey(""), [txn?.id]);

    if (!txn) return null;

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
                  handleView && handleView(txn);
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
      headerName: "Txn #",
      field: "transactionNumber" as keyof SalesTransaction,
      width: 160,
      pinned: "left",
    },
    {
      headerName: "Status",
      field: "status" as keyof SalesTransaction,
      width: 140,
      cellRenderer: (params: ICellRendererParams<SalesTransaction>) => {
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
      field: "type" as keyof SalesTransaction,
      width: 100,
    },
    {
      headerName: "Customer",
      field: "customerName" as keyof SalesTransaction,
      minWidth: 140,
      flex: 1,
    },
    {
      headerName: "Total",
      field: "grandTotal" as keyof SalesTransaction,
      width: 140,
      valueFormatter: (params: ValueFormatterParams<SalesTransaction>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right font-medium",
    },
    {
      headerName: "Paid",
      field: "paidTotal" as keyof SalesTransaction,
      width: 120,
      valueFormatter: (params: ValueFormatterParams<SalesTransaction>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right",
    },
    {
      headerName: "Due",
      field: "dueAmount" as keyof SalesTransaction,
      width: 120,
      valueFormatter: (params: ValueFormatterParams<SalesTransaction>) =>
        typeof params.value === "number"
          ? `₱${params.value.toFixed(2)}`
          : "₱0.00",
      cellClass: "text-right",
    },
    {
      headerName: "Employee",
      field: "employeeId" as keyof SalesTransaction,
      width: 180,
      valueFormatter: (params: ValueFormatterParams<SalesTransaction>) =>
        params.data?.employee
          ? `${params.data.employee.firstName || params.data.employee.username}`
          : params.value || "-",
    },
    {
      headerName: "Created",
      field: "createdAt" as keyof SalesTransaction,
      width: 180,
      valueFormatter: (params: ValueFormatterParams<SalesTransaction>) =>
        params.value ? new Date(String(params.value)).toLocaleString() : "",
    },
    {
      headerName: "Actions",
      field: "id" as keyof SalesTransaction,
      width: 100,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: ActionsCell,
    },
  ];
}
