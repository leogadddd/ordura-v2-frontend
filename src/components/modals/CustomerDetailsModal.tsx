import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getCustomer } from "@/api/customersApi";
import { showToast } from "@/lib/toast";
import { EyeIcon } from "@heroicons/react/24/outline";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
}

function formatMoney(v: any) {
  const n = Number(v ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CustomerDetailsModal({ isOpen, onClose, customerId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !customerId) return;
    setIsLoading(true);
    getCustomer(customerId)
      .then((res) => setData(res?.data))
      .catch((err) => {
        console.error("Failed to load customer details:", err);
        showToast.error("Failed to load customer details");
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, customerId]);

  const customer = data?.customer;
  const analytics = data?.analytics;
  const recentSales = data?.recentSalesTransactions ?? [];

  const title = useMemo(() => {
    if (!customer) return "Customer";
    return `${customer.displayName} (${customer.customerNumber})`;
  }, [customer]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<EyeIcon className="w-6 h-6" />}
      maxWidth="max-w-6xl"
    >
      {isLoading ? (
        <div className="p-4 text-sm text-gray-600">Loading…</div>
      ) : !customer ? (
        <div className="p-4 text-sm text-gray-600">No data.</div>
      ) : (
        <div className="space-y-6 pt-4">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500">Contact</div>
              <div className="mt-2 space-y-1 text-sm">
                <div><span className="text-gray-500">Email:</span> {customer.email || "—"}</div>
                <div><span className="text-gray-500">Phone:</span> {customer.phone || "—"}</div>
                <div><span className="text-gray-500">Alt:</span> {customer.alternatePhone || "—"}</div>
              </div>
            </div>
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500">Personal</div>
              <div className="mt-2 space-y-1 text-sm">
                <div><span className="text-gray-500">Gender:</span> {customer.gender || "—"}</div>
                <div><span className="text-gray-500">DOB:</span> {customer.dateOfBirth ? String(customer.dateOfBirth).slice(0, 10) : "—"}</div>
                <div><span className="text-gray-500">Company:</span> {customer.company || "—"}</div>
                <div><span className="text-gray-500">Occupation:</span> {customer.occupation || "—"}</div>
              </div>
            </div>
          </section>

          <section className="border rounded-xl p-4">
            <div className="text-sm text-gray-500">Address</div>
            <div className="mt-2 text-sm">
              {[customer.addressLine1, customer.addressLine2, customer.city, customer.state, customer.postalCode, customer.country]
                .filter(Boolean)
                .join(", ") || "—"}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500">Metrics</div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Orders</div>
                  <div className="font-semibold">{customer.metrics?.ordersCount ?? 0}</div>
                </div>
                <div>
                  <div className="text-gray-500">Sales Txns</div>
                  <div className="font-semibold">{customer.metrics?.salesTransactionsCount ?? 0}</div>
                </div>
                <div>
                  <div className="text-gray-500">Lifetime Spend</div>
                  <div className="font-semibold">{formatMoney(customer.metrics?.lifetimeSpend ?? 0)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Avg Order</div>
                  <div className="font-semibold">{formatMoney(customer.metrics?.avgOrderValue ?? 0)}</div>
                </div>
              </div>
              {analytics && (
                <div className="mt-4 text-xs text-gray-500">
                  Analytics computed from linked orders/transactions.
                </div>
              )}
            </div>
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500">Tags</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(customer.tags || []).length === 0 ? (
                  <span className="text-sm text-gray-600">—</span>
                ) : (
                  (customer.tags || []).map((t: any) => (
                    <span key={t.id} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {t.label}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500">Emergency Contacts</div>
              <div className="mt-2 space-y-2">
                {(customer.emergencyContacts || []).length === 0 ? (
                  <div className="text-sm text-gray-600">—</div>
                ) : (
                  (customer.emergencyContacts || []).map((c: any) => (
                    <div key={c.id} className="text-sm">
                      <div className="font-medium text-gray-900">
                        {c.name}{c.isPrimary ? " (Primary)" : ""}
                      </div>
                      <div className="text-gray-600">
                        {(c.relationship || "") + (c.phone ? ` • ${c.phone}` : "") + (c.email ? ` • ${c.email}` : "")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500">Food Allergies</div>
              <div className="mt-2 space-y-2">
                {(customer.foodAllergies || []).length === 0 ? (
                  <div className="text-sm text-gray-600">—</div>
                ) : (
                  (customer.foodAllergies || []).map((a: any) => (
                    <div key={a.id} className="text-sm">
                      <div className="font-medium text-gray-900">
                        {a.allergen} <span className="text-xs text-gray-500">({a.severity})</span>
                      </div>
                      <div className="text-gray-600">
                        {(a.reaction || "") + (a.notes ? ` • ${a.notes}` : "")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="border rounded-xl p-4">
            <div className="text-sm text-gray-500">Recent Sales Transactions</div>
            <div className="mt-2">
              {recentSales.length === 0 ? (
                <div className="text-sm text-gray-600">—</div>
              ) : (
                <div className="divide-y">
                  {recentSales.map((t: any) => (
                    <div key={t.id} className="py-2 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{t.transactionNumber}</div>
                        <div className="text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatMoney(t.grandTotal)}</div>
                        <div className="text-gray-500">{t.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default CustomerDetailsModal;
