import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/lib/toast";
import { useCancelPurchaseOrder } from "@/hooks/usePurchaseOrders";

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

interface PurchaseOrderCancelModalProps {
  isOpen: boolean;
  purchaseOrderId: string | null;
  onClose: () => void;
}

export function PurchaseOrderCancelModal({
  isOpen,
  purchaseOrderId,
  onClose,
}: PurchaseOrderCancelModalProps) {
  const mutation = useCancelPurchaseOrder();
  const [reason, setReason] = useState("");
  const [cancelledAt, setCancelledAt] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    setReason("");
    setCancelledAt(toDatetimeLocal(new Date()));
    setError("");
  }, [isOpen]);

  const handleSave = async () => {
    if (!purchaseOrderId) return;
    if (!reason.trim()) {
      setError("Reason is required");
      return;
    }

    try {
      await mutation.mutateAsync({
        id: purchaseOrderId,
        reason: reason.trim(),
        cancelledAt: cancelledAt
          ? new Date(cancelledAt).toISOString()
          : undefined,
      });
      showToast.success("Cancelled");
      onClose();
    } catch (error) {
      console.error("Failed to cancel", error);
      showToast.error("Failed to cancel");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel" maxWidth="max-w-xl">
      <div className="pt-4 space-y-4">
        <Input
          label="Cancelled At"
          type="datetime-local"
          value={cancelledAt}
          onChange={(e) => setCancelledAt(e.target.value)}
        />
        <Textarea
          label="Reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          error={error}
          rows={4}
          placeholder="Why was this purchase order cancelled?"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleSave}
            isLoading={mutation.isPending}
          >
            Cancel Order
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PurchaseOrderCancelModal;
