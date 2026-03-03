import { useCallback, useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ProductFormModal } from "@/components/modals/ProductFormModal";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { showToast } from "@/lib/toast";
import type { Product } from "@/api/productsApi";
import { getProductColumnDefs } from "./column-def";
import { useOptions } from "@/context/OptionsProvider";
import { Page, PageHeader } from "@/components/layout/Page";

export function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const { data, isLoading, error, refetch } = useProducts({
    search: searchQuery || undefined,
    includeDrafts: true,
  });

  const deleteProductMutation = useDeleteProduct();
  const { fulfillmentTypes } = useOptions();
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Refresh when navigation returns to this page
  const location = useLocation();
  useEffect(() => {
    handleRefresh();
  }, [location.pathname, handleRefresh]);

  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteProductMutation.mutateAsync(id);
        showToast.success("Product deleted successfully!");
      } catch (error: any) {
        console.error("Failed to delete product:", error);
        const errorMessage =
          error?.response?.data?.error ||
          error?.message ||
          "Failed to delete product";
        showToast.error(String(errorMessage));
        throw error;
      }
    },
    [deleteProductMutation],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;
    setIsBulkDeleteOpen(true);
  }, [selectedRows.length]);

  const confirmBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        selectedRows.map((product) =>
          deleteProductMutation.mutateAsync(product.id),
        ),
      );
      showToast.success(
        `${selectedRows.length} products deleted successfully!`,
      );
      setSelectedRows([]);
      setIsBulkDeleteOpen(false);
    } catch (error: any) {
      console.error("Failed to delete products:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete products";
      showToast.error(String(errorMessage));
    }
  }, [selectedRows, deleteProductMutation]);

  const handleSelectionChanged = useCallback((selectedRows: Product[]) => {
    setSelectedRows(selectedRows);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(undefined);
  };

  const columnDefs = useMemo(
    () => getProductColumnDefs(handleEdit, handleDelete, fulfillmentTypes),
    [handleEdit, handleDelete, fulfillmentTypes],
  );

  const products = data?.data?.items || [];

  return (
    <Page className="gap-4">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory."
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
              onClick={handleRefresh}
              variant="secondary"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap h-10"
              title="Refresh products"
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
            {selectedRows.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                size="md"
                className="flex items-center gap-2 whitespace-nowrap"
                disabled={deleteProductMutation.isPending}
              >
                <TrashIcon className="w-4 h-4" />
                Delete Selected ({selectedRows.length})
              </Button>
            )}
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4" />
              Add Product
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
            Error loading products. Please try again.
          </div>
        ) : (
          <DataGrid<Product>
            rowData={products}
            columnDefs={columnDefs}
            loading={isLoading || isRefreshing}
            noRowsMessage={
              'No products found. Click "Add Product" to get started.'
            }
            height="100%"
            rowSelection={{ mode: "multiRow" }}
            onSelectionChanged={handleSelectionChanged}
          />
        )}
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedRows.length} Products`}
        description={`Are you sure you want to delete ${selectedRows.length} selected products? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteProductMutation.isPending}
      />
    </Page>
  );
}

export default ProductsPage;
