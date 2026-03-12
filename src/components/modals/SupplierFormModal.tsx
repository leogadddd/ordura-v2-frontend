import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
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
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  useEffect(() => {
    if (!isOpen) return;
    setName(supplier?.name ?? "");
    setContactPerson(supplier?.contactPerson ?? "");
    setEmail(supplier?.email ?? "");
    setPhone(supplier?.phone ?? "");
    setAddress(supplier?.address ?? "");
    setNotes(supplier?.notes ?? "");
    setIsActive(supplier?.isActive ?? true);
    setErrors({});
  }, [isOpen, supplier]);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrors({ name: "Supplier name is required" });
      return;
    }

    const payload = {
      name: name.trim(),
      contactPerson: contactPerson.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
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
      maxWidth="max-w-3xl"
    >
      <div className="grid gap-4 pt-4 md:grid-cols-2">
        <Input
          label="Supplier Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <Input
          label="Contact Person"
          value={contactPerson}
          onChange={(event) => setContactPerson(event.target.value)}
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
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-primary-lighter px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400"
            placeholder="Payment terms, delivery details, and other notes"
          />
        </div>
        <label className="md:col-span-2 inline-flex items-center gap-3 rounded-xl border border-primary-lighter px-4 py-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          Supplier is active
        </label>
        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
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
