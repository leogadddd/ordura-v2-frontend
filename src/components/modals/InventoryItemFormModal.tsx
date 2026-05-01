import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCreateInventoryItem } from "@/hooks/useInventory";
import { showToast } from "@/lib/toast";
import type {
  Location,
  MeasurementUnit,
  InventoryItem,
} from "@/api/inventoryApi";
import type { Supplier } from "@/api/suppliersApi";

interface InventoryItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  suppliers: Supplier[];
}

const UNIT_OPTIONS: Array<{ label: string; value: MeasurementUnit }> = [
  { label: "Piece", value: "PIECE" },
  { label: "ml", value: "ML" },
  { label: "L", value: "L" },
  { label: "oz", value: "OZ" },
  { label: "g", value: "G" },
  { label: "kg", value: "KG" },
];

export function InventoryItemFormModal({
  isOpen,
  onClose,
  locations,
  suppliers,
}: InventoryItemFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [measurementUnit, setMeasurementUnit] =
    useState<MeasurementUnit>("PIECE");
  const [lowThreshold, setLowThreshold] = useState<string>("");
  const [shouldAlert, setShouldAlert] = useState(true);
  const [supplierId, setSupplierId] = useState<string>("");

  const [initialLocationId, setInitialLocationId] = useState<string>("");
  const [initialQuantity, setInitialQuantity] = useState<number>(0);
  const [initialReason, setInitialReason] = useState<string>("Initial stock");

  const [errors, setErrors] = useState<{
    name?: string;
    initialLocationId?: string;
    initialQuantity?: string;
    lowThreshold?: string;
  }>({});

  const createMutation = useCreateInventoryItem();

  useEffect(() => {
    if (!isOpen) return;

    setName("");
    setDescription("");
    setMeasurementUnit("PIECE");
    setLowThreshold("");
    setShouldAlert(true);
    setSupplierId("");

    setInitialLocationId(locations[0]?.id ?? "");
    setInitialQuantity(0);
    setInitialReason("Initial stock");

    setErrors({});
  }, [isOpen, locations]);

  const locationOptions = useMemo(
    () =>
      locations.map((l) => ({
        label: l.name,
        value: l.id,
      })),
    [locations],
  );

  const supplierOptions = useMemo(
    () => [
      { label: "(None)", value: "" },
      ...suppliers.map((s) => ({ label: s.name, value: s.id })),
    ],
    [suppliers],
  );

  const handleSave = async () => {
    const nextErrors: typeof errors = {};

    if (!name.trim()) nextErrors.name = "Name is required";

    const parsedLowThreshold =
      lowThreshold.trim() === "" ? undefined : Number(lowThreshold);
    if (
      parsedLowThreshold !== undefined &&
      (!Number.isFinite(parsedLowThreshold) || parsedLowThreshold < 0)
    ) {
      nextErrors.lowThreshold = "Low threshold must be 0 or greater";
    }

    if (!initialLocationId) {
      nextErrors.initialLocationId = "Location is required";
    }

    if (!Number.isFinite(initialQuantity) || initialQuantity < 0) {
      nextErrors.initialQuantity = "Initial quantity must be 0 or greater";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const payload: Parameters<typeof createMutation.mutateAsync>[0] = {
        name: name.trim(),
        description: description.trim() || undefined,
        measurementUnit,
        lowThreshold: parsedLowThreshold,
        shouldAlert,
        supplierId: supplierId || undefined,
        initialLocationId: initialLocationId || undefined,
        initialQuantity,
        initialReason: initialReason.trim() || undefined,
      };

      const created = (await createMutation.mutateAsync(
        payload,
      )) as any as InventoryItem;
      showToast.success(`Created ${created.name}`);
      onClose();
    } catch (error) {
      console.error("Failed to create inventory item", error);
      showToast.error("Failed to create ingredient");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Ingredient">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-6 pr-4 pt-4 pb-10">
          <section className="flex gap-6">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">
                Item Details
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Basic information and measurement unit for this ingredient.
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

                <Select
                  label="Measurement Unit"
                  value={measurementUnit}
                  onChange={(e) =>
                    setMeasurementUnit(
                      String(e.target.value) as MeasurementUnit,
                    )
                  }
                  options={UNIT_OPTIONS}
                  placeholder="Select unit"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">
                Supplier & Alerts
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Track who you buy from and configure low ingredient alerts.
              </p>
            </div>

            <div className="w-[70%] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Supplier (optional)"
                  value={supplierId}
                  onChange={(e) => setSupplierId(String(e.target.value))}
                  options={supplierOptions}
                  placeholder="Select supplier"
                />

                <Input
                  label="Low Threshold"
                  type="number"
                  min={0}
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(e.target.value)}
                  placeholder="Optional"
                  error={errors.lowThreshold}
                />
              </div>

              <label className="inline-flex items-center gap-3 rounded-xl border border-primary-lighter px-4 py-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={shouldAlert}
                  onChange={(e) => setShouldAlert(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Enable low stock alerts
              </label>
            </div>
          </section>

          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <h3 className="text-lg font-semibold text-primary">
                Initial Quantity
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Create the first quantity adjustment for this ingredient.
              </p>
            </div>

            <div className="w-[70%]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Initial Location"
                  value={initialLocationId}
                  onChange={(e) => setInitialLocationId(String(e.target.value))}
                  options={locationOptions}
                  placeholder="Select location"
                  error={errors.initialLocationId}
                />

                <Input
                  label="Initial Quantity"
                  type="number"
                  min={0}
                  value={initialQuantity}
                  onChange={(e) =>
                    setInitialQuantity(parseInt(e.target.value, 10) || 0)
                  }
                  error={errors.initialQuantity}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Reason"
                    value={initialReason}
                    onChange={(e) => setInitialReason(e.target.value)}
                    placeholder="Optional note for the initial stock"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 bg-white sticky pb-1 bottom-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default InventoryItemFormModal;
