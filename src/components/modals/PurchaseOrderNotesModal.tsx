import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/lib/toast";
import {
  useAddPurchaseOrderNote,
  usePurchaseOrder,
} from "@/hooks/usePurchaseOrders";

interface PurchaseOrderNotesModalProps {
  isOpen: boolean;
  purchaseOrderId: string | null;
  onClose: () => void;
}

function displayName(u?: any) {
  if (!u) return "Unknown";
  return u.firstName || u.username || u.email || u.id;
}

export function PurchaseOrderNotesModal({
  isOpen,
  purchaseOrderId,
  onClose,
}: PurchaseOrderNotesModalProps) {
  const id = isOpen && purchaseOrderId ? purchaseOrderId : "";
  const orderQuery = usePurchaseOrder(id);
  const addNote = useAddPurchaseOrderNote();

  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setNote("");
  }, [isOpen]);

  const notes = useMemo(() => orderQuery.data?.notes ?? [], [orderQuery.data]);

  const handleAdd = async () => {
    if (!purchaseOrderId) return;
    if (!note.trim()) {
      showToast.error("Note is required");
      return;
    }

    try {
      await addNote.mutateAsync({ id: purchaseOrderId, note: note.trim() });
      setNote("");
      showToast.success("Note added");
    } catch (error) {
      console.error("Failed to add note", error);
      showToast.error("Failed to add note");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Order Notes"
      maxWidth="max-w-3xl"
    >
      <div className="pt-4 space-y-4">
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <div className="text-sm font-medium text-gray-700">History</div>
          <div className="mt-3 space-y-3 max-h-80 overflow-auto">
            {orderQuery.isLoading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : notes.length === 0 ? (
              <div className="text-sm text-gray-500">No notes yet.</div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs text-gray-500">
                      {displayName(n.createdBy)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                    {n.note}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <Textarea
            label="Add note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Type a note…"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={addNote.isPending}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={addNote.isPending}
            >
              {addNote.isPending ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PurchaseOrderNotesModal;
