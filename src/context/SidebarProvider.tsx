import React, { createContext, useContext, useMemo } from "react";
import { useSidebarStore } from "@/store/sidebarStore";

interface SidebarContextValue {
  isExpanded: boolean;
  setExpanded: (value: boolean) => void;
  toggleExpanded: () => void;
  currentRoute: string | null;
  setCurrentRoute: (path: string) => void;
  allowRestore: boolean;
  setAllowRestore: (value: boolean) => void;
  restoreStateIfAllowed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined,
);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = useSidebarStore();

  const value = useMemo(
    () => ({
      isExpanded: store.isExpanded,
      setExpanded: store.setExpanded,
      toggleExpanded: store.toggleExpanded,
      currentRoute: store.currentRoute,
      setCurrentRoute: store.setCurrentRoute,
      allowRestore: store.allowRestore,
      setAllowRestore: store.setAllowRestore,
      restoreStateIfAllowed: store.restoreStateIfAllowed,
    }),
    [
      store.isExpanded,
      store.setExpanded,
      store.toggleExpanded,
      store.currentRoute,
      store.setCurrentRoute,
      store.allowRestore,
      store.setAllowRestore,
      store.restoreStateIfAllowed,
    ],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextValue => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
};
