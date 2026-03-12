import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCreateStock } from "@/hooks/useInventory";
import { showToast } from "@/lib/toast";
import type { Location } from "@/api/inventoryApi";
import type { Product } from "@/api/productsApi";

interface StockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  locations: Location[];
}

export function StockFormModal({
  isOpen,
  onClose,
  products,
  locations,
}: StockFormModalProps) {
  const [productId, setProductId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("Initial stock");
  const [errors, setErrors] = useState<{
    productId?: string;
    locationId?: string;
    quantity?: string;
  }>({});

  const createStockMutation = useCreateStock();

  useEffect(() => {
    if (!isOpen) return;
    setProductId("");
    setLocationId(locations[0]?.id ?? "");
    setQuantity(0);
    setReason("Initial stock");
    setErrors({});
  }, [isOpen, locations]);

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        label: `${product.name} (${product.sku})`,
        value: product.id,
      })),
    [products],
  );

  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    [locations],
  );

  const handleSave = async () => {
    const nextErrors: {
      productId?: string;
      locationId?: string;
      quantity?: string;
    } = {};

    if (!productId) nextErrors.productId = "Product is required";
    if (!locationId) nextErrors.locationId = "Location is required";
    if (quantity < 0) nextErrors.quantity = "Quantity cannot be negative";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await createStockMutation.mutateAsync({
        productId,
        locationId,
        quantity,
        reason: reason.trim() || undefined,
      });
      showToast.success("Stock entry created");
      onClose();
    } catch (error) {
      console.error("Failed to create stock entry", error);
      showToast.error("Failed to create stock entry");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Stock Entry"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 pt-4">
        <Select
          label="Product"
          value={productId}
          onChange={(event) => setProductId(String(event.target.value))}
          options={productOptions}
          placeholder="Select product"
          error={errors.productId}
        />

        <Select
          label="Location"
          value={locationId}
          onChange={(event) => setLocationId(String(event.target.value))}
          options={locationOptions}
          placeholder="Select location"
          error={errors.locationId}
        />

        <Input
          label="Initial Quantity"
          type="number"
          min={0}
          value={quantity}
          onChange={(event) =>
            setQuantity(parseInt(event.target.value, 10) || 0)
          }
          error={errors.quantity}
        />

        <Input
          label="Reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Optional note for the first stock entry"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createStockMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createStockMutation.isPending}>
            {createStockMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default StockFormModal;
