"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// اسکیما اعتبارسنجی برای فرم (بدون تغییر)
const formSchema = z.object({
  name: z.string().min(1, { message: "نام دسته‌بندی الزامی است." }),
});

// --- ۱. دریافت initialData به عنوان prop ---
export function CategoryClient({ initialData }) {
  const router = useRouter();

  // --- ۲. استفاده از initialData برای مقداردهی اولیه state ---
  const [categories, setCategories] = useState(initialData || []);

  // --- ۳. لودینگ اولیه حالا false است، چون داده‌ها آماده‌اند ---
  const [isPageLoading, setIsPageLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  // --- این تابع حالا فقط برای *رفرش* کردن داده‌ها استفاده می‌شود ---
  const fetchCategories = useCallback(async () => {
    // فقط اگر در حال ارسال فرم نیستیم، لودینگ رفرش را نشان بده
    if (!isSubmitting) setIsPageLoading(true);

    try {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      setErrorMessage("خطا در بارگیری دسته‌بندی‌ها");
    } finally {
      setIsPageLoading(false);
    }
  }, [isSubmitting]); // وابستگی به fetchCategories حذف شد

  const refreshData = () => {
    fetchCategories();
  };

  // --- توابع Handlers (بدون تغییر) ---
  const handleOpenCreate = () => {
    setSelectedCategory(null);
    form.reset({ name: "" });
    setErrorMessage("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    form.reset({ name: category.name });
    setErrorMessage("");
    setIsFormOpen(true);
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setErrorMessage("");
    setIsDeleteOpen(true);
  };

  // --- توابع عملیاتی (بدون تغییر، چون از قبل refreshData را صدا می‌زدند) ---
  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setErrorMessage("");
    const url = selectedCategory
      ? `/api/category/${selectedCategory.id}`
      : "/api/category";
    const method = selectedCategory ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setIsFormOpen(false);
        refreshData(); // فراخوانی رفرش
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  const onDelete = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/category/${selectedCategory.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDeleteOpen(false);
        refreshData(); // فراخوانی رفرش
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  const handleReorder = async (categoryId, direction) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/category/${categoryId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: direction }),
      });

      if (res.ok) {
        refreshData(); // فراخوانی رفرش
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطا در جابجایی");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsSubmitting(false);
  };

  // --- JSX (کاملاً بدون تغییر) ---
  // (لودینگ isPageLoading حالا فقط موقع رفرش نمایش داده می‌شود)
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleOpenCreate}
          className="bg-brand-primary hover:bg-brand-primary/90"
        >
          <Plus className="ml-2 h-4 w-4" />
          افزودن دسته‌بندی
        </Button>
      </div>

      <div className="rounded-md border">
        {isPageLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p className="mr-2">در حال بارگیری داده‌ها...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام دسته‌بندی</TableHead>
                <TableHead>تعداد محصولات</TableHead>
                <TableHead className="w-[180px]">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    هیچ دسته‌بندی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.productCount}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleReorder(category.id, "up")}
                        disabled={isSubmitting || index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleReorder(category.id, "down")}
                        disabled={
                          isSubmitting || index === categories.length - 1
                        }
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleOpenDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* --- دیالوگ فرم (ایجاد/ویرایش) --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? `شما در حال ویرایش "${selectedCategory.name}" هستید.`
                : "لطفا نام دسته‌بندی جدید را وارد کنید."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام دسته‌بندی</FormLabel>
                    <FormControl>
                      <Input placeholder="مثلا: پیتزاها" {...field} />
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
                  <Button type="button" variant="outline">
                    لغو
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
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
              آیا می‌خواهید دسته‌بندی "{selectedCategory?.name}" را حذف کنید؟
              <br />
              <span className="font-bold text-destructive">
                توجه: این عمل غیرقابل بازگشت است. فقط دسته‌بندی‌های خالی (بدون
                محصول) قابل حذف هستند.
              </span>
            </DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
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
