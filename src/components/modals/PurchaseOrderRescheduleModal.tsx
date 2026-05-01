import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/lib/toast";
import { useReschedulePurchaseOrder } from "@/hooks/usePurchaseOrders";

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

interface PurchaseOrderRescheduleModalProps {
  isOpen: boolean;
  purchaseOrderId: string | null;
  onClose: () => void;
}

export function PurchaseOrderRescheduleModal({
  isOpen,
  purchaseOrderId,
  onClose,
}: PurchaseOrderRescheduleModalProps) {
  const mutation = useReschedulePurchaseOrder();
  const [expectedDeliveryAt, setExpectedDeliveryAt] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    setExpectedDeliveryAt(toDatetimeLocal(new Date()));
    setError("");
  }, [isOpen]);

  const handleSave = async () => {
    if (!purchaseOrderId) return;
    if (!expectedDeliveryAt) {
      setError("Expected delivery time is required");
      return;
    }

    try {
      await mutation.mutateAsync({
        id: purchaseOrderId,
        expectedDeliveryAt: new Date(expectedDeliveryAt).toISOString(),
      });
      showToast.success("Rescheduled");
      onClose();
    } catch (error) {
      console.error("Failed to reschedule", error);
      showToast.error("Failed to reschedule");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule"
      maxWidth="max-w-xl"
    >
      <div className="pt-4 space-y-4">
        <Input
          label="Expected Delivery"
          type="datetime-local"
          value={expectedDeliveryAt}
          onChange={(e) => {
            setExpectedDeliveryAt(e.target.value);
            setError("");
          }}
          error={error}
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PurchaseOrderRescheduleModal;
