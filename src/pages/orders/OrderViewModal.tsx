import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { getOrder } from "@/api/ordersApi";
import type { OrderDetails } from "@/api/ordersApi";
import { showToast } from "@/lib/toast";

interface OrderViewModalProps {
  isOpen: boolean;
  orderId: string | null;
  onClose: () => void;
}

export function OrderViewModal({
  isOpen,
  orderId,
  onClose,
}: OrderViewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isOpen || !orderId) {
        setOrder(null);
        return;
      }
      setIsLoading(true);
      try {
        const res = await getOrder(orderId);
        if (!cancelled && res.status === "success") {
          setOrder(res.data!);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, orderId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Order #${order.orderNumber}` : "Order"}
      maxWidth="max-w-5xl"
    >
      <div className="h-full overflow-hidden">
        <div className="h-full overflow-auto p-3">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">
              Loading order…
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "OPEN"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : order.status === "REFUNDED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Type</div>
                  <div className="mt-1 font-medium">{order.type}</div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Tax / Currency</div>
                  <div className="mt-1 font-medium">
                    {order.taxMode} / {order.currency}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Customer</div>
                  <div className="mt-1 font-medium">
                    {order.customerName || "-"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.customerEmail || order.customerPhone || ""}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Employee</div>
                  <div className="mt-1 font-medium">
                    {order.employee?.firstName ||
                      order.employee?.username ||
                      "-"}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="mt-1 font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                  {order.closedAt && (
                    <div className="text-xs text-gray-500">
                      Closed: {new Date(order.closedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Subtotal</div>
                  <div className="font-medium">
                    ₱{(order.subtotal ?? 0).toFixed(2)}
                  </div>
                </div>
                <div
                  className="p-3 rounded border border-gray-200 text-right cursor-pointer hover:bg-blue-50 transition"
                  onClick={() =>
                    showToast.info(
                      "Order Discount: Click to add/edit (feature in progress)"
                    )
                  }
                  title="Click to add order discount"
                >
                  <div className="text-xs text-gray-500">Order Discount</div>
                  <div className="font-medium">
                    ₱{(order.orderDiscount ?? 0).toFixed(2)}
                  </div>
                </div>
                <div
                  className="p-3 rounded border border-gray-200 text-right cursor-pointer hover:bg-blue-50 transition"
                  onClick={() =>
                    showToast.info(
                      "Service Fee: Click to add/edit (feature in progress)"
                    )
                  }
                  title="Click to add service fee"
                >
                  <div className="text-xs text-gray-500">Service Fee</div>
                  <div className="font-medium">
                    ₱{(order.serviceFee ?? 0).toFixed(2)}
                  </div>
                </div>
                <div
                  className="p-3 rounded border border-gray-200 text-right cursor-pointer hover:bg-blue-50 transition"
                  onClick={() =>
                    showToast.info(
                      "Delivery Fee: Click to add/edit (feature in progress)"
                    )
                  }
                  title="Click to add delivery fee"
                >
                  <div className="text-xs text-gray-500">Delivery Fee</div>
                  <div className="font-medium">
                    ₱{(order.deliveryFee ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Tax</div>
                  <div className="font-medium">
                    ₱{(order.taxTotal ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="font-semibold">
                    ₱{(order.grandTotal ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Paid</div>
                  <div className="font-medium">
                    ₱{(order.paidTotal ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Due</div>
                  <div className="font-medium">
                    ₱{(order.dueAmount ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200 text-right">
                  <div className="text-xs text-gray-500">Change</div>
                  <div className="font-medium">
                    ₱{(order.changeDue ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Items */}
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
                      {order.items.map((it) => (
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

              {/* Payments */}
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
                      {order.payments.map((p) => (
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
              Order not found
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default OrderViewModal;
