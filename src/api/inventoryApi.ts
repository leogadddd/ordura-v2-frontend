import apiClient from "@/lib/apiClient";

export interface Stock {
  id: string;
  product: any;
  location: any;
  quantity: number;
  adjustments?: any[];
}

export interface Location {
  id: string;
  name: string;
  address?: string;
}

export const fetchStocks = async (params?: {
  productId?: string;
  locationId?: string;
}) => {
  const query = new URLSearchParams();
  if (params) {
    if (params.productId) query.append("productId", params.productId);
    if (params.locationId) query.append("locationId", params.locationId);
  }
  const res = await apiClient.get(`/inventory/stocks?${query.toString()}`);
  return res.data.data as Stock[];
};

export const fetchStock = async (id: string) => {
  const res = await apiClient.get(`/inventory/stocks/${id}`);
  return res.data as Stock;
};

export const adjustStock = async (data: {
  stockId?: string;
  productId?: string;
  locationId?: string;
  quantity: number;
  reason: string;
}) => {
  const res = await apiClient.post(`/inventory/adjust`, data);
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
