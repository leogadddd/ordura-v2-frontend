import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface Location {
  id: string;
  name: string;
  address?: string;
}

export interface InventorySummary {
  totalSkus: number;
  totalLocations: number;
  totalStockUnits: number;
  outOfStockSkus: number;
  lowStockSkus: number;
}

export type MeasurementUnit = "PIECE" | "ML" | "L" | "OZ" | "G" | "KG";

export interface InventoryItemSupplier {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  measurementUnit: MeasurementUnit;
  lowThreshold?: number;
  shouldAlert: boolean;
  supplierId?: string | null;
  supplier?: InventoryItemSupplier | null;
  totalQuantity?: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLevel {
  id: string;
  location: Location;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export const fetchInventorySummary = async (): Promise<InventorySummary> => {
  const res =
    await apiClient.get<ApiResponse<InventorySummary>>("/inventory/summary");
  return res.data.data as InventorySummary;
};

export const fetchInventoryItems = async (params?: { search?: string }) => {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  const res = await apiClient.get(`/inventory/items?${query.toString()}`);
  return res.data.data as InventoryItem[];
};

export const fetchInventoryItem = async (id: string) => {
  const res = await apiClient.get(`/inventory/items/${id}`);
  return res.data.data as InventoryItem & { levels: InventoryLevel[] };
};

export const fetchInventoryLevels = async (inventoryItemId: string) => {
  const res = await apiClient.get(`/inventory/items/${inventoryItemId}/levels`);
  return res.data.data as InventoryLevel[];
};

export const createInventoryItem = async (data: {
  name: string;
  description?: string;
  measurementUnit?: MeasurementUnit;
  lowThreshold?: number;
  shouldAlert?: boolean;
  supplierId?: string;
  initialLocationId?: string;
  initialQuantity?: number;
  initialReason?: string;
}) => {
  const res = await apiClient.post(`/inventory/items`, data);
  return res.data.data as InventoryItem;
};

export const updateInventoryItem = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    measurementUnit?: MeasurementUnit;
    lowThreshold?: number;
    shouldAlert?: boolean;
    supplierId?: string | null;
  },
) => {
  const res = await apiClient.put(`/inventory/items/${id}`, data);
  return res.data.data as InventoryItem;
};

export const deleteInventoryItem = async (id: string) => {
  const res = await apiClient.delete(`/inventory/items/${id}`);
  return res.data;
};

export const adjustInventoryLevel = async (data: {
  inventoryItemId: string;
  locationId: string;
  quantity: number;
  reason: string;
}) => {
  const res = await apiClient.post(`/inventory/items/adjust`, data);
  return res.data;
};

export const fetchLocations = async () => {
  const res = await apiClient.get("/inventory/locations");
  return res.data.data as Location[];
};

export const createLocation = async (data: {
  name: string;
  address?: string;
}) => {
  const res = await apiClient.post("/inventory/locations", data);
  return res.data.data as Location;
};

export const updateLocation = async (
  id: string,
  data: { name?: string; address?: string },
) => {
  const res = await apiClient.put(`/inventory/locations/${id}`, data);
  return res.data.data as Location;
};

export const deleteLocation = async (id: string) => {
  const res = await apiClient.delete(`/inventory/locations/${id}`);
  return res.data;
};
