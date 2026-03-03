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

export interface AccountRole {
  id: string;
  name: string;
}

export interface AccountProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role?: AccountRole | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface RecentSale {
  id: string;
  status: string;
  createdAt: string;
  grandTotal: number;
  itemsQuantity: number;
}

export interface AccountData {
  profile: AccountProfile;
  stats: UserStats;
  recentSales: RecentSale[];
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
}): Promise<
  ApiResponse<{
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: { id: string; name: string } | null;
    permissions?: string[];
  }>
> => {
  const response = await apiClient.put(
    `${ACCOUNT_API_BASE}/update-profile`,
    data,
  );
  return response.data;
};
