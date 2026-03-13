import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPurchaseOrderNote,
  cancelPurchaseOrder,
  createPurchaseOrder,
  fetchPurchaseOrder,
  fetchPurchaseOrders,
  markPurchaseOrderDelivered,
  reschedulePurchaseOrder,
  type ListPurchaseOrdersParams,
} from "@/api/purchaseOrdersApi";

export const purchaseOrderKeys = {
  all: ["purchase-orders"] as const,
  lists: () => [...purchaseOrderKeys.all, "list"] as const,
  list: (params?: ListPurchaseOrdersParams) =>
    [...purchaseOrderKeys.lists(), params ?? {}] as const,
  details: () => [...purchaseOrderKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
};

export function usePurchaseOrders(params?: ListPurchaseOrdersParams) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: () => fetchPurchaseOrders(params),
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => fetchPurchaseOrder(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      await qc.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(created.id),
      });
    },
  });
}

export function useAddPurchaseOrderNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      addPurchaseOrderNote(id, note),
    onSuccess: async (createdNote) => {
      await qc.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      await qc.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(createdNote.purchaseOrderId),
      });
    },
  });
}

export function useMarkPurchaseOrderDelivered() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deliveredAt }: { id: string; deliveredAt?: string }) =>
      markPurchaseOrderDelivered(id, deliveredAt),
    onSuccess: async (updated) => {
      await qc.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      await qc.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(updated.id),
      });
    },
  });
}

export function useReschedulePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      expectedDeliveryAt,
    }: {
      id: string;
      expectedDeliveryAt: string;
    }) => reschedulePurchaseOrder(id, expectedDeliveryAt),
    onSuccess: async (updated) => {
      await qc.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      await qc.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(updated.id),
      });
    },
  });
}

export function useCancelPurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reason,
      cancelledAt,
    }: {
      id: string;
      reason: string;
      cancelledAt?: string;
    }) => cancelPurchaseOrder(id, reason, cancelledAt),
    onSuccess: async (updated) => {
      await qc.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      await qc.invalidateQueries({
        queryKey: purchaseOrderKeys.detail(updated.id),
      });
    },
  });
}
