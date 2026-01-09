import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/response";

export interface FulfillmentTypeOption {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type FulfillmentTypeListResponse = ApiResponse<FulfillmentTypeOption[]>;

export const getFulfillmentTypes = async (
  includeInactive: boolean = false
): Promise<FulfillmentTypeListResponse> => {
  const response = await apiClient.get("/options/fulfillment-types", {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return response.data;
};
