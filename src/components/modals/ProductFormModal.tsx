import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tooltip } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";
import { productFormSchema } from "@/routes/products/schema";
import { InformationCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { showToast } from "@/lib/toast";
import type { Product } from "@/api/productsApi";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    cost: "",
    sellingPrice: "",
    notes: "",
  });

  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "OUT_OF_STOCK">(
    "ACTIVE"
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: product?.name || "",
        category: product?.category || "",
        description: product?.description || "",
        cost: product?.cost?.toString() || "",
        sellingPrice: product?.sellingPrice?.toString() || "",
        notes: product?.notes || "",
      });
      setStatus(product?.status || "ACTIVE");
      setErrors({});
    }
  }, [isOpen, product]);

  const cost = parseFloat(formData.cost) || 0;
  const sellingPrice = parseFloat(formData.sellingPrice) || 0;
  const profit = sellingPrice - cost;
  const profitMargin = cost > 0 ? ((profit / cost) * 100).toFixed(2) : "0.00";

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      productFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        validationErrors[err.path[0]] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  // Check if form is valid without showing errors
  const isFormValid = (): boolean => {
    try {
      productFormSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        cost: parseFloat(formData.cost),
        sellingPrice: parseFloat(formData.sellingPrice),
        status: status,
        isDraft: false,
      };

      console.log("Saving product:", productData);

      if (product) {
        // Update existing product
        const result = await updateProductMutation.mutateAsync({
          id: product.id,
          data: productData,
        });
        console.log("Update result:", result);
        showToast.success("Product updated successfully!");
      } else {
        // Create new product
        const result = await createProductMutation.mutateAsync(productData);
        console.log("Create result:", result);
        showToast.success("Product created successfully!");
      }

      onClose();
    } catch (error: any) {
      console.error("Failed to save product:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save product";
      setErrors({ submit: String(errorMessage) });
      showToast.error(String(errorMessage));
    }
  };

  const handleDraft = async () => {
    if (!formData.name || !formData.category) {
      setErrors({
        submit: "Product name and category are required for drafts",
      });
      showToast.warning("Product name and category are required for drafts");
      return;
    }

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        cost: parseFloat(formData.cost) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        status: status,
        isDraft: true,
      };

      if (product) {
        await updateProductMutation.mutateAsync({
          id: product.id,
          data: productData,
        });
        showToast.success("Draft updated successfully!");
      } else {
        await createProductMutation.mutateAsync(productData);
        showToast.success("Draft saved successfully!");
      }

      onClose();
    } catch (error: any) {
      console.error("Failed to save draft:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save draft";
      setErrors({ submit: String(errorMessage) });
      showToast.error(String(errorMessage));
    }
  };

  const isLoading =
    createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Edit Product" : "Add A New Product"}
      icon={<PlusIcon className="w-6 h-6" />}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto space-y-6 pb-4 pr-4 pt-4">
          {/* Product Details Section */}
          <section className="flex gap-6">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  Product Details
                </h3>
                <Tooltip
                  content="Basic information about your product"
                  position="right"
                >
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Enter the basic information for your product including name and
                category.
              </p>
            </div>
            <div className="w-[70%]">
              <div className="grid grid-cols-2 gap-4">
                <Tooltip
                  content="The display name for this product"
                  position="bottom"
                >
                  <Input
                    label={
                      <span>
                        Product Name <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="e.g., Coca Cola 1.5L"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={errors.name}
                    required
                  />
                </Tooltip>
                <Tooltip
                  content="Product category for organization"
                  position="bottom"
                >
                  <Input
                    label={
                      <span>
                        Category <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="e.g., Beverages"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    error={errors.category}
                    required
                  />
                </Tooltip>
                <div className="col-span-2">
                  <Tooltip content="Additional product information (optional)">
                    <Textarea
                      label="Description"
                      placeholder="Optional description"
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      rows={3}
                      className=""
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Profitability Section */}
          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  Pricing & Profitability
                </h3>
                <Tooltip
                  content="Set pricing and view profit calculations"
                  position="right"
                >
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Set the cost and selling price to automatically calculate profit
                margins and markup.
              </p>
            </div>
            <div className="w-[70%] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Tooltip content="The price customers pay for this product">
                  <Input
                    label={
                      <span>
                        Selling Price <span className="text-red-500">*</span>
                      </span>
                    }
                    type="number"
                    placeholder="0.00"
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      handleChange("sellingPrice", e.target.value)
                    }
                    error={errors.sellingPrice}
                    required
                  />
                </Tooltip>
                <Tooltip content="The amount you pay for this product">
                  <Input
                    label={
                      <span>
                        Cost Price <span className="text-red-500">*</span>
                      </span>
                    }
                    type="number"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => handleChange("cost", e.target.value)}
                    error={errors.cost}
                    required
                  />
                </Tooltip>
              </div>

              {/* Profitability Summary */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Profitability Summary
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <Tooltip content="Profit earned per unit sold">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Profit per Unit
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ₱{profit.toFixed(2)}
                      </p>
                    </div>
                  </Tooltip>
                  <Tooltip content="Percentage of profit relative to cost">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Profit Margin
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          parseFloat(profitMargin) >= 0
                            ? "text-primary"
                            : "text-red-600"
                        }`}
                      >
                        {profitMargin}%
                      </p>
                    </div>
                  </Tooltip>
                  <Tooltip content="Percentage of profit relative to selling price">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Markup</p>
                      <p className="text-lg font-bold text-gray-900">
                        {sellingPrice > 0
                          ? ((profit / sellingPrice) * 100).toFixed(2)
                          : "0.00"}
                        %
                      </p>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </section>

          {/* Notes Section */}
          <section className="flex gap-6 pt-6 border-t border-gray-200">
            <div className="w-[30%]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-primary">Notes</h3>
                <Tooltip
                  content="Additional notes about this product"
                  position="right"
                >
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Add any additional notes or information about this product.
              </p>
            </div>
            <div className="w-[70%]">
              <Tooltip content="Additional product notes (optional)">
                <Textarea
                  //   label="Notes"
                  placeholder="E.g., Supplier info, storage instructions, etc."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
              </Tooltip>
            </div>
          </section>
        </div>

        {/* Action Buttons - Pinned to Bottom */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 bg-white sticky pb-1 bottom-0">
          <div className="flex items-center gap-4">
            {/* Status Controls */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activeStatus"
                checked={status === "ACTIVE"}
                onChange={(e) =>
                  setStatus(e.target.checked ? "ACTIVE" : "INACTIVE")
                }
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="activeStatus"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Active
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="outOfStock"
                checked={status === "OUT_OF_STOCK"}
                onChange={(e) =>
                  setStatus(e.target.checked ? "OUT_OF_STOCK" : "ACTIVE")
                }
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="outOfStock"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Out of Stock
              </label>
            </div>
            {errors.submit && (
              <p className="text-sm text-red-600">{errors.submit}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onClose} variant="outline" disabled={isLoading}>
              Cancel
            </Button>
            {!product && (
              <Button
                onClick={handleDraft}
                variant="secondary"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? "Saving..." : "Save as Draft"}
              </Button>
            )}
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading
                ? "Saving..."
                : product
                ? "Update Product"
                : "Add Product"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ProductFormModal;
