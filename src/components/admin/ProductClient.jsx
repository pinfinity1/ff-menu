"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Upload,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "./ImageUploader";

// اسکیمای اعتبارسنجی
const formSchema = z.object({
  name: z.string().min(1, { message: "نام محصول الزامی است." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "قیمت باید معتبر باشد." }),
  categoryId: z.string().min(1, { message: "انتخاب دسته‌بندی الزامی است." }),
  imageUrl: z.union([
    z.string().optional().or(z.literal("")),
    z.instanceof(File).optional(),
  ]),
});

// تابع تبدیل اعداد فارسی به انگلیسی
const normalizeNumber = (value) => {
  if (!value) return "";
  return value
    .toString()
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

export function ProductClient({ initialProducts, initialCategories }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      imageUrl: "",
    },
  });

  const fetchData = useCallback(async () => {
    if (!isSubmitting) setIsPageLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/category", { cache: "no-store" }),
      ]);
      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to fetch data");
      }
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      setErrorMessage("خطا در بارگیری داده‌ها");
    } finally {
      setIsPageLoading(false);
    }
  }, [isSubmitting]);

  const refreshData = () => {
    fetchData();
  };

  const groupedProducts = useMemo(() => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    return sortedCategories.map((category) => ({
      ...category,
      products: products
        .filter((p) => p.categoryId === category.id)
        .sort((a, b) => a.order - b.order),
    }));
  }, [categories, products]);

  // --- باز کردن فرم ایجاد (با قابلیت انتخاب خودکار دسته) ---
  const handleOpenCreate = (defaultCategoryId = null) => {
    setSelectedProduct(null);
    form.reset({
      name: "",
      description: "",
      price: "",
      // اگر آیدی دسته پاس داده شد، آن را ست کن
      categoryId: defaultCategoryId
        ? String(defaultCategoryId)
        : categories[0]?.id
        ? String(categories[0].id)
        : "",
      imageUrl: "",
    });
    setErrorMessage("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      categoryId: String(product.categoryId),
      imageUrl: product.imageUrl || "",
    });
    setErrorMessage("");
    setIsFormOpen(true);
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setErrorMessage("");
    setIsDeleteOpen(true);
  };

  // تابع آپلود عکس در سرور
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("خطا در آپلود فایل");
      const res = await response.json();
      return res.publicUrl;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setErrorMessage("");

    let uploadedImageUrl = null;

    try {
      let finalImageUrl = values.imageUrl;

      // ۱. اگر فایل جدید آپلود شده باشد
      if (values.imageUrl instanceof File) {
        finalImageUrl = await uploadFile(values.imageUrl);
        uploadedImageUrl = finalImageUrl;
      }
      // ۲. نکته مهم: اگر مقدار رشته خالی باشد، یعنی کاربر عکس را حذف کرده
      // پس همان "" را می‌فرستیم تا در دیتابیس جایگزین شود.
      else if (typeof values.imageUrl === "string") {
        finalImageUrl = values.imageUrl;
      }

      const productData = {
        ...values,
        imageUrl: finalImageUrl,
      };

      const url = selectedProduct
        ? `/api/products/${selectedProduct.id}`
        : "/api/products";
      const method = selectedProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        setIsFormOpen(false);
        refreshData();
      } else {
        // رول‌بک: اگر دیتابیس خطا داد، عکس آپلود شده را پاک کن
        if (uploadedImageUrl) {
          await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: uploadedImageUrl }),
          });
        }
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      if (uploadedImageUrl) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: uploadedImageUrl }),
        });
      }
      setErrorMessage(error.message || "خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  // --- هندلر آپلود فایل اکسل ---
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // بررسی پسوند فایل
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert("لطفاً فقط فایل اکسل انتخاب کنید.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        refreshData();
      } else {
        alert("خطا: " + result.message);
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsImporting(false);
      e.target.value = ""; // پاک کردن اینپوت برای استفاده مجدد
    }
  };

  const onDelete = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteOpen(false);
        refreshData();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  const handleReorder = async (productId, direction) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: direction }),
      });
      if (res.ok) {
        refreshData();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطا در جابجایی");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fa-IR").format(Number(price));
  };

  return (
    <>
      <div className="flex justify-end mb-6 gap-3">
        {/* --- دکمه ورود از اکسل --- */}
        <div className="relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            disabled={isImporting || isPageLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="انتخاب فایل اکسل"
          />
          <Button
            variant="outline"
            className="bg-white text-green-700 border-green-600 hover:bg-green-50 h-11 px-4 transition-colors"
            disabled={isImporting || isPageLoading}
          >
            {isImporting ? (
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            ) : (
              <Upload className="ml-2 h-5 w-5" />
            )}
            <span>{isImporting ? "در حال پردازش..." : "ورود از اکسل"}</span>
          </Button>
        </div>

        {/* دکمه افزودن محصول (عمومی) */}
        <Button
          onClick={() => handleOpenCreate()}
          disabled={categories.length === 0 || isImporting}
          className="bg-brand-primary hover:bg-brand-primary-dark shadow-lg shadow-brand-primary/20 text-white h-11 px-6 transition-all"
        >
          <Plus className="ml-2 h-5 w-5" />
          افزودن محصول جدید
        </Button>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        {isPageLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p>در حال به‌روزرسانی لیست...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="w-20 text-right">عکس</TableHead>
                <TableHead className="text-right">نام محصول</TableHead>
                <TableHead className="text-right">قیمت</TableHead>
                <TableHead className="text-left pl-6">عملیات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {groupedProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-32 text-gray-500"
                  >
                    هیچ دسته‌بندی یا محصولی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                groupedProducts.map((category) => (
                  <React.Fragment key={category.id}>
                    {/* --- ردیف عنوان دسته‌بندی با دکمه افزودن اختصاصی --- */}
                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-t border-b-0">
                      <TableCell colSpan={4} className="py-2 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                            <span className="font-bold text-gray-800 text-lg">
                              {category.name}
                            </span>
                          </div>

                          {/* دکمه "افزودن به این دسته" */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary/10 h-8 px-3 text-xs font-medium transition-colors border border-brand-primary/20"
                            onClick={() => handleOpenCreate(category.id)}
                          >
                            <Plus className="ml-1 h-3.5 w-3.5" />
                            افزودن به این دسته
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {category.products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-gray-400 py-4 text-sm border-b-0"
                        >
                          (خالی)
                        </TableCell>
                      </TableRow>
                    ) : (
                      category.products.map((product, index) => (
                        <TableRow
                          key={product.id}
                          className="hover:bg-gray-50/50 transition-colors border-b-gray-100"
                        >
                          <TableCell>
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                              {/* شرط اصلاح‌شده برای ادمین */}
                              {product.imageUrl &&
                              product.imageUrl !== "/images/icon.png" ? (
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                // اینجا می‌توانید از ImagePlaceholder استفاده کنید یا
                                // اگر می‌خواهید ساده باشد، فقط یک عکس آیکون معمولی بگذارید
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center p-2 opacity-50">
                                  <Image
                                    src="/images/icon.png"
                                    alt="default"
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-700 text-base">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-gray-600 font-mono text-base">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell className="flex gap-2 justify-end items-center h-16">
                            <div className="flex items-center bg-gray-100 rounded-lg p-1 ml-3">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-7 w-7 hover:bg-white rounded-md"
                                onClick={() => handleReorder(product.id, "up")}
                                disabled={isSubmitting || index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-7 w-7 hover:bg-white rounded-md"
                                onClick={() =>
                                  handleReorder(product.id, "down")
                                }
                                disabled={
                                  isSubmitting ||
                                  index === category.products.length - 1
                                }
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleOpenEdit(product)}
                              disabled={isSubmitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleOpenDelete(product)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* --- دیالوگ فرم (ایجاد/ویرایش) --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto font-picoopic">
          <DialogHeader>
            <DialogTitle className="text-right pr-4 border-r-4 border-brand-primary rounded-sm text-xl">
              {selectedProduct ? "ویرایش محصول" : "ایجاد محصول جدید"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 mt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام محصول</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثلا: پیتزا مخصوص"
                          {...field}
                          className="bg-gray-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>دسته‌بندی</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        dir="rtl"
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-50">
                            <SelectValue placeholder="انتخاب کنید" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>قیمت (تومان)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="250000"
                        {...field}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const normalized = normalizeNumber(rawValue);
                          const numericValue = normalized.replace(
                            /[^0-9]/g,
                            ""
                          );
                          field.onChange(numericValue);
                        }}
                        className="bg-gray-50 font-mono text-left"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محتویات / توضیحات</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="مثلا: سوسیس، کالباس، قارچ، فلفل دلمه‌ای..."
                        {...field}
                        className="bg-gray-50 min-h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تصویر محصول</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value}
                        onFileChange={field.onChange}
                        onRemove={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMessage && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 text-center">
                  {errorMessage}
                </div>
              )}

              <DialogFooter className="gap-2 pt-4 border-t mt-6">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="h-11 px-6"
                  >
                    لغو
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary-dark h-11 px-8"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "ذخیره تغییرات"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- دیالوگ حذف --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] font-picoopic">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              حذف محصول
            </DialogTitle>
            <DialogDescription className="pt-3 leading-7 text-right">
              آیا از حذف محصول
              <span className="font-bold text-gray-900 mx-1 border-b border-gray-300">
                "{selectedProduct?.name}"
              </span>
              مطمئن هستید؟
              <br />
              این عملیات غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
              {errorMessage}
            </p>
          )}
          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="flex-1"
              >
                انصراف
              </Button>
            </DialogClose>
            <Button
              onClick={onDelete}
              disabled={isSubmitting}
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "بله، حذف کن"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
