import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export type AuthResponse = ApiResponse<{ user: User }>;

const AUTH_API_BASE = "/auth";

// Login
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await apiClient.post(`${AUTH_API_BASE}/login`, credentials);
  // Tokens are stored in httpOnly cookies by the backend
  return response.data;
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post(`${AUTH_API_BASE}/register`, data);
  // Tokens are stored in httpOnly cookies by the backend
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  await apiClient.post(`${AUTH_API_BASE}/logout`);
  // Cookies are cleared by the backend
};

// Refresh token
export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await apiClient.post(`${AUTH_API_BASE}/refresh`);
  // New tokens are stored in httpOnly cookies by the backend
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await apiClient.get(`${AUTH_API_BASE}/me`);
  return response.data;
};
