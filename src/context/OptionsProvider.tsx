import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getFulfillmentTypes,
  type FulfillmentTypeOption,
} from "@/api/optionsApi";
import { getRoles, type Role } from "@/api/authApi";

interface OptionsContextValue {
  fulfillmentTypes: FulfillmentTypeOption[] | null;
  roles: Role[] | null;
  isLoadingFulfillmentTypes: boolean;
  isLoadingRoles: boolean;
  refreshFulfillmentTypes: (opts?: {
    includeInactive?: boolean;
    force?: boolean;
  }) => Promise<FulfillmentTypeOption[]>;
  refreshRoles: (opts?: { force?: boolean }) => Promise<Role[]>;
}

const OptionsContext = createContext<OptionsContextValue | undefined>(
  undefined
);

export const OptionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fulfillmentTypes, setFulfillmentTypes] = useState<
    FulfillmentTypeOption[] | null
  >(null);
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [isLoadingFulfillmentTypes, setIsLoadingFulfillmentTypes] =
    useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const fulfillmentInflight = useRef<Promise<FulfillmentTypeOption[]> | null>(
    null
  );
  const rolesInflight = useRef<Promise<Role[]> | null>(null);

  const refreshFulfillmentTypes = async ({
    includeInactive = false,
    force = false,
  }: { includeInactive?: boolean; force?: boolean } = {}) => {
    if (!force && fulfillmentTypes && !includeInactive) {
      return fulfillmentTypes;
    }
    if (fulfillmentInflight.current && !force)
      return fulfillmentInflight.current;

    setIsLoadingFulfillmentTypes(true);
    const req = getFulfillmentTypes(includeInactive)
      .then((res) => {
        const data = res.data || [];
        setFulfillmentTypes(data);
        return data;
      })
      .finally(() => {
        setIsLoadingFulfillmentTypes(false);
        fulfillmentInflight.current = null;
      });

    fulfillmentInflight.current = req;
    return req;
  };

  const refreshRoles = async ({ force = false }: { force?: boolean } = {}) => {
    if (!force && roles) {
      return roles;
    }
    if (rolesInflight.current && !force) return rolesInflight.current;

    setIsLoadingRoles(true);
    const req = getRoles()
      .then((res) => {
        const data = res.data || [];
        setRoles(data);
        return data;
      })
      .finally(() => {
        setIsLoadingRoles(false);
        rolesInflight.current = null;
      });

    rolesInflight.current = req;
    return req;
  };

  const value = useMemo(
    () => ({
      fulfillmentTypes,
      roles,
      isLoadingFulfillmentTypes,
      isLoadingRoles,
      refreshFulfillmentTypes,
      refreshRoles,
    }),
    [fulfillmentTypes, roles, isLoadingFulfillmentTypes, isLoadingRoles]
  );

  return (
    <OptionsContext.Provider value={value}>{children}</OptionsContext.Provider>
  );
};

export const useOptions = (): OptionsContextValue => {
  const ctx = useContext(OptionsContext);
  if (!ctx) {
    throw new Error("useOptions must be used within an OptionsProvider");
  }
  return ctx;
};
