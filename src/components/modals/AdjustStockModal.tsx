import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAdjustStock } from "@/hooks/useInventory";
import { showToast } from "@/lib/toast";
import type { Location } from "@/api/inventoryApi";
import type { Product } from "@/api/productsApi";

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  locations?: Location[];
  defaultLocationId?: string;
}

export function AdjustStockModal({
  isOpen,
  onClose,
  product,
  locations = [],
  defaultLocationId,
}: AdjustStockModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [locationId, setLocationId] = useState<string | undefined>(
    defaultLocationId,
  );
  const [errors, setErrors] = useState<{ quantity?: string; reason?: string }>(
    {},
  );

  const adjustMutation = useAdjustStock();

  useEffect(() => {
    if (isOpen) {
      setQuantity(0);
      setReason("");
      setErrors({});
      setLocationId(defaultLocationId);
    }
  }, [isOpen, defaultLocationId]);

  const handleSubmit = async () => {
    setErrors({});
    if (!locationId) {
      setErrors({ reason: "Location is required" });
      return;
    }
    if (quantity === 0) {
      setErrors({ quantity: "Quantity cannot be zero" });
      return;
    }
    if (!reason) {
      setErrors({ reason: "Reason is required" });
      return;
    }

    try {
      await adjustMutation.mutateAsync({
        productId: product?.id,
        locationId,
        quantity,
        reason,
      });
      showToast.success("Inventory adjusted");
      onClose();
    } catch (err: any) {
      console.error("Adjust stock failed", err);
      showToast.error("Failed to adjust stock");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock">
      <div className="space-y-4">
        {product && (
          <div>
            <strong>Product:</strong> {product.name}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Location</label>
          <Select
            value={locationId}
            onChange={(e) => setLocationId(String(e.target.value))}
            options={locations.map((l) => ({ label: l.name, value: l.id }))}
            placeholder="Select location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Quantity</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs">{errors.quantity}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Reason</label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          {errors.reason && (
            <p className="text-red-500 text-xs">{errors.reason}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={adjustMutation.isPending}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
