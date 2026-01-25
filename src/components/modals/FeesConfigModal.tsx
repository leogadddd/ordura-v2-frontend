import { useState, useEffect, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface FeesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDiscount: number;
  serviceFee: number;
  deliveryFee: number;
  subtotal: number;
  onApply: (
    orderDiscount: number,
    serviceFee: number,
    deliveryFee: number,
  ) => void;
}

type FeeType = "amount" | "percentage";

export function FeesConfigModal({
  isOpen,
  onClose,
  orderDiscount,
  serviceFee,
  deliveryFee,
  subtotal,
  onApply,
}: FeesConfigModalProps) {
  // Store values as strings to allow user typing (partial input) and sanitize on change
  const [localOrderDiscount, setLocalOrderDiscount] = useState(
    String(orderDiscount),
  );
  const [localServiceFee, setLocalServiceFee] = useState(String(serviceFee));
  const [localDeliveryFee, setLocalDeliveryFee] = useState(String(deliveryFee));

  function sanitizeNumericInput(input: string) {
    if (typeof input !== "string") return "";
    // Remove invalid chars (allow digits and dot)
    let s = input.replace(/[^0-9.]/g, "");
    // Keep only first dot
    const firstDot = s.indexOf(".");
    if (firstDot >= 0) {
      s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
    }
    // Limit to 2 decimal places
    if (s.includes(".")) {
      const [int, dec] = s.split(".");
      s = int + "." + (dec || "").slice(0, 2);
    }
    return s;
  }
  const [orderDiscountType, setOrderDiscountType] = useState<FeeType>("amount");
  const [serviceFeeType, setServiceFeeType] = useState<FeeType>("amount");
  const [deliveryFeeType, setDeliveryFeeType] = useState<FeeType>("amount");

  useEffect(() => {
    if (isOpen) {
      setLocalOrderDiscount(String(orderDiscount));
      setLocalServiceFee(String(serviceFee));
      setLocalDeliveryFee(String(deliveryFee));
    }
  }, [isOpen, orderDiscount, serviceFee, deliveryFee]);

  const calculateFromPercentage = (percentage: number, base: number) => {
    return (percentage / 100) * base;
  };

  const calculatePercentageFromAmount = (amountStr: string, base: number) => {
    const amount = parseFloat(amountStr) || 0;
    return base > 0 ? (amount / base) * 100 : 0;
  };
  const handleOrderDiscountChange = (value: string) => {
    const cleaned = sanitizeNumericInput(value);
    setLocalOrderDiscount(cleaned);
  };

  const handleServiceFeeChange = (value: string) => {
    const cleaned = sanitizeNumericInput(value);
    setLocalServiceFee(cleaned);
  };

  const handleDeliveryFeeChange = (value: string) => {
    const cleaned = sanitizeNumericInput(value);
    setLocalDeliveryFee(cleaned);
  };

  const handleOrderDiscountTypeChange = (type: FeeType) => {
    if (orderDiscountType === "amount" && type === "percentage") {
      const percentage = calculatePercentageFromAmount(
        localOrderDiscount,
        subtotal,
      );
      setLocalOrderDiscount(String(Number(percentage.toFixed(2))));
    } else if (orderDiscountType === "percentage" && type === "amount") {
      const amount = calculateFromPercentage(
        parseFloat(localOrderDiscount || "0"),
        subtotal,
      );
      setLocalOrderDiscount(String(Number(amount.toFixed(2))));
    }
    setOrderDiscountType(type);
  };

  const handleServiceFeeTypeChange = (type: FeeType) => {
    if (serviceFeeType === "amount" && type === "percentage") {
      const percentage = calculatePercentageFromAmount(
        localServiceFee,
        subtotal,
      );
      setLocalServiceFee(String(Number(percentage.toFixed(2))));
    } else if (serviceFeeType === "percentage" && type === "amount") {
      const amount = calculateFromPercentage(
        parseFloat(localServiceFee || "0"),
        subtotal,
      );
      setLocalServiceFee(String(Number(amount.toFixed(2))));
    }
    setServiceFeeType(type);
  };

  const handleDeliveryFeeTypeChange = (type: FeeType) => {
    if (deliveryFeeType === "amount" && type === "percentage") {
      const percentage = calculatePercentageFromAmount(
        localDeliveryFee,
        subtotal,
      );
      setLocalDeliveryFee(String(Number(percentage.toFixed(2))));
    } else if (deliveryFeeType === "percentage" && type === "amount") {
      const amount = calculateFromPercentage(
        parseFloat(localDeliveryFee || "0"),
        subtotal,
      );
      setLocalDeliveryFee(String(Number(amount.toFixed(2))));
    }
    setDeliveryFeeType(type);
  };

  const getAmountValue = (valueStr: string, type: FeeType) => {
    const value = parseFloat(valueStr) || 0;
    if (type === "percentage") {
      return calculateFromPercentage(value, subtotal);
    }
    return value;
  };

  const handleApply = () => {
    const finalOrderDiscount = getAmountValue(
      localOrderDiscount,
      orderDiscountType,
    );
    const finalServiceFee = getAmountValue(localServiceFee, serviceFeeType);
    const finalDeliveryFee = getAmountValue(localDeliveryFee, deliveryFeeType);

    onApply(finalOrderDiscount, finalServiceFee, finalDeliveryFee);
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleApply();
  };

  const handleReset = () => {
    setLocalOrderDiscount("0");
    setLocalServiceFee("0");
    setLocalDeliveryFee("0");
    setOrderDiscountType("amount");
    setServiceFeeType("amount");
    setDeliveryFeeType("amount");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Fees"
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Order Discount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Order Discount
            </label>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleOrderDiscountTypeChange("amount")}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  orderDiscountType === "amount"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Fixed
              </button>
              <button
                type="button"
                onClick={() => handleOrderDiscountTypeChange("percentage")}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  orderDiscountType === "percentage"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                %
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">
              {orderDiscountType === "percentage" ? "%" : "₱"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={localOrderDiscount}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                e.preventDefault();
                handleOrderDiscountChange(text);
              }}
              onChange={(e) => handleOrderDiscountChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Service Fee */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Service Fee
            </label>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleServiceFeeTypeChange("amount")}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  serviceFeeType === "amount"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Fixed
              </button>
              <button
                type="button"
                onClick={() => handleServiceFeeTypeChange("percentage")}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  serviceFeeType === "percentage"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                %
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">
              {serviceFeeType === "percentage" ? "%" : "₱"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={localServiceFee}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                e.preventDefault();
                handleServiceFeeChange(text);
              }}
              onChange={(e) => handleServiceFeeChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Delivery Fee */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Delivery Fee
            </label>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleDeliveryFeeTypeChange("amount")}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  deliveryFeeType === "amount"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Fixed
              </button>
              <button
                type="button"
                onClick={() => handleDeliveryFeeTypeChange("percentage")}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  deliveryFeeType === "percentage"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                %
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">
              {deliveryFeeType === "percentage" ? "%" : "₱"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={localDeliveryFee}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                e.preventDefault();
                handleDeliveryFeeChange(text);
              }}
              onChange={(e) => handleDeliveryFeeChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            onClick={handleReset}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            Reset
          </Button>
          <Button type="submit" variant="primary" size="md" className="flex-1">
            Apply
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FeesConfigModal;
