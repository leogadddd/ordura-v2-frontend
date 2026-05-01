import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInventoryItems,
  fetchInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryLevel,
  fetchInventoryLevels,
  fetchLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  fetchInventorySummary,
} from "@/api/inventoryApi";

export const inventoryKeys = {
  all: ["inventory"] as const,
  items: () => [...inventoryKeys.all, "items"] as const,
  itemsList: (params?: { search?: string }) =>
    [...inventoryKeys.items(), params ?? {}] as const,
  item: (id: string) => [...inventoryKeys.items(), id] as const,
  itemLevels: (id: string) => [...inventoryKeys.items(), id, "levels"] as const,
  locations: () => [...inventoryKeys.all, "locations"] as const,
  location: (id: string) => [...inventoryKeys.locations(), id] as const,
  summary: () => [...inventoryKeys.all, "summary"] as const,
};

export function useInventoryItems(params?: { search?: string }) {
  return useQuery({
    queryKey: inventoryKeys.itemsList(params),
    queryFn: () => fetchInventoryItems(params),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.item(id),
    queryFn: () => fetchInventoryItem(id),
    enabled: !!id,
  });
}

export function useInventoryLevels(inventoryItemId: string) {
  return useQuery({
    queryKey: inventoryKeys.itemLevels(inventoryItemId),
    queryFn: () => fetchInventoryLevels(inventoryItemId),
    enabled: !!inventoryItemId,
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.items() });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary() });
    },
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateInventoryItem(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.items() });
      qc.invalidateQueries({ queryKey: inventoryKeys.item(vars.id) });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary() });
    },
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.items() });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary() });
    },
  });
}

export function useAdjustInventoryLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adjustInventoryLevel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.items() });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary() });
    },
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: () => fetchInventorySummary(),
  });
}

// locations
export function useLocations() {
  return useQuery({
    queryKey: inventoryKeys.locations(),
    queryFn: () => fetchLocations(),
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.locations() });
    },
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLocation(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.locations() });
      qc.invalidateQueries({ queryKey: inventoryKeys.location(vars.id) });
    },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.locations() });
    },
  });
}
