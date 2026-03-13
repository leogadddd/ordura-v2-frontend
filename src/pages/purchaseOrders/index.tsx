import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import type { ColDef } from "ag-grid-community";

import { Page, PageHeader } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { showToast } from "@/lib/toast";
import { useInventoryItems } from "@/hooks/useInventory";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import type { PurchaseOrderListRow } from "@/api/purchaseOrdersApi";
import { PurchaseOrderFormModal } from "@/components/modals/PurchaseOrderFormModal";
import { PurchaseOrderNotesModal } from "@/components/modals/PurchaseOrderNotesModal";
import { PurchaseOrderMarkDeliveredModal } from "@/components/modals/PurchaseOrderMarkDeliveredModal";
import { PurchaseOrderRescheduleModal } from "@/components/modals/PurchaseOrderRescheduleModal";
import { PurchaseOrderCancelModal } from "@/components/modals/PurchaseOrderCancelModal";

function formatStatus(status: PurchaseOrderListRow["status"]) {
  if (status === "ORDERED") return "Ordered";
  if (status === "DELIVERED") return "Delivered";
  if (status === "RESCHEDULED") return "Rescheduled";
  if (status === "CANCELLED") return "Cancelled";
  return status;
}

export function PurchaseOrdersPage() {
  const [rows, setRows] = useState<PurchaseOrderListRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showDelivered, setShowDelivered] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const purchaseOrdersQuery = usePurchaseOrders({ search: searchQuery });
  const suppliersQuery = useSuppliers();
  const inventoryItemsQuery = useInventoryItems();

  useEffect(() => {
    setRows(purchaseOrdersQuery.data ?? []);
  }, [purchaseOrdersQuery.data]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        purchaseOrdersQuery.refetch(),
        suppliersQuery.refetch(),
        inventoryItemsQuery.refetch(),
      ]);
      // showToast.success("Refreshed");
    } catch (error) {
      console.error("Failed to refresh purchase orders", error);
      showToast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  }, [inventoryItemsQuery, purchaseOrdersQuery, suppliersQuery]);

  const columnDefs = useMemo<ColDef<PurchaseOrderListRow>[]>(
    () => [
      {
        headerName: "Supplier",
        field: "supplier.name" as any,
        flex: 1.2,
        valueGetter: (p: any) => p.data?.supplier?.name ?? "—",
      },
      {
        headerName: "Status",
        field: "status" as keyof PurchaseOrderListRow,
        width: 140,
        valueFormatter: (p: any) => formatStatus(p.value),
      },
      {
        headerName: "Ordered",
        field: "orderedAt" as keyof PurchaseOrderListRow,
        width: 180,
        valueFormatter: (p: any) =>
          p.value ? new Date(String(p.value)).toLocaleString() : "",
      },
      {
        headerName: "Expected",
        field: "expectedDeliveryAt" as any,
        width: 180,
        valueFormatter: (p: any) =>
          p.value ? new Date(String(p.value)).toLocaleString() : "—",
      },
      {
        headerName: "Items",
        field: "_count.items" as any,
        width: 110,
        valueGetter: (p: any) => p.data?._count?.items ?? 0,
      },
      {
        headerName: "Notes",
        field: "_count.notes" as any,
        width: 110,
        valueGetter: (p: any) => p.data?._count?.notes ?? 0,
      },
      {
        headerName: "Actions",
        field: "actions" as any,
        width: 380,
        cellRenderer: (params: any) => {
          const row = params.data as PurchaseOrderListRow | undefined;
          if (!row) return null;

          const isCancelled = row.status === "CANCELLED";
          const isDelivered = row.status === "DELIVERED";

          return (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedId(row.id);
                  setShowNotes(true);
                }}
              >
                Notes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={isCancelled || isDelivered}
                onClick={() => {
                  setSelectedId(row.id);
                  setShowDelivered(true);
                }}
              >
                Delivered
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={isCancelled || isDelivered}
                onClick={() => {
                  setSelectedId(row.id);
                  setShowReschedule(true);
                }}
              >
                Reschedule
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isCancelled}
                onClick={() => {
                  setSelectedId(row.id);
                  setShowCancel(true);
                }}
              >
                Cancel
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const suppliers = suppliersQuery.data ?? [];
  const inventoryItems = inventoryItemsQuery.data ?? [];

  return (
    <Page className="gap-4">
      <PageHeader
        title="Purchase Orders"
        subtitle="Track supplier orders, notes, and delivery changes."
        actions={
          <>
            <div className="relative w-full sm:w-80 md:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search purchase orders…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl"
              />
            </div>
            <Button
              onClick={refresh}
              variant="secondary"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap h-10"
              title="Refresh"
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
              onClick={() => setShowCreate(true)}
              variant="primary"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4" />
              Create
            </Button>
          </>
        }
      />

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1">
          <DataGrid<PurchaseOrderListRow>
            rowData={rows}
            columnDefs={columnDefs}
            loading={purchaseOrdersQuery.isLoading || isRefreshing}
            noRowsMessage="No purchase orders found."
            height="100%"
            rowSelection={{ mode: "singleRow" }}
          />
        </div>
      </div>

      <PurchaseOrderFormModal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          refresh();
        }}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
      />

      <PurchaseOrderNotesModal
        isOpen={showNotes}
        purchaseOrderId={selectedId}
        onClose={() => setShowNotes(false)}
      />

      <PurchaseOrderMarkDeliveredModal
        isOpen={showDelivered}
        purchaseOrderId={selectedId}
        onClose={() => {
          setShowDelivered(false);
          refresh();
        }}
      />

      <PurchaseOrderRescheduleModal
        isOpen={showReschedule}
        purchaseOrderId={selectedId}
        onClose={() => {
          setShowReschedule(false);
          refresh();
        }}
      />

      <PurchaseOrderCancelModal
        isOpen={showCancel}
        purchaseOrderId={selectedId}
        onClose={() => {
          setShowCancel(false);
          refresh();
        }}
      />
    </Page>
  );
}

export default PurchaseOrdersPage;
