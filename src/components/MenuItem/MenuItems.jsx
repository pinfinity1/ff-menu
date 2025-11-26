"use client";
import { usePublicStore } from "@/app/store/publicStore";
import dynamic from "next/dynamic";

// لودینگ اسکلتی برای خود کامپوننت کارت (زمانی که ایمپورت داینامیک طول می‌کشد)
const MenuItemCard = dynamic(() => import("./MenuItemCard"), {
  ssr: false,
  loading: () => (
    <div className="h-24 md:h-64 w-full rounded-xl bg-gray-200 animate-pulse border border-gray-300"></div>
  ),
});

export const MenuItems = ({ subset }) => {
  const category = usePublicStore((state) => state.category);

  // --- حالت لودینگ اولیه (زمانی که هنوز دسته‌بندی ست نشده) ---
  if (!category && subset.length > 0) {
    return (
      <div className="w-full min-h-[50vh] pb-24 px-1">
        {/* ۱. اسکلت برای عنوان دسته‌بندی */}
        <div className="flex items-center gap-3 mb-6 mt-4">
          {/* خط عمودی طوسی */}
          <div className="w-1.5 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          {/* بلوک طوسی جای متن عنوان */}
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* ۲. اسکلت برای کارت‌های محصول */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 md:h-64 w-full rounded-xl bg-gray-200 animate-pulse border border-gray-200"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // --- پیدا کردن محصولات دسته انتخاب شده ---
  const categoryWithSubsets = subset.filter((item) => item.id === category?.id);
  const categoryData = categoryWithSubsets?.[0];
  const products = categoryData?.products || [];

  return (
    <div className="w-full min-h-[50vh] pb-6 px-1">
      {/* --- عنوان دسته‌بندی (واقعی) --- */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <div className="w-1.5 h-6 bg-brand-primary rounded-full shadow-sm shadow-brand-primary/40"></div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          {category?.name}
        </h2>
      </div>

      {/* --- لیست محصولات (واقعی) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {products.map((product) => {
          return <MenuItemCard key={product?.id} productDetails={product} />;
        })}
      </div>

      {/* --- حالت خالی بودن --- */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          <div className="text-lg font-medium">محصولی یافت نشد</div>
          <p className="text-sm">به زودی محصولات این دسته اضافه می‌شود.</p>
        </div>
      )}
    </div>
  );
};
