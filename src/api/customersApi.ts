import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export type CustomerGender =
  | "MALE"
  | "FEMALE"
  | "NON_BINARY"
  | "PREFER_NOT_TO_SAY";

export type AllergySeverity = "UNKNOWN" | "MILD" | "MODERATE" | "SEVERE";

export interface CustomerEmergencyContact {
  id: string;
  name: string;
  relationship?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  isPrimary: boolean;
}

export interface CustomerFoodAllergy {
  id: string;
  allergen: string;
  severity: AllergySeverity;
  reaction?: string | null;
  notes?: string | null;
  isActive: boolean;
}

export interface CustomerTag {
  id: string;
  label: string;
}

export interface CustomerMetrics {
  id: string;
  firstTransactionAt?: string | null;
  lastTransactionAt?: string | null;
  ordersCount: number;
  salesTransactionsCount: number;
  cancelledOrdersCount: number;
  refundsCount: number;
  lifetimeSpend: number;
  avgOrderValue: number;
}

export interface Customer {
  id: string;
  customerNumber: string;
  isActive: boolean;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  suffix?: string | null;
  gender?: CustomerGender | null;
  dateOfBirth?: string | null;
  occupation?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;

  emergencyContacts?: CustomerEmergencyContact[];
  foodAllergies?: CustomerFoodAllergy[];
  tags?: CustomerTag[];
  metrics?: CustomerMetrics | null;
}

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface ListCustomersData {
  items: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ListCustomersResponse = ApiResponse<ListCustomersData>;
export type CustomerResponse = ApiResponse<{ customer: Customer }>;

export type CustomerDetailsResponse = ApiResponse<{
  customer: Customer;
  analytics?: any;
  recentSalesTransactions?: any[];
}>;

export const getCustomers = async (
  params?: ListCustomersParams,
): Promise<ListCustomersResponse> => {
  const response = await apiClient.get("/customers", { params });
  return response.data;
};

export const getCustomer = async (id: string): Promise<CustomerDetailsResponse> => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: any): Promise<CustomerResponse> => {
  const response = await apiClient.post(`/customers`, data);
  return response.data;
};

export const updateCustomer = async (
  id: string,
  data: any,
): Promise<CustomerResponse> => {
  const response = await apiClient.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await apiClient.delete(`/customers/${id}`);
  return response.data;
};
