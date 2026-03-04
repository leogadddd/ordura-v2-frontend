import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStocks,
  fetchStock,
  adjustStock,
  fetchLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "@/api/inventoryApi";

export const inventoryKeys = {
  all: ["inventory"] as const,
  stocks: () => [...inventoryKeys.all, "stocks"] as const,
  stock: (id: string) => [...inventoryKeys.stocks(), id] as const,
  locations: () => [...inventoryKeys.all, "locations"] as const,
  location: (id: string) => [...inventoryKeys.locations(), id] as const,
};

export function useStocks(params?: {
  productId?: string;
  locationId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: inventoryKeys.stocks(),
    queryFn: () => fetchStocks(params),
  });
}

export function useStock(id: string) {
  return useQuery({
    queryKey: inventoryKeys.stock(id),
    queryFn: () => fetchStock(id),
    enabled: !!id,
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.stocks() });
      // also refresh product list to update stock totals
      qc.invalidateQueries({ queryKey: ["products", "list"] });
    },
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
