import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier,
  fetchSupplierContacts,
  createSupplierContact,
  updateSupplierContact,
  deleteSupplierContact,
  type SupplierPayload,
} from "@/api/suppliersApi";

export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params?: { search?: string; isActive?: boolean }) =>
    [...supplierKeys.lists(), params ?? {}] as const,
  contacts: (supplierId: string) =>
    [...supplierKeys.all, "contacts", supplierId] as const,
};

export function useSuppliers(params?: { search?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => fetchSuppliers(params),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierPayload) => createSupplier(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierPayload }) =>
      updateSupplier(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

export function useSupplierContacts(supplierId: string) {
  return useQuery({
    queryKey: supplierKeys.contacts(supplierId),
    queryFn: () => fetchSupplierContacts(supplierId),
    enabled: !!supplierId,
  });
}

export function useCreateSupplierContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, data }: { supplierId: string; data: any }) =>
      createSupplierContact(supplierId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: supplierKeys.contacts(vars.supplierId),
      });
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

export function useUpdateSupplierContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      supplierId,
      contactId,
      data,
    }: {
      supplierId: string;
      contactId: string;
      data: any;
    }) => updateSupplierContact(supplierId, contactId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: supplierKeys.contacts(vars.supplierId),
      });
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

export function useDeleteSupplierContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      supplierId,
      contactId,
    }: {
      supplierId: string;
      contactId: string;
    }) => deleteSupplierContact(supplierId, contactId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: supplierKeys.contacts(vars.supplierId),
      });
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}
