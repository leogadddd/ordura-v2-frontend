import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { Page, PageHeader } from "@/components/layout/Page";
import { showToast } from "@/lib/toast";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "@/api/customersApi";
import CustomerFormModal from "@/components/modals/CustomerFormModal";
import CustomerDetailsModal from "@/components/modals/CustomerDetailsModal";
import { getCustomerColumnDefs } from "./column-def";

export type CustomerRow = {
  id: string;
  customerNumber: string;
  isActive: boolean;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  createdAt?: string;
  metrics?: {
    ordersCount?: number;
    lifetimeSpend?: number;
  } | null;
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getCustomers({
        page: 1,
        limit: 50,
        search: searchQuery || undefined,
      });
      setCustomers((res?.data?.items ?? []) as any);
    } finally {
      setIsRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const location = useLocation();
  useEffect(() => {
    handleRefresh();
  }, [location.pathname, handleRefresh]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | undefined>();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsCustomerId, setDetailsCustomerId] = useState<string | undefined>();

  const handleView = useCallback((customer: CustomerRow) => {
    setDetailsCustomerId(customer.id);
    setIsDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((customer: CustomerRow) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  }, []);

  const handleDeactivate = useCallback(async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)));
      showToast.success("Customer deactivated");
    } catch (err: any) {
      console.error("Failed to deactivate customer:", err);
      showToast.error(err?.message || "Failed to deactivate customer");
    }
  }, []);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCustomer(undefined);
  };

  const handleSaveCustomer = useCallback(
    async (data: any) => {
      try {
        if (selectedCustomer) {
          const res = await updateCustomer(selectedCustomer.id, data);
          const updated = res?.data?.customer;
          if (updated) {
            setCustomers((prev) => prev.map((c) => (c.id === updated.id ? ({ ...c, ...updated } as any) : c)));
            showToast.success("Customer updated");
          }
        } else {
          const res = await createCustomer(data);
          const created = res?.data?.customer;
          if (created) {
            setCustomers((prev) => [created as any, ...prev]);
            showToast.success("Customer created");
          }
        }
        setIsFormOpen(false);
        setSelectedCustomer(undefined);
      } catch (err: any) {
        console.error("Save customer failed:", err);
        showToast.error(err?.message || "Failed to save customer");
        throw err;
      }
    },
    [selectedCustomer],
  );

  const columnDefs = useMemo(
    () => getCustomerColumnDefs(handleView, handleEdit, handleDeactivate),
    [handleView, handleEdit, handleDeactivate],
  );

  return (
    <Page className="gap-4">
      <PageHeader
        title="Customers"
        subtitle="Manage customer profiles and customer information."
        actions={
          <>
            <div className="relative w-full sm:w-80 md:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl"
              />
            </div>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="md"
              className="whitespace-nowrap h-10"
              disabled={isRefreshing}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setIsFormOpen(true)}
              variant="primary"
              size="md"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4" /> Add Customer
            </Button>
          </>
        }
      />

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <DataGrid<CustomerRow>
          rowData={customers}
          columnDefs={columnDefs}
          loading={false}
          noRowsMessage={'No customers yet. Click "Add Customer" to create one.'}
          height="100%"
        />
      </div>

      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        customerId={selectedCustomer?.id}
        onSave={handleSaveCustomer}
      />

      <CustomerDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        customerId={detailsCustomerId}
      />
    </Page>
  );
}

export default CustomersPage;
