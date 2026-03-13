import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { showToast } from "@/lib/toast";
import type { Supplier } from "@/api/suppliersApi";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
}

export function SupplierFormModal({
  isOpen,
  onClose,
  supplier,
}: SupplierFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryLeadTimeDays, setDeliveryLeadTimeDays] = useState<string>("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  useEffect(() => {
    if (!isOpen) return;
    setName(supplier?.name ?? "");
    setEmail(supplier?.email ?? "");
    setPhone(supplier?.phone ?? "");
    setAddress(supplier?.address ?? "");
    setDeliveryLeadTimeDays(
      typeof supplier?.deliveryLeadTimeDays === "number"
        ? String(supplier.deliveryLeadTimeDays)
        : "",
    );
    setTags(
      supplier?.tags?.length
        ? supplier.tags.map((t) => t.label).join(", ")
        : "",
    );
    setNotes(supplier?.notes ?? "");
    setIsActive(supplier?.isActive ?? true);
    setErrors({});
  }, [isOpen, supplier]);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrors({ name: "Supplier name is required" });
      return;
    }

    const parsedLeadTime =
      deliveryLeadTimeDays.trim() === ""
        ? undefined
        : Number(deliveryLeadTimeDays);
    if (
      parsedLeadTime !== undefined &&
      (!Number.isFinite(parsedLeadTime) || parsedLeadTime < 0)
    ) {
      setErrors({ name: undefined });
      showToast.error("Delivery lead time must be a valid number");
      return;
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      deliveryLeadTimeDays: parsedLeadTime,
      tags: tagList.length ? tagList : undefined,
      notes: notes.trim() || undefined,
      isActive,
    };

    try {
      if (supplier) {
        await updateMutation.mutateAsync({ id: supplier.id, data: payload });
        showToast.success("Supplier updated");
      } else {
        await createMutation.mutateAsync(payload);
        showToast.success("Supplier created");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save supplier", error);
      showToast.error("Failed to save supplier");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? "Edit Supplier" : "Add Supplier"}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-6 pr-4 pt-4 pb-10">
          <section className="flex gap-6">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">
                Supplier Details
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Basic contact information for this supplier.
              </p>
            </div>

            <div className="w-[70%]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Supplier Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  error={errors.name}
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Input
                  label="Phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">
                Delivery & Tags
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Add operational details and labels for easier tracking.
              </p>
            </div>

            <div className="w-[70%] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Typical Delivery (days)"
                  type="number"
                  min={0}
                  value={deliveryLeadTimeDays}
                  onChange={(event) =>
                    setDeliveryLeadTimeDays(event.target.value)
                  }
                  placeholder="Optional"
                />
                <Input
                  label="Tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="closed, under renovation, on vacation"
                />
              </div>

              <label className="inline-flex items-center gap-3 rounded-xl border border-primary-lighter px-4 py-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Supplier is active
              </label>
            </div>
          </section>

          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">Notes</h3>
              <p className="mt-1 text-sm text-gray-600">
                Optional details like payment terms and delivery instructions.
              </p>
            </div>

            <div className="w-[70%]">
              <Textarea
                label="Notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Payment terms, delivery details, and other notes"
              />
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 bg-white sticky pb-1 bottom-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : supplier
                ? "Update Supplier"
                : "Create Supplier"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SupplierFormModal;
