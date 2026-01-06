import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    notes?: string;
  } | null;
  onConfirm: (product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }) => void;
}

export function AddToCartModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product && quantity > 0) {
      onConfirm({
        ...product,
        quantity,
      });
      onClose();
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };

  if (!product) return null;

  const subtotal = product.price * quantity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Cart"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3 p-3 pt-6">
        {/* Product Info */}
        <div className="bg-gray-100 rounded-xl p-3">
          <h3 className="font-semibold text-base text-gray-800">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600">₱{product.price.toFixed(2)}</p>
        </div>

        {/* Quantity Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={decrementQuantity}
              className="w-14 h-12 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
            >
              <MinusIcon className="w-5 h-5" />
            </button>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 text-center font-bold text-base"
            />
            <button
              type="button"
              onClick={incrementQuantity}
              className="w-14 h-12 rounded-lg bg-primary hover:bg-primary-light text-white flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="bg-primary-pale rounded-xl p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Subtotal</span>
            <span className="text-lg font-bold text-primary">
              ₱{subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Notes Display */}
        {product.notes && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-gray-600">{product.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" variant="primary" className="flex-1">
            Add to Cart
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddToCartModal;
