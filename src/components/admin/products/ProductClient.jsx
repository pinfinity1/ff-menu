"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- ایمپورت قطعات جدا شده ---
import { ProductActions } from "./ProductActions";
import { ProductList } from "./ProductList";
import { ProductForm } from "./ProductForm";
import { useRouter } from "next/navigation";

export function ProductClient({ initialProducts, initialCategories }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []); // دسته‌بندی‌ها
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- گروه‌بندی محصولات ---
  const groupedProducts = useMemo(() => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    return sortedCategories.map((category) => ({
      ...category,
      products: products
        .filter((p) => p.categoryId === category.id)
        .sort((a, b) => a.order - b.order),
    }));
  }, [categories, products]);

  // --- رفرش کردن دیتا ---
  const refreshData = async () => {
    setIsPageLoading(true);
    try {
      // 👇 دریافت همزمان محصولات و دسته‌بندی‌ها
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/category", { cache: "no-store" }),
      ]);

      if (productsRes.ok && categoriesRes.ok) {
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        setProducts(productsData);
        setCategories(categoriesData); // 👈 آپدیت استیت دسته‌بندی‌ها
        router.refresh(); // رفرش کردن کانتکست نکست
      }
    } catch (e) {
      toast.error("خطا در به‌روزرسانی لیست");
    } finally {
      setIsPageLoading(false);
    }
  };

  // --- هندل کردن فرم (افزودن/ویرایش) ---
  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = values.imageUrl;
      // آپلود عکس اگر فایل جدید باشد
      if (values.imageUrl instanceof File) {
        const formData = new FormData();
        formData.append("file", values.imageUrl);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("خطا در آپلود عکس");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.publicUrl;
      }

      // آماده‌سازی دیتا
      const payload = {
        ...values,
        imageUrl: finalImageUrl,
        price: Number(values.price),
        variants: values.variants?.map((v) => ({
          ...v,
          price: Number(v.price),
        })),
      };

      const url = selectedProduct
        ? `/api/products/${selectedProduct.id}`
        : "/api/products";
      const method = selectedProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("خطا در عملیات");

      toast.success(selectedProduct ? "ویرایش شد" : "اضافه شد");
      setIsFormOpen(false);
      refreshData();
    } catch (error) {
      toast.error(error.message || "خطایی رخ داد");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- هندل کردن حذف ---
  const handleDelete = async (product) => {
    if (!confirm(`حذف "${product.name}"؟`)) return;
    const toastId = toast.loading("در حال حذف...");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("خطا");
      toast.success("حذف شد");
      refreshData();
    } catch (error) {
      toast.error("خطا در حذف");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // --- هندل کردن درگ (Drag End) ---
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeProduct = products.find((p) => p.id === active.id);
    const overProduct = products.find((p) => p.id === over.id);

    if (
      !activeProduct ||
      !overProduct ||
      activeProduct.categoryId !== overProduct.categoryId
    )
      return;

    setProducts((current) => {
      const categoryProducts = current.filter(
        (p) => p.categoryId === activeProduct.categoryId,
      );
      const otherProducts = current.filter(
        (p) => p.categoryId !== activeProduct.categoryId,
      );

      const oldIndex = categoryProducts.findIndex((p) => p.id === active.id);
      const newIndex = categoryProducts.findIndex((p) => p.id === over.id);

      const reordered = arrayMove(categoryProducts, oldIndex, newIndex);

      // 👇 تغییر مهم: آپدیت کردن عدد order برای نمایش درست در لحظه
      const reorderedWithNewOrder = reordered.map((product, index) => ({
        ...product,
        order: index, // عدد اردر را برابر با ایندکس جدید می‌گذاریم
      }));

      // ذخیره ترتیب در سرور
      fetch("/api/products/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedIds: reorderedWithNewOrder.map((p) => p.id),
        }),
      }).catch(() => toast.error("خطا در ذخیره ترتیب"));

      // بازگرداندن آرایه ترکیبی با اردرهای اصلاح شده
      return [...otherProducts, ...reorderedWithNewOrder];
    });
  };

  const handleOpenCreate = (catId = null) => {
    setSelectedProduct(null);
    setActiveCategoryId(catId ? String(catId) : null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setActiveCategoryId(null); // در حالت ویرایش نیازی به این استیت نیست
    setIsFormOpen(true);
  };

  if (!mounted) {
    return null; // یا می‌توانید یک اسکلتون لودینگ ساده بگذارید
  }

  return (
    <>
      {/* 1. دکمه‌ها (اکشن بار) */}
      <ProductActions
        onAddProduct={() => {
          setSelectedProduct(null);
          setIsFormOpen(true);
        }}
        onRefresh={refreshData}
        onExport={() => (window.location.href = "/api/export")}
        isPageLoading={isPageLoading}
      />

      {/* 2. لیست محصولات (شامل جدول و درگ اند دراپ) */}
      <ProductList
        groupedProducts={groupedProducts}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onDragEnd={handleDragEnd}
        onAddInCategory={(id) => handleOpenCreate(id)}
      />

      {/* 3. مودال فرم */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-full h-full sm:h-auto sm:max-w-lg p-0 overflow-y-auto m-0 sm:m-auto rounded-none sm:rounded-lg">
          <DialogHeader className="p-4 border-b bg-gray-50">
            <DialogTitle>
              {selectedProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 pb-20 sm:pb-4">
            <ProductForm
              defaultValues={
                selectedProduct
                  ? {
                      ...selectedProduct,
                      categoryId: String(selectedProduct.categoryId),
                      variants: selectedProduct.variants || [],
                    }
                  : activeCategoryId
                    ? { categoryId: activeCategoryId, price: 0, variants: [] }
                    : undefined
              }
              categories={categories}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
