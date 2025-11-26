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
    <div className="sticky top-4 z-40 mx-auto w-full max-w-[98%] md:max-w-full my-4">
      <div
        className="
        flex items-center gap-2 px-2 py-2 
        overflow-x-auto no-scrollbar
        bg-white/80 backdrop-blur-xl 
        border border-gray-200 shadow-lg shadow-black/5
        rounded-2xl
      "
      >
        {categories?.map((category) => {
          return <HeaderItems key={category.id} categoryDetail={category} />;
        })}
      </div>
    </div>
  );
};
