"use client";

import { createContext, useState, useContext } from "react";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [category, setCategory] = useState({});

  const value = { category, setCategory };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export function useCategory() {
  return useContext(CategoryContext);
}
