import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/DataGrid";
import { Button } from "@/components/ui/Button";
import { Page, PageHeader } from "@/components/layout/Page";
import { AdjustInventoryItemModal } from "@/components/modals/AdjustInventoryItemModal";
import { InventoryItemFormModal } from "@/components/modals/InventoryItemFormModal";
import { useLocations, useInventoryItems } from "@/hooks/useInventory";
import { useSuppliers } from "@/hooks/useSuppliers";
import type { InventoryItem } from "@/api/inventoryApi";

function formatUnit(unit: InventoryItem["measurementUnit"]) {
  switch (unit) {
    case "ML":
      return "ml";
    case "L":
      return "L";
    case "OZ":
      return "oz";
    case "G":
      return "g";
    case "KG":
      return "kg";
    default:
      return "piece";
  }
}

export function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [itemsData, setItemsData] = useState<InventoryItem[]>([]);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | undefined>();

  const itemsQuery = useInventoryItems({ search: searchQuery || undefined });
  const locationsQuery = useLocations();
  const suppliersQuery = useSuppliers({});

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        itemsQuery.refetch(),
        locationsQuery.refetch(),
        suppliersQuery.refetch(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [itemsQuery, locationsQuery, suppliersQuery]);

  useEffect(() => {
    if (itemsQuery.data) setItemsData(itemsQuery.data);
  }, [itemsQuery.data]);

  const locations = locationsQuery.data ?? [];
  const suppliers = useMemo(
    () => suppliersQuery.data ?? [],
    [suppliersQuery.data],
  );

  const itemColumns: ColDef<InventoryItem>[] = [
    { headerName: "Name", field: "name" as keyof InventoryItem, flex: 1.2 },
    {
      headerName: "Unit",
      field: "measurementUnit" as keyof InventoryItem,
      width: 120,
      valueFormatter: (p: any) => formatUnit(p.value),
    },
    {
      headerName: "Supplier",
      field: "supplier.name" as any,
      flex: 1,
      valueGetter: (p: any) => p.data?.supplier?.name ?? "—",
    },
    {
      headerName: "Total",
      field: "totalQuantity" as any,
      width: 120,
      valueGetter: (p: any) => p.data?.totalQuantity ?? 0,
    },
    {
      headerName: "Low Threshold",
      field: "lowThreshold" as any,
      width: 140,
      valueGetter: (p: any) =>
        typeof p.data?.lowThreshold === "number" ? p.data.lowThreshold : "—",
    },
    {
      headerName: "Alerts",
      field: "alerts" as any,
      width: 140,
      valueGetter: (p: any) => {
        if (!p.data?.shouldAlert) return "Off";
        if (p.data?.isOutOfStock) return "Out of stock";
        if (p.data?.isLowStock) return "Low";
        return "OK";
      },
    },
    {
      headerName: "Actions",
      field: "actions" as any,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setAdjustItem(params.data);
              setShowAdjustModal(true);
            }}
          >
            Adjust
          </Button>
        </div>
      ),
      width: 140,
    },
  ];

  return (
    <Page className="gap-4">
      <PageHeader
        title="Ingredients"
        subtitle="Create and adjust ingredient stock consumed by POS products."
        actions={
          <>
            <div className="relative w-full sm:w-80 md:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search ingredients..."
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
              Add ingredient
            </Button>
          </>
        }
      />

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1">
          <DataGrid<InventoryItem>
            rowData={itemsData}
            columnDefs={itemColumns}
            loading={itemsQuery.isLoading || isRefreshing}
            noRowsMessage="No ingredients available."
            height="100%"
            rowSelection={{ mode: "singleRow" }}
          />
        </div>
      </div>

      <AdjustInventoryItemModal
        isOpen={showAdjustModal}
        item={adjustItem}
        locations={locations}
        onClose={() => {
          setShowAdjustModal(false);
          setAdjustItem(undefined);
          refresh(); // refresh whether or not adjustment occurred
        }}
      />

      <InventoryItemFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          refresh();
        }}
        locations={locations}
        suppliers={suppliers}
      />
    </Page>
  );
}

export default StocksPage;
