import { useCallback, useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/api/ordersApi";
import { getOrderColumnDefs } from "./column-def";
import { OrderViewModal } from "./OrderViewModal";

export function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useOrders({
    search: searchQuery || undefined,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const orders = data?.data?.items || [];

  // View modal state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const openView = useCallback((order: Order) => {
    setSelectedOrderId(order.id);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setSelectedOrderId(null);
  }, []);

  const columnDefs = useMemo(() => getOrderColumnDefs(openView), [openView]);

  return (
    <div className="h-full flex flex-col p-6">
      <header className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Orders</h1>
          <p className="text-sm text-gray-600">
            View and manage recent orders.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search orders..."
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
            title="Refresh orders"
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
        </div>
      </header>

      <div
        className={`flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col transition-opacity ${
          isRefreshing ? "opacity-50" : "opacity-100"
        }`}
      >
        {error ? (
          <div className="flex flex-1 items-center justify-center text-red-500 text-sm">
            Error loading orders. Please try again.
          </div>
        ) : (
          <DataGrid<Order>
            rowData={orders}
            columnDefs={columnDefs}
            loading={isLoading || isRefreshing}
            noRowsMessage={"No orders yet."}
            height="100%"
          />
        )}
      </div>

      {/* View Modal */}
      <OrderViewModal
        isOpen={isViewOpen}
        orderId={selectedOrderId}
        onClose={closeView}
      />
    </div>
  );
}

export default OrdersPage;
