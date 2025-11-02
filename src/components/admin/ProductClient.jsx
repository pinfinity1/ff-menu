"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

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

const formSchema = z.object({
  name: z.string().min(1, { message: "نام محصول الزامی است." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "قیمت باید معتبر باشد." }),
  categoryId: z.string().min(1, { message: "انتخاب دسته‌بندی الزامی است." }),
  imageUrl: z.union([
    z
      .string()
      .url({ message: "آدرس عکس معتبر نیست." })
      .optional()
      .or(z.literal("")),
    z.instanceof(File).optional(),
  ]),
});

// کامپوننت دیگر props داده‌ای ندارد
export function ProductClient() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true); // لودینگ اولیه صفحه
  const [isSubmitting, setIsSubmitting] = useState(false); // لودینگ عملیات (فرم/حذف/جابجایی)

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

  // تابع واکشی داده‌ها (Refetch)
  const fetchData = useCallback(async () => {
    if (!isSubmitting) setIsPageLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/category"),
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

  // واکشی اولیه در زمان لود شدن کامپوننت
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // تابع refetch عمومی
  const refreshData = () => {
    fetchData();
  };

  // گروه‌بندی محصولات برای نمایش (محاسبه بهینه)
  const groupedProducts = useMemo(() => {
    // ابتدا دسته‌بندی‌ها را بر اساس order مرتب می‌کنیم
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

    return sortedCategories.map((category) => ({
      ...category,
      // سپس محصولات هر دسته‌بندی را فیلتر و مرتب می‌کنیم
      products: products
        .filter((p) => p.categoryId === category.id)
        .sort((a, b) => a.order - b.order),
    }));
  }, [categories, products]);

  // (توابع Open/Close دیالوگ‌ها - بدون تغییر)
  const handleOpenCreate = () => {
    setSelectedProduct(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      categoryId: categories[0]?.id ? String(categories[0].id) : "", // انتخاب اولین دسته‌بندی به عنوان پیش‌فرض
      imageUrl: "",
    });
    setErrorMessage("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
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

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("خطا در آپلود فایل به سرور");
      }
      const res = await response.json();
      return res.publicUrl;
    } catch (err) {
      console.error(err);
      throw err; // ارور را پرتاب می‌کنیم تا onSubmit آن را بگیرد
    }
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let finalImageUrl = "/images/icon.png"; // مقدار پیش‌فرض اگر عکسی نباشد

      // بررسی وضعیت عکس
      if (values.imageUrl instanceof File) {
        // حالت ۱: کاربر فایل جدیدی انتخاب کرده -> آن را آپلود کن
        finalImageUrl = await uploadFile(values.imageUrl);
      } else if (typeof values.imageUrl === "string" && values.imageUrl) {
        // حالت ۲: کاربر فایل قبلی را تغییر نداده -> از همان URL رشته‌ای استفاده کن
        finalImageUrl = values.imageUrl;
      }
      // حالت ۳: کاربر عکس را حذف کرده (values.imageUrl برابر "" است) -> از همان مقدار پیش‌فرض استفاده می‌شود

      const productData = {
        ...values,
        imageUrl: finalImageUrl, // URL نهایی را در دیتا قرار بده
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
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      // این خطا ممکن است از تابع uploadFile یا از fetch اصلی بیاید
      setErrorMessage(error.message || "خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  // عملیات حذف
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
        refreshData(); // <-- Refetch!
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  // عملیات تغییر ترتیب
  const handleReorder = async (productId, direction) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: direction }),
      });
      if (res.ok) {
        refreshData(); // <-- Refetch!
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطا در جابجایی");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  // تابع کمکی قیمت
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleOpenCreate}
          disabled={categories.length === 0} // دکمه غیرفعال باشد اگر دسته‌بندی وجود ندارد
          className="bg-brand-primary hover:bg-brand-primary/90"
        >
          <Plus className="ml-2 h-4 w-4" />
          افزودن محصول
        </Button>
        {isPageLoading && categories.length === 0 && (
          <p className="text-sm text-muted-foreground mr-2">
            (در حال بارگیری دسته‌بندی‌ها...)
          </p>
        )}
        {!isPageLoading && categories.length === 0 && (
          <p className="text-sm text-destructive mr-2">
            (برای افزودن محصول، ابتدا یک دسته‌بندی در صفحه دسته‌بندی‌ها ایجاد
            کنید)
          </p>
        )}
      </div>

      <div className="rounded-md border">
        {isPageLoading ? (
          // لودینگ زیبای شما
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p className="mr-2">در حال بارگیری داده‌ها...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">عکس</TableHead>
                <TableHead>نام محصول</TableHead>
                <TableHead>قیمت (تومان)</TableHead>
                <TableHead className="w-[180px]">عملیات</TableHead>
              </TableRow>
            </TableHeader>

            {/* رندر گروهی محصولات */}
            <TableBody>
              {groupedProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    هیچ دسته‌بندی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                groupedProducts.map((category) => (
                  <React.Fragment key={category.id}>
                    {/* ردیف هدر دسته‌بندی */}
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell
                        colSpan={4}
                        className="font-bold text-brand-primary-dark"
                      >
                        {category.name}
                      </TableCell>
                    </TableRow>

                    {category.products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-4"
                        >
                          هیچ محصولی در این دسته‌بندی نیست.
                        </TableCell>
                      </TableRow>
                    ) : (
                      // ردیف محصولات
                      category.products.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Image
                              src={product.imageUrl || "/images/icon.png"}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="rounded-md object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell className="flex gap-2">
                            {/* دکمه‌های ترتیب */}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReorder(product.id, "up")}
                              disabled={isSubmitting || index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReorder(product.id, "down")}
                              disabled={
                                isSubmitting ||
                                index === category.products.length - 1
                              }
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            {/* دکمه‌های قبلی */}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEdit(product)}
                              disabled={isSubmitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
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

      {/* --- دیالوگ فرم (ایجاد/ویرایش محصول) --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "ویرایش محصول" : "ایجاد محصول جدید"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام محصول</FormLabel>
                    <FormControl>
                      <Input placeholder="مثلا: پیتزا مخصوص" {...field} />
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
                      value={field.value} // از value استفاده کنید تا با form.reset هماهنگ باشد
                      dir="rtl"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="یک دسته‌بندی را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>قیمت (به تومان)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="250000" {...field} />
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
                    <FormLabel>توضیحات (محتویات)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="مثلا: ژامبون، قارچ، پنیر..."
                        {...field}
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
                    <FormLabel>عکس محصول</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value}
                        onFileChange={field.onChange} // ارسال آبجکت File به فرم
                        onRemove={field.onChange} // ارسال "" به فرم
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    لغو
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "ذخیره"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- دیالوگ تایید حذف --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>آیا از حذف مطمئن هستید؟</DialogTitle>
            <DialogDescription>
              آیا می‌خواهید محصول "{selectedProduct?.name}" را حذف کنید؟
              <br />
              <span className="font-bold text-destructive">
                توجه: این عمل غیرقابل بازگشت است.
              </span>
            </DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                لغو
              </Button>
            </DialogClose>
            <Button
              onClick={onDelete}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? "در حال حذف..." : "حذف کن"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
