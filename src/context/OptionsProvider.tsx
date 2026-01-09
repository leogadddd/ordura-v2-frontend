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

interface OptionsContextValue {
  fulfillmentTypes: FulfillmentTypeOption[] | null;
  isLoadingFulfillmentTypes: boolean;
  refreshFulfillmentTypes: (opts?: {
    includeInactive?: boolean;
    force?: boolean;
  }) => Promise<FulfillmentTypeOption[]>;
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
  const [isLoadingFulfillmentTypes, setIsLoadingFulfillmentTypes] =
    useState(false);
  const inflight = useRef<Promise<FulfillmentTypeOption[]> | null>(null);

  const refreshFulfillmentTypes = async ({
    includeInactive = false,
    force = false,
  }: { includeInactive?: boolean; force?: boolean } = {}) => {
    if (!force && fulfillmentTypes && !includeInactive) {
      return fulfillmentTypes;
    }
    if (inflight.current && !force) return inflight.current;

    setIsLoadingFulfillmentTypes(true);
    const req = getFulfillmentTypes(includeInactive)
      .then((res) => {
        const data = res.data || [];
        setFulfillmentTypes(data);
        return data;
      })
      .finally(() => {
        setIsLoadingFulfillmentTypes(false);
        inflight.current = null;
      });

    inflight.current = req;
    return req;
  };

  const value = useMemo(
    () => ({
      fulfillmentTypes,
      isLoadingFulfillmentTypes,
      refreshFulfillmentTypes,
    }),
    [fulfillmentTypes, isLoadingFulfillmentTypes]
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
