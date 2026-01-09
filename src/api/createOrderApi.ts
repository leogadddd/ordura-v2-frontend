import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface CreateOrderBody {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: {
    productId?: string;
    sku?: string;
    name: string;
    category?: string;
    unitPrice: number;
    quantity: number;
    discount?: number;
    taxRate?: number;
  }[];
  subtotal: number;
  orderDiscount?: number;
  discountTotal?: number;
  serviceFee?: number;
  deliveryFee?: number;
  taxTotal?: number;
  grandTotal: number;
  paymentMethod: string;
  amountReceived: number;
  notes?: string;
}

export type CreateOrderResponse = ApiResponse<any>;

export const createOrder = async (
  data: CreateOrderBody
): Promise<CreateOrderResponse> => {
  const response = await apiClient.post("/orders", data);
  return response.data;
};
