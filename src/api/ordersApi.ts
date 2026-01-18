import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export type OrderStatus =
  | "DRAFT"
  | "OPEN"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";
export type OrderType = "SALE" | "RETURN";
export type TaxMode = "INCLUSIVE" | "EXCLUSIVE" | "NONE";

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  taxMode: TaxMode;
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
  closedAt?: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  lineNo: number;
  productId?: string | null;
  sku?: string | null;
  name: string;
  category?: string | null;
  unitPrice: number;
  unitCost?: number | null;
  quantity: number;
  discount: number;
  taxRate?: number | null;
  taxAmount: number;
  lineTotal: number;
  notes?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: "CASH" | "CARD" | "MOBILE" | "BANK_TRANSFER" | "OTHER";
  status: "PENDING" | "PAID" | "VOID" | "REFUNDED";
  amount: number;
  currency: string;
  reference?: string | null;
  externalTxnId?: string | null;
  receivedAt: string;
  metadata?: any;
}

export interface EmployeeSummary {
  id: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
}

export interface OrderDetails extends Order {
  employee?: EmployeeSummary;
  items: OrderItem[];
  payments: Payment[];
  salesTransaction?: {
    id: string;
    transactionNumber: string;
    createdAt: string;
  } | null;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  type?: OrderType;
  search?: string; // orderNumber or customerName
  from?: string; // ISO date
  to?: string; // ISO date
}

export interface ListOrdersData {
  items: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ListOrdersResponse = ApiResponse<ListOrdersData>;
export type OrderResponse = ApiResponse<Order>;
export type OrderDetailsResponse = ApiResponse<OrderDetails>;

export const getOrders = async (
  params?: ListOrdersParams
): Promise<ListOrdersResponse> => {
  const response = await apiClient.get("/orders", { params });
  return response.data;
};

export const getOrder = async (id: string): Promise<OrderDetailsResponse> => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};
