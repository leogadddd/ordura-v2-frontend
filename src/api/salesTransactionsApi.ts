import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export type TransactionStatus =
  | "DRAFT"
  | "OPEN"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";
export type TransactionType = "SALE" | "RETURN";
export type TaxMode = "INCLUSIVE" | "EXCLUSIVE" | "NONE";

export interface TransactionItem {
  id: string;
  transactionId: string;
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
  orderId?: string | null;
  salesTransactionId?: string | null;
  method: "CASH" | "CARD" | "MOBILE" | "BANK_TRANSFER" | "OTHER";
  status: "PENDING" | "PAID" | "VOID" | "REFUNDED";
  amount: number;
  currency: string;
  reference?: string | null;
  externalTxnId?: string | null;
  receivedAt: string;
  metadata?: any;
}

export interface SalesTransaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  status: TransactionStatus;
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
  notes?: string | null;
  employeeId: string;
  createdAt: string;
  closedAt?: string | null;
  items?: TransactionItem[];
  payments?: Payment[];
  employee?: {
    id: string;
    username?: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    roleDetails?: { id: string; name: string } | null;
  } | null;
}

export interface ListSalesTransactionsParams {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
  type?: TransactionType;
  search?: string;
  from?: string;
  to?: string;
}

export interface ListSalesTransactionsData {
  items: SalesTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ListSalesTransactionsResponse =
  ApiResponse<ListSalesTransactionsData>;
export type SalesTransactionResponse = ApiResponse<SalesTransaction>;

export const getSalesTransactions = async (
  params?: ListSalesTransactionsParams
): Promise<ListSalesTransactionsResponse> => {
  const response = await apiClient.get("/transactions/sales", { params });
  return response.data;
};

export const getSalesTransaction = async (
  id: string
): Promise<SalesTransactionResponse> => {
  const response = await apiClient.get(`/transactions/sales/${id}`);
  return response.data;
};
