import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface UserStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  totalProductsSold: number;
  accountCreatedDate: string;
  lastLoginDate?: string;
}

export interface RoleDetails {
  id: string;
  name: string;
  permissions: any[]; // JSON field for permissions
}

export interface AccountInfo {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roleDetails?: RoleDetails;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AccountData {
  user: AccountInfo;
  stats: UserStats;
}

export type AccountResponse = ApiResponse<AccountData>;

const ACCOUNT_API_BASE = "/auth";

export const getAccountData = async (): Promise<AccountResponse> => {
  const response = await apiClient.get(`${ACCOUNT_API_BASE}/account-info`);
  return response.data;
};

export const updateAccountInfo = async (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): Promise<ApiResponse<AccountInfo>> => {
  const response = await apiClient.put(
    `${ACCOUNT_API_BASE}/update-profile`,
    data
  );
  return response.data;
};
