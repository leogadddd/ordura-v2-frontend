import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { BackspaceIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  orderDiscount?: number;
  serviceFee?: number;
  deliveryFee?: number;
  onConfirmPayment: (payment: {
    method: string;
    amountReceived: number;
  }) => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "MOBILE", label: "Mobile" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

const TAX_RATE = 0.12; // 12% tax

export function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  orderDiscount = 0,
  serviceFee = 0,
  deliveryFee = 0,
  onConfirmPayment,
  isLoading = false,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<{
    orderId?: string;
    method: string;
    amountReceived: number;
    changeDue: number;
    totalAmount: number;
    timestamp: string;
  } | null>(null);

  // Calculate totals
  const discountedSubtotal = subtotal - (orderDiscount || 0);
  const taxAmount = discountedSubtotal * TAX_RATE;
  const totalAmount =
    discountedSubtotal + taxAmount + (serviceFee || 0) + (deliveryFee || 0);
  const changeDue = amountReceived
    ? Math.max(0, parseFloat(amountReceived) - totalAmount)
    : 0;

  // Keypad handlers
  const handleKeypadInput = (char: string) => {
    if (char === "C") {
      setAmountReceived("");
    } else if (char === "←") {
      setAmountReceived(amountReceived.slice(0, -1));
    } else if (char === ".") {
      if (!amountReceived.includes(".")) {
        setAmountReceived((amountReceived || "0") + char);
      }
    } else if (char === "✓") {
      if (parseFloat(amountReceived || "0") >= totalAmount) {
        handleConfirmPayment();
      }
    } else {
      // Number
      setAmountReceived(amountReceived + char);
    }
  };

  const handleConfirmPayment = async () => {
    const amount = parseFloat(amountReceived || "0");
    if (amount < totalAmount) return;

    try {
      setIsProcessing(true);
      // Allow onConfirmPayment to be async and to optionally return metadata (e.g., orderId)
      const res = onConfirmPayment({
        method: paymentMethod,
        amountReceived: amount,
      }) as unknown;

      let returned: any = null;
      if (res && typeof (res as Promise<any>).then === "function") {
        returned = await (res as Promise<any>);
      }

      setSuccessData({
        orderId: returned?.orderId,
        method: paymentMethod,
        amountReceived: amount,
        changeDue: Math.max(0, amount - totalAmount),
        totalAmount,
        timestamp: new Date().toISOString(),
      });

      setAmountReceived("");
    } finally {
      setIsProcessing(false);

      setTimeout(() => {
        // Auto-close after short delay
        setSuccessData(null);
        onClose();
      }, 3000);
    }
  };

  // Reset internal state if modal is closed externally
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setSuccessData(null);
      setAmountReceived("");
    }
  }, [isOpen]);

  // Keypad layout: 3x3 grid for numbers + operations
  const keypads = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "←"],
  ];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout"
      maxWidth={successData ? "max-w-2xl" : "max-w-4xl"}
    >
      <div className="flex gap-6 p-6 pb-4 pt-2">
        {/* Success view */}
        {successData ? (
          <div className="w-full pt-4 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Successful
                </h3>
                <p className="text-sm text-gray-600">
                  Payment has been processed.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 min-w-xl">
              {successData.orderId && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Order ID</span>
                  <span className="font-medium">{successData.orderId}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-700">
                <span>Method</span>
                <span className="font-medium">{successData.method}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Total</span>
                <span className="font-medium">
                  ₱{successData.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Paid</span>
                <span className="font-medium">
                  ₱{successData.amountReceived.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Change</span>
                <span className="font-medium">
                  ₱{successData.changeDue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Time</span>
                <span className="font-medium">
                  {new Date(successData.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full mt-4 grid grid-cols-2 gap-2 max-w-xl">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  // Close and reset
                  setSuccessData(null);
                  onClose();
                }}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => {
                  // Start new order: just reset success and close modal so parent can reset cart
                  setSuccessData(null);
                  onClose();
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Left: Order Breakdown */}
            <div className="flex-1 min-w-0">
              <div className="space-y-4">
                {/* Cart Items Summary */}
                <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                  <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm text-gray-700"
                      >
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-primary-pale rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Tax (12%)</span>
                    <span>₱{taxAmount.toFixed(2)}</span>
                  </div>
                  {orderDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Order Discount</span>
                      <span className="text-red-600">
                        -₱{orderDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Service Fee</span>
                      <span>₱{serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Delivery Fee</span>
                      <span>₱{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-base text-primary">
                    <span>Total</span>
                    <span>₱{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          paymentMethod === method.value
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        disabled={isLoading}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Amount Input + Keypad */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Amount Display */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Received
                </label>
                <input
                  type="text"
                  value={amountReceived}
                  readOnly
                  placeholder="₱0.00"
                  className="w-full text-3xl font-bold text-primary bg-transparent border-b-2 border-primary pb-2 mb-4"
                />
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Change Due</span>
                    <span className="font-bold text-primary">
                      ₱{changeDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {keypads.map((row, rowIdx) => (
                  <div key={rowIdx} className="contents">
                    {row.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleKeypadInput(key)}
                        className={`py-3 rounded-lg font-bold text-lg transition ${
                          key === "←"
                            ? "bg-red-100 text-red-700 hover:bg-red-200 col-span-1"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                        disabled={isLoading}
                      >
                        {key === "←" ? (
                          <BackspaceIcon className="w-5 h-5 mx-auto" />
                        ) : (
                          key
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Clear and Confirm Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={() => setAmountReceived("")}
                  variant="outline"
                  size="lg"
                  disabled={isLoading || !amountReceived}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmPayment}
                  variant="primary"
                  size="lg"
                  disabled={
                    isLoading ||
                    isProcessing ||
                    !amountReceived ||
                    parseFloat(amountReceived) < totalAmount
                  }
                >
                  {isProcessing ? "Processing…" : "Confirm Payment"}
                </Button>
              </div>

              {/* Error message with reserved height */}
              <div className="h-6 mt-2">
                {amountReceived && parseFloat(amountReceived) < totalAmount && (
                  <p className="text-xs text-red-500 text-center">
                    Amount received is less than total
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default CheckoutModal;
