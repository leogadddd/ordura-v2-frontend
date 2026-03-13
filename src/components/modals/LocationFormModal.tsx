import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateLocation, useUpdateLocation } from "@/hooks/useInventory";
import { showToast } from "@/lib/toast";
import type { Location } from "@/api/inventoryApi";

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location;
}

export function LocationFormModal({
  isOpen,
  onClose,
  location,
}: LocationFormModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();

  useEffect(() => {
    if (isOpen) {
      setName(location?.name || "");
      setAddress(location?.address || "");
      setErrors({});
    }
  }, [isOpen, location]);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }
    try {
      if (location) {
        await updateMutation.mutateAsync({
          id: location.id,
          data: { name, address },
        });
        showToast.success("Location updated");
      } else {
        await createMutation.mutateAsync({ name, address });
        showToast.success("Location created");
      }
      onClose();
    } catch (err: any) {
      console.error("Failed to save location", err);
      showToast.error("Failed to save location");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={location ? "Edit Location" : "New Location"}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-6 pr-4 pt-4 pb-10">
          <section className="flex gap-6">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">
                Location Details
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Set the name and address for this location.
              </p>
            </div>

            <div className="w-[70%]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 bg-white sticky pb-1 bottom-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
