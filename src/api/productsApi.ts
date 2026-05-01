import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";
import type { InventoryItem } from "@/api/inventoryApi";

export interface ProductIngredient {
  id: string;
  productId: string;
  inventoryItemId: string;
  quantity: number;
  inventoryItem?: InventoryItem;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  notes?: string;
  cost: number;
  sellingPrice: number;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  isDraft: boolean;
  requiresFulfillment: boolean;
  fulfillmentTypeId?: string;
  ingredients?: ProductIngredient[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductIngredientData {
  inventoryItemId: string;
  quantity: number;
}

export interface CreateProductData {
  name: string;
  category: string;
  description?: string;
  notes?: string;
  cost: number;
  sellingPrice: number;
  isDraft?: boolean;
  requiresFulfillment?: boolean;
  fulfillmentTypeId?: string;
  ingredients?: ProductIngredientData[];
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  description?: string;
  notes?: string;
  cost?: number;
  sellingPrice?: number;
  status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  isDraft?: boolean;
  requiresFulfillment?: boolean;
  fulfillmentTypeId?: string | null;
  ingredients?: ProductIngredientData[];
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  includeDrafts?: boolean;
}

export interface ListProductsData {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ListProductsResponse = ApiResponse<ListProductsData>;
export type ProductResponse = ApiResponse<Product>;

// Get all products with filters
export const getProducts = async (
  params?: ListProductsParams,
): Promise<ListProductsResponse> => {
  const response = await apiClient.get("/products", { params });
  return response.data;
};

// Get single product
export const getProduct = async (id: string): Promise<ProductResponse> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

// Create product
export const createProduct = async (
  data: CreateProductData,
): Promise<ProductResponse> => {
  const response = await apiClient.post("/products", data);
  return response.data;
};

// Update product
export const updateProduct = async (
  id: string,
  data: UpdateProductData,
): Promise<ProductResponse> => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

// Delete product (soft delete)
export const deleteProduct = async (id: string): Promise<ApiResponse> => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};
