import { useQuery } from "@tanstack/react-query";
import {
  getSalesTransactions,
  getSalesTransaction,
  type ListSalesTransactionsParams,
} from "@/api/salesTransactionsApi";

export const salesTransactionKeys = {
  all: ["salesTransactions"] as const,
  lists: () => [...salesTransactionKeys.all, "list"] as const,
  list: (params?: ListSalesTransactionsParams) =>
    [...salesTransactionKeys.lists(), params] as const,
  details: () => [...salesTransactionKeys.all, "detail"] as const,
  detail: (id: string) => [...salesTransactionKeys.details(), id] as const,
};

export function useSalesTransactions(params?: ListSalesTransactionsParams) {
  return useQuery({
    queryKey: salesTransactionKeys.list(params),
    queryFn: () => getSalesTransactions(params),
  });
}

export function useSalesTransaction(id: string) {
  return useQuery({
    queryKey: salesTransactionKeys.detail(id),
    queryFn: () => getSalesTransaction(id),
    enabled: !!id,
  });
}
