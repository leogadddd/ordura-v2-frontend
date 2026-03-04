import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface CreateOrderBody {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  locationId?: string;
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

export interface OrderItem {
  id: string;
  orderId: string;
  lineNo: number;
  productId?: string;
  sku?: string;
  name: string;
  category?: string;
  unitPrice: number;
  unitCost?: number;
  quantity: number;
  discount: number;
  taxRate?: number;
  taxAmount: number;
  lineTotal: number;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  salesTransactionId?: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  reference?: string;
  externalTxnId?: string;
  receivedAt: string;
  metadata?: any;
}

export interface Employee {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  taxMode: string;
  currency: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  subtotal: number;
  orderDiscount: number;
  discountTotal: number;
  serviceFee: number;
  deliveryFee: number;
  taxTotal: number;
  grandTotal: number;
  paidTotal: number;
  changeDue: number;
  dueAmount: number;
  notes?: string;
  employeeId: string;
  createdAt: string;
  closedAt?: string;
  employee: Employee;
  items: OrderItem[];
  payments: Payment[];
}

export type CreateOrderResponse = ApiResponse<Order>;

export const createOrder = async (
  data: CreateOrderBody,
): Promise<CreateOrderResponse> => {
  const response = await apiClient.post("/orders", data);
  return response.data;
};
