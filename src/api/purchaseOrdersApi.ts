import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";
import type { Supplier } from "@/api/suppliersApi";
import type { InventoryItem } from "@/api/inventoryApi";

export type PurchaseOrderStatus =
  | "ORDERED"
  | "DELIVERED"
  | "RESCHEDULED"
  | "CANCELLED";

export interface PurchaseOrderCounts {
  items: number;
  notes: number;
}

export interface PurchaseOrderListRow {
  id: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  orderedAt: string;
  expectedDeliveryAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  _count: PurchaseOrderCounts;
}

export interface UserSummary {
  id: string;
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  inventoryItemId: string;
  quantity: number;
  createdAt: string;
  inventoryItem?: InventoryItem;
}

export interface PurchaseOrderNote {
  id: string;
  purchaseOrderId: string;
  note: string;
  createdById: string;
  createdAt: string;
  createdBy?: UserSummary | null;
}

export interface PurchaseOrderDetails {
  id: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  orderedAt: string;
  expectedDeliveryAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  notes: PurchaseOrderNote[];
}

export interface ListPurchaseOrdersParams {
  search?: string;
  status?: PurchaseOrderStatus;
  supplierId?: string;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  orderedAt?: string;
  expectedDeliveryAt?: string;
  initialNote?: string;
  items: Array<{ inventoryItemId: string; quantity: number }>;
}

export async function fetchPurchaseOrders(params?: ListPurchaseOrdersParams) {
  const response = await apiClient.get<ApiResponse<PurchaseOrderListRow[]>>(
    "/purchase-orders",
    { params },
  );
  return response.data.data as PurchaseOrderListRow[];
}

export async function fetchPurchaseOrder(id: string) {
  const response = await apiClient.get<ApiResponse<PurchaseOrderDetails>>(
    `/purchase-orders/${id}`,
  );
  return response.data.data as PurchaseOrderDetails;
}

export async function createPurchaseOrder(payload: CreatePurchaseOrderPayload) {
  const response = await apiClient.post<ApiResponse<PurchaseOrderDetails>>(
    "/purchase-orders",
    payload,
  );
  return response.data.data as PurchaseOrderDetails;
}

export async function addPurchaseOrderNote(id: string, note: string) {
  const response = await apiClient.post<ApiResponse<PurchaseOrderNote>>(
    `/purchase-orders/${id}/notes`,
    { note },
  );
  return response.data.data as PurchaseOrderNote;
}

export async function markPurchaseOrderDelivered(
  id: string,
  deliveredAt?: string,
) {
  const response = await apiClient.post<ApiResponse<PurchaseOrderListRow>>(
    `/purchase-orders/${id}/mark-delivered`,
    deliveredAt ? { deliveredAt } : {},
  );
  return response.data.data as PurchaseOrderListRow;
}

export async function reschedulePurchaseOrder(
  id: string,
  expectedDeliveryAt: string,
) {
  const response = await apiClient.post<ApiResponse<PurchaseOrderListRow>>(
    `/purchase-orders/${id}/reschedule`,
    { expectedDeliveryAt },
  );
  return response.data.data as PurchaseOrderListRow;
}

export async function cancelPurchaseOrder(
  id: string,
  reason: string,
  cancelledAt?: string,
) {
  const response = await apiClient.post<ApiResponse<PurchaseOrderListRow>>(
    `/purchase-orders/${id}/cancel`,
    { reason, cancelledAt },
  );
  return response.data.data as PurchaseOrderListRow;
}
