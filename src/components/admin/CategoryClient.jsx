"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2 } from "lucide-react";

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
  DialogTrigger,
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

// اسکیما اعتبارسنجی برای فرم
const formSchema = z.object({
  name: z.string().min(1, { message: "نام دسته‌بندی الزامی است." }),
});

export function CategoryClient({ initialData }) {
  const router = useRouter(); // برای رفرش کردن صفحه بعد از تغییر
  const [categories, setCategories] = useState(initialData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  // تابع رفرش داده‌ها
  const refreshData = () => {
    router.refresh();
  };

  // باز کردن فرم برای "ایجاد"
  const handleOpenCreate = () => {
    setSelectedCategory(null);
    form.reset({ name: "" });
    setErrorMessage("");
    setIsFormOpen(true);
  };

  // باز کردن فرم برای "ویرایش"
  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    form.reset({ name: category.name });
    setErrorMessage("");
    setIsFormOpen(true);
  };

  // باز کردن دیالوگ "حذف"
  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setErrorMessage("");
    setIsDeleteOpen(true);
  };

  // تابع ارسال فرم (ایجاد یا ویرایش)
  const onSubmit = async (values) => {
    setIsLoading(true);
    setErrorMessage("");
    const url = selectedCategory
      ? `/api/category/${selectedCategory.id}` // ویرایش
      : "/api/category"; // ایجاد
    const method = selectedCategory ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setIsFormOpen(false);
        refreshData(); // مهم: صفحه را رفرش می‌کند تا داده‌های جدید را از سرور بگیرد
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsLoading(false);
  };

  // تابع حذف
  const onDelete = async () => {
    if (!selectedCategory) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/category/${selectedCategory.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDeleteOpen(false);
        refreshData(); // رفرش صفحه
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      setErrorMessage("خطا در ارتباط با سرور");
    }
    setIsLoading(false);
  };

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

      {/* --- جدول نمایش --- */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام دسته‌بندی</TableHead>
              <TableHead>تعداد محصولات</TableHead>
              <TableHead className="w-[100px]">عملیات</TableHead>
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
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.productCount}</TableCell>
                  <TableCell className="flex gap-2">
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
                  disabled={isLoading}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  {isLoading ? "در حال ذخیره..." : "ذخیره"}
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
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? "در حال حذف..." : "حذف کن"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
