import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAdjustInventoryLevel } from "@/hooks/useInventory";
import { showToast } from "@/lib/toast";
import type { InventoryItem, Location } from "@/api/inventoryApi";

interface AdjustInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem;
  locations?: Location[];
  defaultLocationId?: string;
}

export function AdjustInventoryItemModal({
  isOpen,
  onClose,
  item,
  locations = [],
  defaultLocationId,
}: AdjustInventoryItemModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [locationId, setLocationId] = useState<string | undefined>(
    defaultLocationId,
  );
  const [errors, setErrors] = useState<{
    quantity?: string;
    reason?: string;
    locationId?: string;
  }>({});

  const adjustMutation = useAdjustInventoryLevel();

  useEffect(() => {
    if (!isOpen) return;
    setQuantity(0);
    setReason("");
    setErrors({});
    setLocationId(defaultLocationId ?? locations[0]?.id);
  }, [isOpen, defaultLocationId, locations]);

  const locationOptions = useMemo(
    () => locations.map((l) => ({ label: l.name, value: l.id })),
    [locations],
  );

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};

    if (!item?.id) {
      nextErrors.locationId = "Item is required";
    }
    if (!locationId) {
      nextErrors.locationId = "Location is required";
    }
    if (quantity === 0) {
      nextErrors.quantity = "Quantity cannot be zero";
    }
    if (!reason.trim()) {
      nextErrors.reason = "Reason is required";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await adjustMutation.mutateAsync({
        inventoryItemId: item!.id,
        locationId: locationId!,
        quantity,
        reason: reason.trim(),
      });
      showToast.success("Inventory adjusted");
      onClose();
    } catch (err: any) {
      console.error("Adjust inventory failed", err);
      showToast.error("Failed to adjust inventory");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock Item">
      <div className="space-y-4">
        {item && (
          <div>
            <strong>Item:</strong> {item.name}
          </div>
        )}

        <Select
          label="Location"
          value={locationId}
          onChange={(e) => setLocationId(String(e.target.value))}
          options={locationOptions}
          placeholder="Select location"
          error={errors.locationId}
        />

        <Input
          label="Quantity Change"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
          error={errors.quantity}
          placeholder="Use negative numbers to subtract"
        />

        <Input
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={errors.reason}
          placeholder="e.g. restock, spoilage, transfer"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={adjustMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={adjustMutation.isPending}>
            {adjustMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default AdjustInventoryItemModal;
