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
    deliveryFee: number
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
  const [localOrderDiscount, setLocalOrderDiscount] = useState(orderDiscount);
  const [localServiceFee, setLocalServiceFee] = useState(serviceFee);
  const [localDeliveryFee, setLocalDeliveryFee] = useState(deliveryFee);

  const [orderDiscountType, setOrderDiscountType] = useState<FeeType>("amount");
  const [serviceFeeType, setServiceFeeType] = useState<FeeType>("amount");
  const [deliveryFeeType, setDeliveryFeeType] = useState<FeeType>("amount");

  useEffect(() => {
    if (isOpen) {
      setLocalOrderDiscount(orderDiscount);
      setLocalServiceFee(serviceFee);
      setLocalDeliveryFee(deliveryFee);
    }
  }, [isOpen, orderDiscount, serviceFee, deliveryFee]);

  const calculateFromPercentage = (percentage: number, base: number) => {
    return (percentage / 100) * base;
  };

  const calculatePercentageFromAmount = (amount: number, base: number) => {
    return base > 0 ? (amount / base) * 100 : 0;
  };

  const handleOrderDiscountChange = (value: number) => {
    setLocalOrderDiscount(value);
  };

  const handleServiceFeeChange = (value: number) => {
    setLocalServiceFee(value);
  };

  const handleDeliveryFeeChange = (value: number) => {
    setLocalDeliveryFee(value);
  };

  const handleOrderDiscountTypeChange = (type: FeeType) => {
    if (orderDiscountType === "amount" && type === "percentage") {
      const percentage = calculatePercentageFromAmount(
        localOrderDiscount,
        subtotal
      );
      setLocalOrderDiscount(percentage);
    } else if (orderDiscountType === "percentage" && type === "amount") {
      const amount = calculateFromPercentage(localOrderDiscount, subtotal);
      setLocalOrderDiscount(amount);
    }
    setOrderDiscountType(type);
  };

  const handleServiceFeeTypeChange = (type: FeeType) => {
    if (serviceFeeType === "amount" && type === "percentage") {
      const percentage = calculatePercentageFromAmount(
        localServiceFee,
        subtotal
      );
      setLocalServiceFee(percentage);
    } else if (serviceFeeType === "percentage" && type === "amount") {
      const amount = calculateFromPercentage(localServiceFee, subtotal);
      setLocalServiceFee(amount);
    }
    setServiceFeeType(type);
  };

  const handleDeliveryFeeTypeChange = (type: FeeType) => {
    if (deliveryFeeType === "amount" && type === "percentage") {
      const percentage = calculatePercentageFromAmount(
        localDeliveryFee,
        subtotal
      );
      setLocalDeliveryFee(percentage);
    } else if (deliveryFeeType === "percentage" && type === "amount") {
      const amount = calculateFromPercentage(localDeliveryFee, subtotal);
      setLocalDeliveryFee(amount);
    }
    setDeliveryFeeType(type);
  };

  const getAmountValue = (value: number, type: FeeType) => {
    if (type === "percentage") {
      return calculateFromPercentage(value, subtotal);
    }
    return value;
  };

  const handleApply = () => {
    const finalOrderDiscount = getAmountValue(
      localOrderDiscount,
      orderDiscountType
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
    setLocalOrderDiscount(0);
    setLocalServiceFee(0);
    setLocalDeliveryFee(0);
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
              type="number"
              value={localOrderDiscount}
              onChange={(e) =>
                handleOrderDiscountChange(
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right"
              placeholder="0.00"
              min="0"
              step="0.01"
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
              type="number"
              value={localServiceFee}
              onChange={(e) =>
                handleServiceFeeChange(
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right"
              placeholder="0.00"
              min="0"
              step="0.01"
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
              type="number"
              value={localDeliveryFee}
              onChange={(e) =>
                handleDeliveryFeeChange(
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right"
              placeholder="0.00"
              min="0"
              step="0.01"
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
