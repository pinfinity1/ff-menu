"use client";

import { usePublicStore } from "@/app/store/publicStore";
import { HeaderItems } from "./HeaderItems";
import { useEffect } from "react";

export const Header = ({ categories }) => {
  const setCategory = usePublicStore((state) => state.setCategory);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories, setCategory]);

  return (
    <div className="w-full sticky top-6 z-30 flex  items-center gap-3 px-3 py-4 mt-5 mb-8 rounded-md overflow-x-auto bg-brand-primary/20 backdrop-blur drop-shadow-md shadow-lg">
      {categories?.map((category) => {
        return <HeaderItems key={category.id} categoryDetail={category} />;
      })}
    </div>
  );
};
