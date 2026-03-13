import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useCreateSupplierContact,
  useDeleteSupplierContact,
  useSupplierContacts,
  useUpdateSupplierContact,
} from "@/hooks/useSuppliers";
import { showToast } from "@/lib/toast";
import type { Supplier, SupplierContact } from "@/api/suppliersApi";

interface SupplierContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
}

export function SupplierContactsModal({
  isOpen,
  onClose,
  supplier,
}: SupplierContactsModalProps) {
  const supplierId = supplier?.id ?? "";
  const contactsQuery = useSupplierContacts(supplierId);

  const createMutation = useCreateSupplierContact();
  const updateMutation = useUpdateSupplierContact();
  const deleteMutation = useDeleteSupplierContact();

  const contacts = useMemo(
    () => contactsQuery.data ?? [],
    [contactsQuery.data],
  );

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const [editing, setEditing] = useState<SupplierContact | undefined>();
  const [toDelete, setToDelete] = useState<SupplierContact | undefined>();

  useEffect(() => {
    if (!isOpen) return;
    contactsQuery.refetch();
    setEditing(undefined);
    setToDelete(undefined);
    setName("");
    setRole("");
    setEmail("");
    setPhone("");
    setNotes("");
    setIsPrimary(false);
  }, [isOpen]);

  useEffect(() => {
    if (!editing) return;
    setName(editing.name ?? "");
    setRole(editing.role ?? "");
    setEmail(editing.email ?? "");
    setPhone(editing.phone ?? "");
    setNotes(editing.notes ?? "");
    setIsPrimary(Boolean(editing.isPrimary));
  }, [editing]);

  const resetForm = () => {
    setEditing(undefined);
    setName("");
    setRole("");
    setEmail("");
    setPhone("");
    setNotes("");
    setIsPrimary(false);
  };

  const handleSave = async () => {
    if (!supplierId) return;
    if (!name.trim()) {
      showToast.error("Contact name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      role: role.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      isPrimary,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          supplierId,
          contactId: editing.id,
          data: payload,
        });
        showToast.success("Contact updated");
      } else {
        await createMutation.mutateAsync({ supplierId, data: payload });
        showToast.success("Contact created");
      }
      resetForm();
      contactsQuery.refetch();
    } catch (error) {
      console.error("Failed to save contact", error);
      showToast.error("Failed to save contact");
    }
  };

  const handleDelete = async () => {
    if (!supplierId || !toDelete) return;
    try {
      await deleteMutation.mutateAsync({ supplierId, contactId: toDelete.id });
      showToast.success("Contact deleted");
      setToDelete(undefined);
      contactsQuery.refetch();
    } catch (error) {
      console.error("Failed to delete contact", error);
      showToast.error("Failed to delete contact");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={supplier ? `Contacts — ${supplier.name}` : "Supplier Contacts"}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4 pt-4">
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Primary</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan={6}>
                      No contacts yet.
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr key={c.id} className="border-t border-gray-200">
                      <td className="p-3">{c.name}</td>
                      <td className="p-3">{c.role ?? "—"}</td>
                      <td className="p-3">{c.email ?? "—"}</td>
                      <td className="p-3">{c.phone ?? "—"}</td>
                      <td className="p-3">{c.isPrimary ? "Yes" : "No"}</td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditing(c)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setToDelete(c)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {editing ? "Edit Contact" : "Add Contact"}
                </p>
                <p className="text-xs text-gray-500">
                  Multiple contacts can belong to one supplier.
                </p>
              </div>
              {editing ? (
                <Button variant="outline" size="sm" onClick={resetForm}>
                  New Contact
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Optional"
              />
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional"
              />
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
              />
              <div className="md:col-span-2">
                <Input
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <label className="md:col-span-2 inline-flex items-center gap-3 rounded-xl border border-primary-lighter px-4 py-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Primary contact
              </label>

              <div className="md:col-span-2 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>
                  Close
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(undefined)}
        onConfirm={handleDelete}
        title="Delete contact"
        description={
          toDelete
            ? `Delete ${toDelete.name}? This action cannot be undone.`
            : "Are you sure you want to delete this contact?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default SupplierContactsModal;
