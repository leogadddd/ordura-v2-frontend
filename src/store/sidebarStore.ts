import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isExpanded: boolean;
  currentRoute: string | null;
  allowRestore: boolean;
  setExpanded: (value: boolean) => void;
  toggleExpanded: () => void;
  setCurrentRoute: (path: string) => void;
  setAllowRestore: (value: boolean) => void;
  restoreStateIfAllowed: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isExpanded: false,
      currentRoute: null,
      allowRestore: false,
      setExpanded: (value: boolean) => set({ isExpanded: value }),
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setCurrentRoute: (path: string) => set({ currentRoute: path }),
      setAllowRestore: (value: boolean) => set({ allowRestore: value }),
      restoreStateIfAllowed: () => {
        if (!get().allowRestore) return;
        // Since persist handles loading, this might not be needed, but kept for compatibility
        // The persisted state is already loaded by zustand
      },
    }),
    {
      name: "ui.sidebar",
      partialize: (state) => ({
        isExpanded: state.isExpanded,
        currentRoute: state.currentRoute,
        // allowRestore not persisted, defaults to false
      }),
    },
  ),
);
