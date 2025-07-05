"use client";

import { useCategory } from "@/context/CategoryContext";
import { HeaderItems } from "./HeaderItems";
import { useEffect } from "react";

export const Header = ({ categories }) => {
  const { setCategory } = useCategory();

  useEffect(() => {
    setCategory(categories?.[0]);
  }, []);

  return (
    <div className="w-full sticky top-6 z-30 flex  items-center gap-3 px-3 py-4 mt-5 mb-8 rounded-md overflow-x-auto bg-brand-primary/20 backdrop-blur drop-shadow-md shadow-lg">
      {categories?.map((category) => {
        return <HeaderItems key={category.id} categoryDetail={category} />;
      })}
    </div>
  );
};
