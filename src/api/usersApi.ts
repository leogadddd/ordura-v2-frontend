import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  roleDetails?: { id: string; name: string } | null;
  isActive?: boolean;
  createdAt?: string;
  // Optional per-user overrides (name + isAllowed)
  permissions?: { name: string; isAllowed: boolean }[];
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  roleId?: string;
  isActive?: boolean;
  search?: string;
}

export interface ListUsersData {
  items: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ListUsersResponse = ApiResponse<ListUsersData>;
export type UserResponse = ApiResponse<{ user: User }>;

export const getUsers = async (
  params?: ListUsersParams
): Promise<ListUsersResponse> => {
  const response = await apiClient.get("/users", { params });
  return response.data;
};

export const getUser = async (id: string): Promise<UserResponse> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: any): Promise<UserResponse> => {
  const response = await apiClient.post(`/users`, data);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: any
): Promise<UserResponse> => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

export const changePassword = async (
  id: string,
  body: { newPassword: string }
) => {
  const response = await apiClient.post(`/users/${id}/password`, body);
  return response.data;
};
