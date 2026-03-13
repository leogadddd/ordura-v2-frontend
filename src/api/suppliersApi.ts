import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  deliveryLeadTimeDays?: number;
  notes?: string;
  isActive: boolean;
  tags?: Array<{ id: string; label: string }>;
  _count?: { contacts: number };
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  deliveryLeadTimeDays?: number;
  notes?: string;
  isActive?: boolean;
  tags?: string[];
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
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

export const fetchSupplierContacts = async (supplierId: string) => {
  const response = await apiClient.get<ApiResponse<SupplierContact[]>>(
    `/suppliers/${supplierId}/contacts`,
  );
  return response.data.data as SupplierContact[];
};

export const createSupplierContact = async (
  supplierId: string,
  data: {
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    notes?: string;
    isPrimary?: boolean;
  },
) => {
  const response = await apiClient.post<ApiResponse<SupplierContact>>(
    `/suppliers/${supplierId}/contacts`,
    data,
  );
  return response.data.data as SupplierContact;
};

export const updateSupplierContact = async (
  supplierId: string,
  contactId: string,
  data: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
    notes?: string;
    isPrimary?: boolean;
  },
) => {
  const response = await apiClient.put<ApiResponse<SupplierContact>>(
    `/suppliers/${supplierId}/contacts/${contactId}`,
    data,
  );
  return response.data.data as SupplierContact;
};

export const deleteSupplierContact = async (
  supplierId: string,
  contactId: string,
) => {
  const response = await apiClient.delete<ApiResponse<SupplierContact>>(
    `/suppliers/${supplierId}/contacts/${contactId}`,
  );
  return response.data;
};
