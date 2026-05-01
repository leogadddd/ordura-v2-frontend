import { useEffect, useMemo, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/lib/toast";
import { customerFormSchema, type CustomerFormData } from "@/pages/customers/schema";
import { getCustomer } from "@/api/customersApi";
import { formatApiError, extractValidationErrors } from "@/lib/apiError";

const GENDER_OPTIONS = [
  { value: "", label: "(none)" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const SEVERITY_OPTIONS = [
  { value: "UNKNOWN", label: "Unknown" },
  { value: "MILD", label: "Mild" },
  { value: "MODERATE", label: "Moderate" },
  { value: "SEVERE", label: "Severe" },
];

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  onSave: (data: any) => Promise<void> | void;
}

export function CustomerFormModal({
  isOpen,
  onClose,
  customerId,
  onSave,
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    isActive: true,
    displayName: "",
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    gender: undefined,
    dateOfBirth: "",
    occupation: "",
    company: "",
    email: "",
    phone: "",
    alternatePhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    notes: "",
    tagsText: "",
    emergencyContacts: [],
    foodAllergies: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});

    if (!customerId) {
      setFormData((prev) => ({
        ...prev,
        isActive: true,
        displayName: "",
        firstName: "",
        lastName: "",
        middleName: "",
        suffix: "",
        gender: undefined,
        dateOfBirth: "",
        occupation: "",
        company: "",
        email: "",
        phone: "",
        alternatePhone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        notes: "",
        tagsText: "",
        emergencyContacts: [],
        foodAllergies: [],
      }));
      return;
    }

    setIsLoading(true);
    getCustomer(customerId)
      .then((res) => {
        const c = res?.data?.customer as any;
        const tagsText = Array.isArray(c?.tags) ? c.tags.map((t: any) => t.label).join(", ") : "";
        setFormData({
          isActive: c?.isActive ?? true,
          displayName: c?.displayName ?? "",
          firstName: c?.firstName ?? "",
          lastName: c?.lastName ?? "",
          middleName: c?.middleName ?? "",
          suffix: c?.suffix ?? "",
          gender: c?.gender ?? undefined,
          dateOfBirth: c?.dateOfBirth ? String(c.dateOfBirth).slice(0, 10) : "",
          occupation: c?.occupation ?? "",
          company: c?.company ?? "",
          email: c?.email ?? "",
          phone: c?.phone ?? "",
          alternatePhone: c?.alternatePhone ?? "",
          addressLine1: c?.addressLine1 ?? "",
          addressLine2: c?.addressLine2 ?? "",
          city: c?.city ?? "",
          state: c?.state ?? "",
          postalCode: c?.postalCode ?? "",
          country: c?.country ?? "",
          notes: c?.notes ?? "",
          tagsText,
          emergencyContacts: (c?.emergencyContacts ?? []).map((ec: any) => ({
            name: ec.name ?? "",
            relationship: ec.relationship ?? "",
            phone: ec.phone ?? "",
            email: ec.email ?? "",
            isPrimary: Boolean(ec.isPrimary),
          })),
          foodAllergies: (c?.foodAllergies ?? []).map((fa: any) => ({
            allergen: fa.allergen ?? "",
            severity: fa.severity ?? "UNKNOWN",
            reaction: fa.reaction ?? "",
            notes: fa.notes ?? "",
            isActive: fa.isActive ?? true,
          })),
        });
      })
      .catch((err) => {
        console.error("Failed to load customer:", err);
        showToast.error("Failed to load customer");
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, customerId]);

  const validate = (): boolean => {
    try {
      customerFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err: any) {
      const v: Record<string, string> = {};
      err.errors?.forEach((e: any) => {
        v[e.path[0]] = e.message;
      });
      setErrors(v);
      return false;
    }
  };

  const payload = useMemo(() => {
    const tags = (formData.tagsText || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      isActive: formData.isActive,
      displayName: formData.displayName,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      middleName: formData.middleName || undefined,
      suffix: formData.suffix || undefined,
      gender: formData.gender || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      occupation: formData.occupation || undefined,
      company: formData.company || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      alternatePhone: formData.alternatePhone || undefined,
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      postalCode: formData.postalCode || undefined,
      country: formData.country || undefined,
      notes: formData.notes || undefined,
      tags,
      emergencyContacts: (formData.emergencyContacts || []).filter((c) => c.name),
      foodAllergies: (formData.foodAllergies || []).filter((a) => a.allergen),
    };
  }, [formData]);

  const handleChange = (field: keyof CustomerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field as string];
        return n;
      });
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      const msg = formatApiError(err);
      const validation = extractValidationErrors(err);
      if (validation) setErrors(validation);
      else setErrors({ submit: msg });
      showToast.error(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const title = customerId ? "Edit Customer" : "Add Customer";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<PlusIcon className="w-6 h-6" />}
      maxWidth="max-w-5xl"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-6 pr-2 pt-4 pb-6">
          {isLoading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : (
            <>
              {errors.submit && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {errors.submit}
                </div>
              )}

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  value={formData.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  error={errors.displayName}
                  placeholder="e.g. Juan Dela Cruz"
                />
                <Input
                  label="Email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={errors.email}
                  placeholder="name@example.com"
                />
                <Input
                  label="Phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder=""
                />
                <Input
                  label="Alternate Phone"
                  value={formData.alternatePhone || ""}
                  onChange={(e) => handleChange("alternatePhone", e.target.value)}
                  placeholder=""
                />
                <Select
                  label="Gender"
                  value={formData.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value || undefined)}
                  options={GENDER_OPTIONS}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
                <Input
                  label="First Name"
                  value={formData.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
                <Input
                  label="Last Name"
                  value={formData.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Address Line 1"
                  value={formData.addressLine1 || ""}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                />
                <Input
                  label="Address Line 2"
                  value={formData.addressLine2 || ""}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                />
                <Input
                  label="City"
                  value={formData.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
                <Input
                  label="State"
                  value={formData.state || ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                />
                <Input
                  label="Postal Code"
                  value={formData.postalCode || ""}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                />
                <Input
                  label="Country"
                  value={formData.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tags (comma separated)"
                  value={formData.tagsText || ""}
                  onChange={(e) => handleChange("tagsText", e.target.value)}
                  placeholder="VIP, Frequent, Allergy"
                />
                <Input
                  label="Notes"
                  value={formData.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder=""
                />
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">Emergency Contacts</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContacts: [
                          ...(prev.emergencyContacts || []),
                          { name: "", relationship: "", phone: "", email: "", isPrimary: false },
                        ],
                      }))
                    }
                  >
                    Add
                  </Button>
                </div>

                {(formData.emergencyContacts || []).length === 0 ? (
                  <div className="text-sm text-gray-600">No emergency contacts.</div>
                ) : (
                  <div className="space-y-3">
                    {(formData.emergencyContacts || []).map((c, idx) => (
                      <div key={idx} className="border rounded-xl p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Name"
                          value={c.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const next = [...(prev.emergencyContacts || [])];
                              next[idx] = { ...next[idx], name: val };
                              return { ...prev, emergencyContacts: next };
                            });
                          }}
                        />
                        <Input
                          label="Relationship"
                          value={c.relationship || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const next = [...(prev.emergencyContacts || [])];
                              next[idx] = { ...next[idx], relationship: val };
                              return { ...prev, emergencyContacts: next };
                            });
                          }}
                        />
                        <Input
                          label="Phone"
                          value={c.phone || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const next = [...(prev.emergencyContacts || [])];
                              next[idx] = { ...next[idx], phone: val };
                              return { ...prev, emergencyContacts: next };
                            });
                          }}
                        />
                        <Input
                          label="Email"
                          value={c.email || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const next = [...(prev.emergencyContacts || [])];
                              next[idx] = { ...next[idx], email: val };
                              return { ...prev, emergencyContacts: next };
                            });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(c.isPrimary)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => {
                                const next = [...(prev.emergencyContacts || [])];
                                next[idx] = { ...next[idx], isPrimary: checked };
                                return { ...prev, emergencyContacts: next };
                              });
                            }}
                          />
                          <span className="text-sm text-gray-700">Primary</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setFormData((prev) => {
                                const next = [...(prev.emergencyContacts || [])];
                                next.splice(idx, 1);
                                return { ...prev, emergencyContacts: next };
                              });
                            }}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">Food Allergies</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        foodAllergies: [
                          ...(prev.foodAllergies || []),
                          { allergen: "", severity: "UNKNOWN", reaction: "", notes: "", isActive: true },
                        ],
                      }))
                    }
                  >
                    Add
                  </Button>
                </div>

                {(formData.foodAllergies || []).length === 0 ? (
                  <div className="text-sm text-gray-600">No food allergies.</div>
                ) : (
                  <div className="space-y-3">
                    {(formData.foodAllergies || []).map((a: any, idx: number) => (
                      <div key={idx} className="border rounded-xl p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Allergen"
                          value={a.allergen}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const next = [...(prev.foodAllergies || [])];
                              next[idx] = { ...next[idx], allergen: val };
                              return { ...prev, foodAllergies: next };
                            });
                          }}
                        />
                        <Select
                          label="Severity"
                          value={a.severity || "UNKNOWN"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const next = [...(prev.foodAllergies || [])];
                              next[idx] = { ...next[idx], severity: val };
                              return { ...prev, foodAllergies: next };
                            });
                          }}
                          options={SEVERITY_OPTIONS}
                        />
                        <Input
                          label="Reaction"
                          value={a.reaction || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const next = [...(prev.foodAllergies || [])];
                              next[idx] = { ...next[idx], reaction: val };
                              return { ...prev, foodAllergies: next };
                            });
                          }}
                        />
                        <Input
                          label="Notes"
                          value={a.notes || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const next = [...(prev.foodAllergies || [])];
                              next[idx] = { ...next[idx], notes: val };
                              return { ...prev, foodAllergies: next };
                            });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={a.isActive !== false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => {
                                const next = [...(prev.foodAllergies || [])];
                                next[idx] = { ...next[idx], isActive: checked };
                                return { ...prev, foodAllergies: next };
                              });
                            }}
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setFormData((prev) => {
                                const next = [...(prev.foodAllergies || [])];
                                next.splice(idx, 1);
                                return { ...prev, foodAllergies: next };
                              });
                            }}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CustomerFormModal;
