import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface ListRolesData {
  items: Role[];
}

export type ListRolesResponse = ApiResponse<ListRolesData>;
export type RoleResponse = ApiResponse<Role>;

// List roles
export const getRolesList = async (): Promise<ListRolesResponse> => {
  const response = await apiClient.get("/roles");
  return response.data;
};

export const getRole = async (id: string): Promise<RoleResponse> => {
  const response = await apiClient.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (data: {
  name: string;
  description?: string;
  permissions?: string[];
}): Promise<RoleResponse> => {
  const response = await apiClient.post("/roles", data);
  return response.data;
};

export const updateRole = async (
  id: string,
  data: {
    name?: string;
    description?: string | null;
    permissions?: string[];
    isActive?: boolean;
  }
): Promise<RoleResponse> => {
  const response = await apiClient.put(`/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await apiClient.delete(`/roles/${id}`);
  return response.data;
};

export default {
  getRolesList,
  getRole,
  createRole,
  updateRole,
  deleteRole,
};
