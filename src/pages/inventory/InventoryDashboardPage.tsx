import { useCallback, useMemo, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Card, Page, PageHeader } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { useInventorySummary } from "@/hooks/useInventory";

type AlertSeverity = "info" | "warning" | "critical";

interface InventoryAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getAlertClasses(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return "border-red-200 bg-red-50 text-red-700";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    default:
      return "border-gray-200 bg-white text-gray-700";
  }
}

export function InventoryDashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const summaryQuery = useInventorySummary();

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await summaryQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [summaryQuery]);

  const cards = useMemo(() => {
    const s = summaryQuery.data;
    return [
      { label: "Total Items", value: formatNumber(s?.totalSkus ?? 0) },
      { label: "Locations", value: formatNumber(s?.totalLocations ?? 0) },
      { label: "Stock Units", value: formatNumber(s?.totalStockUnits ?? 0) },
      { label: "Out of Stock", value: formatNumber(s?.outOfStockSkus ?? 0) },
      { label: "Low Stock", value: formatNumber(s?.lowStockSkus ?? 0) },
    ];
  }, [summaryQuery.data]);

  const alerts: InventoryAlert[] = useMemo(
    () => [
      {
        id: "a1",
        title: "Low stock review",
        description:
          "Some items are approaching their low threshold. Review low stock items.",
        severity: "warning",
      },
      {
        id: "a2",
        title: "Out of stock",
        description:
          "Some items currently have zero stock across all locations.",
        severity: "critical",
      },
      {
        id: "a3",
        title: "Inventory check",
        description:
          "Schedule a quick cycle count for high-usage items this week.",
        severity: "info",
      },
    ],
    [],
  );

  const loading = summaryQuery.isLoading || summaryQuery.isFetching;

  return (
    <Page className="gap-6 overflow-y-auto">
      <PageHeader
        title="Inventory"
        subtitle="Overview of stock health and alerts."
        actions={
          <Button
            onClick={refresh}
            variant="secondary"
            size="md"
            className="flex items-center gap-2 whitespace-nowrap h-10"
            title="Refresh inventory dashboard"
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
        }
      />

      {summaryQuery.isError ? (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4 text-red-700 text-sm">
            Failed to load inventory summary.
          </div>
        </Card>
      ) : null}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))
          : cards.map((c) => (
              <Card key={c.label} className="p-4">
                <p className="text-sm text-gray-600">{c.label}</p>
                <p className="text-2xl font-semibold text-gray-900 truncate">
                  {c.value}
                </p>
              </Card>
            ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Alerts</p>
              <p className="text-xs text-gray-500">Dummy data for now</p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`border rounded-xl p-3 ${getAlertClasses(a.severity)}`}
              >
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs mt-1 opacity-90">{a.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-gray-900">Notes</p>
          <p className="text-sm text-gray-600 mt-2">
            Summary cards are backed by the backend API. Alerts are currently
            static and will be wired to real signals later.
          </p>
        </Card>
      </section>
    </Page>
  );
}

export default InventoryDashboardPage;
