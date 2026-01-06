export type ResponseStatus = "success" | "error" | "validation_error";

export interface ApiResponse<T = any> {
  status: ResponseStatus;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

/**
 * Check if response indicates success
 */
export function isSuccess(response: ApiResponse): boolean {
  return response.status === "success";
}

/**
 * Check if response indicates a validation error
 */
export function isValidationError(response: ApiResponse): boolean {
  return response.status === "validation_error";
}

/**
 * Get error message from response
 */
export function getErrorMessage(response: ApiResponse): string {
  return response.message || "An error occurred";
}

/**
 * Get validation errors from response
 */
export function getValidationErrors(
  response: ApiResponse
): Record<string, string[]> {
  return response.errors || {};
}

/**
 * Get data from response with optional fallback
 */
export function getData<T>(response: ApiResponse, fallback?: T): T | undefined {
  return (response.data as T) || fallback;
}
