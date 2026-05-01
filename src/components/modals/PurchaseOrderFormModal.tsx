import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/lib/toast";
import { useCreatePurchaseOrder } from "@/hooks/usePurchaseOrders";
import type { Supplier } from "@/api/suppliersApi";
import type { InventoryItem } from "@/api/inventoryApi";

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

type LineItem = { inventoryItemId: string; quantity: number };

interface PurchaseOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
}

export function PurchaseOrderFormModal({
  isOpen,
  onClose,
  suppliers,
  inventoryItems,
}: PurchaseOrderFormModalProps) {
  const createMutation = useCreatePurchaseOrder();

  const [supplierId, setSupplierId] = useState<string>("");
  const [orderedAt, setOrderedAt] = useState<string>("");
  const [expectedDeliveryAt, setExpectedDeliveryAt] = useState<string>("");
  const [initialNote, setInitialNote] = useState<string>("");
  const [items, setItems] = useState<LineItem[]>([
    { inventoryItemId: "", quantity: 1 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    setSupplierId(suppliers[0]?.id ?? "");
    setOrderedAt(toDatetimeLocal(new Date()));
    setExpectedDeliveryAt("");
    setInitialNote("");
    setItems([{ inventoryItemId: "", quantity: 1 }]);
    setErrors({});
  }, [isOpen, suppliers]);

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ label: s.name, value: s.id })),
    [suppliers],
  );

  const inventoryOptions = useMemo(
    () =>
      inventoryItems.map((it) => ({
        label: it.name,
        value: it.id,
      })),
    [inventoryItems],
  );

  const setLine = (idx: number, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  };

  const addLine = () => {
    setItems((prev) => [...prev, { inventoryItemId: "", quantity: 1 }]);
  };

  const removeLine = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};

    if (!supplierId) nextErrors.supplierId = "Supplier is required";

    const cleanedItems = items
      .map((row) => ({
        inventoryItemId: row.inventoryItemId,
        quantity: Number(row.quantity),
      }))
      .filter((row) => row.inventoryItemId && row.quantity > 0);

    if (cleanedItems.length === 0) {
      nextErrors.items = "At least one item is required";
    }

    const unique = new Set(cleanedItems.map((x) => x.inventoryItemId));
    if (unique.size !== cleanedItems.length) {
      nextErrors.items = "Duplicate items are not allowed";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await createMutation.mutateAsync({
        supplierId,
        orderedAt: orderedAt ? new Date(orderedAt).toISOString() : undefined,
        expectedDeliveryAt: expectedDeliveryAt
          ? new Date(expectedDeliveryAt).toISOString()
          : undefined,
        initialNote: initialNote.trim() || undefined,
        items: cleanedItems,
      });
      showToast.success("Purchase order created");
      onClose();
    } catch (error) {
      console.error("Failed to create purchase order", error);
      showToast.error("Failed to create purchase order");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Purchase Order">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-6 pr-4 pt-4 pb-10">
          <section className="flex gap-6">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">
                Order Details
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Choose the supplier, set dates, and add an optional note.
              </p>
            </div>

            <div className="w-[70%]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Supplier"
                  value={supplierId}
                  onChange={(e) => setSupplierId(String(e.target.value))}
                  options={supplierOptions}
                  placeholder="Select supplier"
                  error={errors.supplierId}
                />

                <Input
                  label="Ordered At"
                  type="datetime-local"
                  value={orderedAt}
                  onChange={(e) => setOrderedAt(e.target.value)}
                />

                <Input
                  label="Expected Delivery (optional)"
                  type="datetime-local"
                  value={expectedDeliveryAt}
                  onChange={(e) => setExpectedDeliveryAt(e.target.value)}
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="Initial Note (optional)"
                    value={initialNote}
                    onChange={(e) => setInitialNote(e.target.value)}
                    placeholder="Optional"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">Items</h3>
              <p className="mt-1 text-sm text-gray-600">
                Add one or more ingredients and quantities.
              </p>
            </div>

            <div className="w-[70%]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                  Line Items
                </div>
                <Button variant="secondary" size="sm" onClick={addLine}>
                  Add Item
                </Button>
              </div>

              {errors.items && (
                <div className="mt-2 text-sm text-red-600">{errors.items}</div>
              )}

              <div className="mt-3 grid gap-3">
                {items.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid gap-3 md:grid-cols-[1fr_140px_120px]"
                  >
                    <Select
                      label={idx === 0 ? "Ingredient" : undefined}
                      value={row.inventoryItemId}
                      onChange={(e) =>
                        setLine(idx, {
                          inventoryItemId: String(e.target.value),
                        })
                      }
                      options={inventoryOptions}
                      placeholder="Select item"
                    />
                    <Input
                      label={idx === 0 ? "Quantity" : undefined}
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) =>
                        setLine(idx, {
                          quantity: parseInt(e.target.value, 10) || 0,
                        })
                      }
                    />

                    <div className={idx === 0 ? "pt-7" : ""}>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeLine(idx)}
                        disabled={items.length <= 1}
                        className="w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 bg-white sticky pb-1 bottom-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PurchaseOrderFormModal;
