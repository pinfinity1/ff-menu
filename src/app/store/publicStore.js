import { create } from "zustand";

export const usePublicStore = create((set) => ({
  category: undefined,
  setCategory: (newCategory) => set({ category: newCategory }),
}));
