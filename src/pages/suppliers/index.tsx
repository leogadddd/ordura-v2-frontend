import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { ColDef } from "ag-grid-community";

import type { Supplier } from "@/api/suppliersApi";
import { SupplierContactsModal } from "@/components/modals/SupplierContactsModal";
import { SupplierFormModal } from "@/components/modals/SupplierFormModal";
import { Page, PageHeader } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataGrid } from "@/components/ui/DataGrid";
import { useDeleteSupplier, useSuppliers } from "@/hooks/useSuppliers";
import { showToast } from "@/lib/toast";

export function SuppliersPage() {
  const [suppliersData, setSuppliersData] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(
    undefined,
  );
  const [supplierToDelete, setSupplierToDelete] = useState<
    Supplier | undefined
  >(undefined);

  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contactsSupplier, setContactsSupplier] = useState<
    Supplier | undefined
  >(undefined);

  const suppliersQuery = useSuppliers({ search: searchQuery });
  const deleteSupplierMutation = useDeleteSupplier();

  useEffect(() => {
    setSuppliersData(suppliersQuery.data ?? []);
  }, [suppliersQuery.data]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await suppliersQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [suppliersQuery]);

  const handleEdit = useCallback((supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierModal(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplierMutation.mutateAsync(supplierToDelete.id);
      showToast.success("Supplier deleted");
      setSupplierToDelete(undefined);
      await refresh();
    } catch (error) {
      console.error("Failed to delete supplier", error);
      showToast.error("Failed to delete supplier");
    }
  }, [deleteSupplierMutation, refresh, supplierToDelete]);

  const columnDefs = useMemo<ColDef<Supplier>[]>(
    () => [
      { headerName: "Supplier", field: "name" as keyof Supplier, flex: 1.2 },
      { headerName: "Email", field: "email" as keyof Supplier, flex: 1.1 },
      { headerName: "Phone", field: "phone" as keyof Supplier, width: 160 },
      {
        headerName: "Delivery (days)",
        field: "deliveryLeadTimeDays" as any,
        width: 150,
        valueGetter: (p: any) =>
          typeof p.data?.deliveryLeadTimeDays === "number"
            ? p.data.deliveryLeadTimeDays
            : "—",
      },
      {
        headerName: "Tags",
        field: "tags" as any,
        flex: 1,
        valueGetter: (p: any) =>
          p.data?.tags?.length
            ? p.data.tags.map((t: any) => t.label).join(", ")
            : "—",
      },
      {
        headerName: "Contacts",
        field: "_count.contacts" as any,
        width: 120,
        valueGetter: (p: any) => p.data?._count?.contacts ?? 0,
      },
      {
        headerName: "Status",
        field: "isActive" as keyof Supplier,
        width: 120,
        valueFormatter: (params: any) => (params.value ? "Active" : "Inactive"),
      },
      {
        headerName: "Actions",
        field: "actions" as any,
        cellRenderer: (params: any) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(params.data)}
              title="Edit supplier"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setContactsSupplier(params.data);
                setShowContactsModal(true);
              }}
              title="Manage contacts"
            >
              Contacts
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setSupplierToDelete(params.data)}
              title="Delete supplier"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        ),
        width: 220,
      },
    ],
    [handleEdit],
  );

  return (
    <Page className="gap-4">
      <PageHeader
        title="Suppliers"
        subtitle="Manage all supplier records in one place."
        actions={
          <>
            <div className="relative w-full sm:w-80 md:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl"
              />
            </div>

            <Button
              onClick={refresh}
              variant="secondary"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap h-10"
              title="Refresh suppliers"
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
              onClick={() => {
                setEditingSupplier(undefined);
                setShowSupplierModal(true);
              }}
              variant="primary"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4" />
              Add Supplier
            </Button>
          </>
        }
      />

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1">
          <DataGrid<Supplier>
            rowData={suppliersData}
            columnDefs={columnDefs}
            loading={suppliersQuery.isLoading || isRefreshing}
            noRowsMessage='No suppliers found. Click "Add Supplier" to get started.'
            height="100%"
            rowSelection={{ mode: "singleRow" }}
          />
        </div>
      </div>

      <SupplierFormModal
        isOpen={showSupplierModal}
        supplier={editingSupplier}
        onClose={() => {
          setShowSupplierModal(false);
          setEditingSupplier(undefined);
          refresh();
        }}
      />

      <SupplierContactsModal
        isOpen={showContactsModal}
        supplier={contactsSupplier}
        onClose={() => {
          setShowContactsModal(false);
          setContactsSupplier(undefined);
          refresh();
        }}
      />

      <ConfirmDialog
        isOpen={!!supplierToDelete}
        onClose={() => setSupplierToDelete(undefined)}
        onConfirm={handleDelete}
        title="Delete supplier"
        description={
          supplierToDelete
            ? `Delete ${supplierToDelete.name}? This action cannot be undone.`
            : "Are you sure you want to delete this supplier?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteSupplierMutation.isPending}
      />
    </Page>
  );
}

export default SuppliersPage;
