import { useCallback, useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { getSalesTransactionColumnDefs } from "./column-def";
import { useSalesTransactions } from "@/hooks/useSalesTransactions";
import type { SalesTransaction } from "@/api/salesTransactionsApi";
import SalesTransactionViewModal from "./SalesTransactionViewModal";
import { Page, PageHeader } from "@/components/layout/Page";

export function SalesTransactionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useSalesTransactions({
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

  const location = useLocation();
  useEffect(() => {
    handleRefresh();
  }, [location.pathname, handleRefresh]);

  const txns = data?.data?.items || [];

  // View modal
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

  const openView = useCallback((txn: SalesTransaction) => {
    setSelectedTxnId(txn.id);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setSelectedTxnId(null);
  }, []);

  const columnDefs = useMemo(
    () => getSalesTransactionColumnDefs(openView),
    [openView],
  );

  return (
    <Page className="gap-4">
      <PageHeader
        title="Sales Transactions"
        subtitle="View and manage sales transactions."
        actions={
          <>
            <div className="relative w-full sm:w-80 md:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search transactions..."
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
              title="Refresh transactions"
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

      <div
        className={`flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col transition-opacity ${
          isRefreshing ? "opacity-50" : "opacity-100"
        }`}
      >
        {error ? (
          <div className="flex flex-1 items-center justify-center text-red-500 text-sm">
            Error loading transactions. Please try again.
          </div>
        ) : (
          <DataGrid<SalesTransaction>
            rowData={txns}
            columnDefs={columnDefs}
            loading={isLoading || isRefreshing}
            noRowsMessage={"No sales transactions yet."}
            height="100%"
          />
        )}
      </div>

      <SalesTransactionViewModal
        isOpen={isViewOpen}
        id={selectedTxnId}
        onClose={closeView}
      />
    </Page>
  );
}

export default SalesTransactionPage;
