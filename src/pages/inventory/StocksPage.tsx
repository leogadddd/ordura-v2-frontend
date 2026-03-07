import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/DataGrid";
import { Button } from "@/components/ui/Button";
import { Page, PageHeader } from "@/components/layout/Page";
import { AdjustStockModal } from "@/components/modals/AdjustStockModal";
import { useStocks } from "@/hooks/useInventory";
import type { Stock } from "@/api/inventoryApi";

export function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stocksData, setStocksData] = useState<Stock[]>([]);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<any>(undefined);
  const [selectedLocationId, setSelectedLocationId] = useState<
    string | undefined
  >(undefined);

  const stocksQuery = useStocks({ search: searchQuery || undefined });

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await stocksQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [stocksQuery]);

  useEffect(() => {
    if (stocksQuery.data) setStocksData(stocksQuery.data);
  }, [stocksQuery.data]);

  const stockColumns: ColDef<Stock>[] = [
    { headerName: "Product", field: "product.name" as any, flex: 1 },
    { headerName: "Location", field: "location.name" as any, flex: 1 },
    { headerName: "Quantity", field: "quantity" as keyof Stock, flex: 0.5 },
    {
      headerName: "Actions",
      field: "actions" as any,
      cellRenderer: (params: any) => (
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
      ),
      width: 100,
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
        defaultLocationId={selectedLocationId}
        onClose={() => {
          setShowAdjustModal(false);
          refresh(); // refresh whether or not adjustment occurred
        }}
      />
    </Page>
  );
}

export default StocksPage;
