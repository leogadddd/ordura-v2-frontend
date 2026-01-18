import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { getSalesTransaction } from "@/api/salesTransactionsApi";
import type { SalesTransaction } from "@/api/salesTransactionsApi";
import { showToast } from "@/lib/toast";

interface Props {
  isOpen: boolean;
  id: string | null;
  onClose: () => void;
}

export function SalesTransactionViewModal({ isOpen, id, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [txn, setTxn] = useState<SalesTransaction | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isOpen || !id) {
        setTxn(null);
        return;
      }
      setIsLoading(true);
      try {
        const res = await getSalesTransaction(id);
        if (!cancelled && res.status === "success") setTxn(res.data!);
      } catch (err: any) {
        console.error("Failed to load transaction:", err);
        showToast.error("Failed to load transaction");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, id]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={txn ? `Txn #${txn.transactionNumber}` : "Transaction"}
    >
      <div className="h-full overflow-hidden">
        <div className="h-full overflow-auto p-3">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading…</div>
          ) : txn ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="mt-1 font-medium">{txn.status}</div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Type</div>
                  <div className="mt-1 font-medium">{txn.type}</div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Customer</div>
                  <div className="mt-1 font-medium">
                    {txn.customerName || "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Subtotal</div>
                  <div className="font-medium">
                    ₱{(txn.subtotal ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Tax</div>
                  <div className="font-medium">
                    ₱{(txn.taxTotal ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Discount</div>
                  <div className="font-medium">
                    ₱{(txn.discountTotal ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Service Fee</div>
                  <div className="font-medium">
                    ₱{(txn.serviceFee ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Delivery Fee</div>
                  <div className="font-medium">
                    ₱{(txn.deliveryFee ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="font-semibold">
                    ₱{(txn.grandTotal ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Items</h3>
                <div className="overflow-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Price</th>
                        <th className="px-3 py-2 text-right">Discount</th>
                        <th className="px-3 py-2 text-right">Tax</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(txn.items || []).map((it) => (
                        <tr key={it.id} className="border-t border-gray-200">
                          <td className="px-3 py-2">{it.lineNo}</td>
                          <td className="px-3 py-2">{it.name}</td>
                          <td className="px-3 py-2 text-right">
                            {it.quantity}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ₱{(it.unitPrice ?? 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ₱{(it.discount ?? 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ₱{(it.taxAmount ?? 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            ₱{(it.lineTotal ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Payments</h3>
                <div className="overflow-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Method</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-left">Received</th>
                        <th className="px-3 py-2 text-left">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(txn.payments || []).map((p) => (
                        <tr key={p.id} className="border-t border-gray-200">
                          <td className="px-3 py-2">{p.method}</td>
                          <td className="px-3 py-2">{p.status}</td>
                          <td className="px-3 py-2 text-right">
                            ₱{(p.amount ?? 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            {new Date(p.receivedAt).toLocaleString()}
                          </td>
                          <td className="px-3 py-2">{p.reference || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              Transaction not found
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default SalesTransactionViewModal;
