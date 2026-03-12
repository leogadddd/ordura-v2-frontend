import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/DataGrid";
import { Button } from "@/components/ui/Button";
import { Page, PageHeader } from "@/components/layout/Page";
import { AdjustStockModal } from "@/components/modals/AdjustStockModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StockFormModal } from "@/components/modals/StockFormModal";
import { useProducts } from "@/hooks/useProducts";
import { useDeleteStock, useLocations, useStocks } from "@/hooks/useInventory";
import { showToast } from "@/lib/toast";
import type { Stock } from "@/api/inventoryApi";

export function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stocksData, setStocksData] = useState<Stock[]>([]);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<
    Stock["product"] | undefined
  >(undefined);
  const [stockToDelete, setStockToDelete] = useState<Stock | undefined>(
    undefined,
  );
  const [selectedLocationId, setSelectedLocationId] = useState<
    string | undefined
  >(undefined);

  const stocksQuery = useStocks({ search: searchQuery || undefined });
  const locationsQuery = useLocations();
  const productsQuery = useProducts({ includeDrafts: true, limit: 500 });
  const deleteStockMutation = useDeleteStock();

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        stocksQuery.refetch(),
        locationsQuery.refetch(),
        productsQuery.refetch(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [locationsQuery, productsQuery, stocksQuery]);

  useEffect(() => {
    if (stocksQuery.data) setStocksData(stocksQuery.data);
  }, [stocksQuery.data]);

  const locations = locationsQuery.data ?? [];
  const products = useMemo(
    () => productsQuery.data?.data?.items ?? [],
    [productsQuery.data],
  );

  const handleDeleteStock = useCallback(async () => {
    if (!stockToDelete) return;

    try {
      await deleteStockMutation.mutateAsync(stockToDelete.id);
      showToast.success("Stock entry deleted");
      setStockToDelete(undefined);
    } catch (error) {
      console.error("Failed to delete stock entry", error);
      showToast.error("Failed to delete stock entry");
    }
  }, [deleteStockMutation, stockToDelete]);

  const stockColumns: ColDef<Stock>[] = [
    { headerName: "Product", field: "product.name" as any, flex: 1 },
    { headerName: "SKU", field: "product.sku" as any, width: 130 },
    { headerName: "Location", field: "location.name" as any, flex: 1 },
    { headerName: "Quantity", field: "quantity" as keyof Stock, flex: 0.5 },
    {
      headerName: "Actions",
      field: "actions" as any,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setAdjustProduct(params.data.product);
              setSelectedLocationId(params.data.location.id);
              setShowAdjustModal(true);
            }}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setStockToDelete(params.data)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: 140,
    },
  ];

  return (
    <Page className="gap-4">
      <PageHeader
        title="Stocks"
        subtitle="View and adjust stock levels."
        actions={
          <>
            <div className="relative w-full sm:w-80 md:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search products..."
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
              title="Refresh inventory"
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
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4" />
              Add stock
            </Button>
          </>
        }
      />

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1">
          <DataGrid<Stock>
            rowData={stocksData}
            columnDefs={stockColumns}
            loading={stocksQuery.isLoading || isRefreshing}
            noRowsMessage="No stocks available."
            height="100%"
            rowSelection={{ mode: "singleRow" }}
          />
        </div>
      </div>

      <AdjustStockModal
        isOpen={showAdjustModal}
        product={adjustProduct}
        locations={locations}
        defaultLocationId={selectedLocationId}
        onClose={() => {
          setShowAdjustModal(false);
          setAdjustProduct(undefined);
          refresh(); // refresh whether or not adjustment occurred
        }}
      />

      <StockFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          refresh();
        }}
        products={products}
        locations={locations}
      />

      <ConfirmDialog
        isOpen={!!stockToDelete}
        onClose={() => setStockToDelete(undefined)}
        onConfirm={handleDeleteStock}
        title="Delete stock entry"
        description={
          stockToDelete
            ? `Delete ${stockToDelete.product.name} at ${stockToDelete.location.name}? This will also remove its adjustment history.`
            : "Are you sure you want to delete this stock entry?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteStockMutation.isPending}
      />
    </Page>
  );
}

export default StocksPage;
