"use client";
import { useCategory } from "@/context/CategoryContext";
import dynamic from "next/dynamic";

const MenuItemCard = dynamic(() => import("./MenuItemCard"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full rounded-md bg-white/10 animate-pulse"></div>
  ),
});

export const MenuItems = ({ subset }) => {
  const { category } = useCategory();

  const categoryWithSubsets = subset.filter((item) => item.id === category.id);

  const categoryData = categoryWithSubsets?.[0];

  const products = categoryData?.products || [];

  return (
    <div className="w-full flex flex-col justify-center gap-3 bg-brand-primary-dark  p-3 rounded-md">
      <div className="w-full h-0.5 my-5 bg-white rounded-full relative">
        <span className="absolute right-0 -top-5 bg-white mr-4 pl-4 pr-4 py-2 rounded text-primaryDark font-bold">
          {category.name}
        </span>
      </div>
      {products.map((product) => {
        return <MenuItemCard key={product?.id} productDetails={product} />;
      })}
    </div>
  );
};
