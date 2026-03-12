import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPayload {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export const fetchSuppliers = async (params?: {
  search?: string;
  isActive?: boolean;
}) => {
  const response = await apiClient.get<ApiResponse<Supplier[]>>("/suppliers", {
    params,
  });
  return response.data.data as Supplier[];
};

export const createSupplier = async (data: SupplierPayload) => {
  const response = await apiClient.post<ApiResponse<Supplier>>(
    "/suppliers",
    data,
  );
  return response.data.data as Supplier;
};

export const updateSupplier = async (id: string, data: SupplierPayload) => {
  const response = await apiClient.put<ApiResponse<Supplier>>(
    `/suppliers/${id}`,
    data,
  );
  return response.data.data as Supplier;
};

export const deleteSupplier = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<Supplier>>(
    `/suppliers/${id}`,
  );
  return response.data;
};
