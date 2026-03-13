import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/lib/toast";
import { useMarkPurchaseOrderDelivered } from "@/hooks/usePurchaseOrders";

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

interface PurchaseOrderMarkDeliveredModalProps {
  isOpen: boolean;
  purchaseOrderId: string | null;
  onClose: () => void;
}

export function PurchaseOrderMarkDeliveredModal({
  isOpen,
  purchaseOrderId,
  onClose,
}: PurchaseOrderMarkDeliveredModalProps) {
  const mutation = useMarkPurchaseOrderDelivered();
  const [deliveredAt, setDeliveredAt] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    setDeliveredAt(toDatetimeLocal(new Date()));
  }, [isOpen]);

  const handleSave = async () => {
    if (!purchaseOrderId) return;

    try {
      await mutation.mutateAsync({
        id: purchaseOrderId,
        deliveredAt: deliveredAt
          ? new Date(deliveredAt).toISOString()
          : undefined,
      });
      showToast.success("Marked as delivered");
      onClose();
    } catch (error) {
      console.error("Failed to mark delivered", error);
      showToast.error("Failed to mark delivered");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark as Delivered"
      maxWidth="max-w-xl"
    >
      <div className="pt-4 space-y-4">
        <Input
          label="Delivered At"
          type="datetime-local"
          value={deliveredAt}
          onChange={(e) => setDeliveredAt(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={mutation.isPending}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PurchaseOrderMarkDeliveredModal;
