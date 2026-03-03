import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FeesConfigModal } from "@/components/modals/FeesConfigModal";
import { SlidePanel } from "@/components/ui/SlidePanel";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onPlaceOrder: () => void;
  onEditItem: (item: CartItem) => void;
  orderDiscount?: number;
  serviceFee?: number;
  deliveryFee?: number;
  onOrderDiscountChange?: (value: number) => void;
  onServiceFeeChange?: (value: number) => void;
  onDeliveryFeeChange?: (value: number) => void;
  isModal?: boolean;
  onCloseModal?: () => void;
  showHeader?: boolean;
  showCloseButton?: boolean;
}

export function Cart({
  items,
  onUpdateQuantity,
  onRemove,
  onClear,
  onPlaceOrder,
  onEditItem,
  orderDiscount = 0,
  serviceFee = 0,
  deliveryFee = 0,
  onOrderDiscountChange,
  onServiceFeeChange,
  onDeliveryFeeChange,
  isModal = false,
  onCloseModal,
  showHeader = true,
  showCloseButton = true,
}: CartProps) {
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [isFeesModalOpen, setIsFeesModalOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
  const prevItemsRef = useRef<CartItem[]>(items);
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const prevItems = prevItemsRef.current;
    if (items.length > prevItems.length) {
      const prevIds = new Set(prevItems.map((i) => i.id));
      const newItem = items.find((i) => !prevIds.has(i.id));
      if (newItem) {
        setHighlightedItemId(newItem.id);
        if (highlightTimeoutRef.current) {
          window.clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = window.setTimeout(() => {
          setHighlightedItemId(null);
          highlightTimeoutRef.current = null;
        }, 3000);
      }
    }
    prevItemsRef.current = items;
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    };
  }, [items]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountedSubtotal = subtotal - orderDiscount;
  // Taxable base includes subtotal after discount plus any service/delivery fees
  const taxableBase = Math.max(
    0,
    discountedSubtotal + serviceFee + deliveryFee,
  );
  const tax = taxableBase * 0.12; // 12% VAT
  const total = taxableBase + tax;

  const handleApplyFees = (
    newOrderDiscount: number,
    newServiceFee: number,
    newDeliveryFee: number,
  ) => {
    onOrderDiscountChange?.(newOrderDiscount);
    onServiceFeeChange?.(newServiceFee);
    onDeliveryFeeChange?.(newDeliveryFee);
  };

  const cartContent = (
    <div className="flex flex-col bg-gray-50 pb-4 border border-gray-200 min-h-0 h-full">
      <h2 className="text-lg font-bold p-4 pb-3">Cart</h2>

      <div className="flex-1 overflow-y-auto min-h-0">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Cart is empty</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="text-left p-3 font-semibold">Item</th>
                <th className="text-right p-3 font-semibold">Unit Price</th>
                <th className="text-center p-3 font-semibold">Qty</th>
                <th className="text-right p-3 font-semibold">Subtotal</th>
                <th className="text-center p-3 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    item.id === highlightedItemId ? "bg-yellow-100" : ""
                  }`}
                  onClick={() => onEditItem(item)}
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    ₱{item.price.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateQuantity(item.id, -1);
                        }}
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateQuantity(item.id, 1);
                        }}
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-gray-900">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td className="p-3 text-center pt-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToRemove(item.id);
                      }}
                      variant="destructive"
                      className="w-11 h-11 px-0!"
                    >
                      <TrashIcon className="w-5 h-5 mx-auto" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-300 pt-3 pb-3 px-4 mt-auto space-y-2">
        {/* Fees Link */}
        <button
          onClick={() => setIsFeesModalOpen(true)}
          className="text-sm text-primary underline hover:text-primary-light transition"
        >
          Configure Fees
        </button>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₱{subtotal.toFixed(2)}</span>
        </div>

        {/* Conditional Fee Rows - Only show if non-zero */}
        {orderDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order Discount</span>
            <span className="font-medium text-red-600">
              -₱{orderDiscount.toFixed(2)}
            </span>
          </div>
        )}
        {serviceFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service Fee</span>
            <span className="font-medium">₱{serviceFee.toFixed(2)}</span>
          </div>
        )}
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">₱{deliveryFee.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">VAT (12%)</span>
          <span className="font-medium">₱{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
          <span>Total</span>
          <span className="text-primary">₱{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Fees Config Modal */}
      <FeesConfigModal
        isOpen={isFeesModalOpen}
        onClose={() => setIsFeesModalOpen(false)}
        orderDiscount={orderDiscount}
        serviceFee={serviceFee}
        deliveryFee={deliveryFee}
        subtotal={subtotal}
        onApply={handleApplyFees}
      />

      <div className="p-4 pt-0 flex gap-2">
        <Button
          onClick={onClear}
          disabled={items.length === 0}
          variant="destructive"
          size="lg"
          className="w-[30%]"
        >
          Clear
        </Button>
        <Button
          onClick={onPlaceOrder}
          disabled={items.length === 0}
          variant="primary"
          size="lg"
          className="w-[70%]"
        >
          Place Order
        </Button>
      </div>

      <ConfirmDialog
        isOpen={itemToRemove !== null}
        onClose={() => setItemToRemove(null)}
        onConfirm={() => {
          if (itemToRemove) {
            onRemove(itemToRemove);
            setItemToRemove(null);
          }
        }}
        title="Remove Item"
        description="Are you sure you want to remove this item from the cart?"
        confirmText="Remove"
        confirmVariant="danger"
      />
    </div>
  );

  if (isModal) {
    return (
      <SlidePanel
        isOpen={true}
        onClose={onCloseModal || (() => {})}
        title="Cart"
        width="w-full sm:w-96"
        showHeader={showHeader}
        showCloseButton={showCloseButton}
      >
        {cartContent}
      </SlidePanel>
    );
  }

  return (
    <div className={`${isModal ? "flex" : "hidden lg:block"} h-full`}>
      {cartContent}
    </div>
  );
}

export default Cart;
