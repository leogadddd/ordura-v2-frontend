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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={location ? "Edit Location" : "New Location"}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
