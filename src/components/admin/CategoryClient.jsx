"use client";

import { useCallback, useState } from "react";
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

const formSchema = z.object({
  name: z.string().min(1, { message: "نام دسته‌بندی الزامی است." }),
});

export function CategoryClient({ initialData }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialData || []);
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

  const fetchCategories = useCallback(async () => {
    if (!isSubmitting) setIsPageLoading(true);
    try {
      const res = await fetch("/api/category", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      setErrorMessage("خطا در بارگیری دسته‌بندی‌ها");
    } finally {
      setIsPageLoading(false);
    }
  }, [isSubmitting]);

  const refreshData = () => {
    fetchCategories();
  };

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

  const handleReorder = async (categoryId, direction) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/category/${categoryId}/reorder`, {
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

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button
          onClick={handleOpenCreate}
          className="bg-brand-primary hover:bg-brand-primary-dark shadow-lg shadow-brand-primary/20 text-white transition-all"
        >
          <Plus className="ml-2 h-4 w-4" />
          افزودن دسته‌بندی جدید
        </Button>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        {isPageLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p>در حال به‌روزرسانی...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="text-right">نام دسته‌بندی</TableHead>
                <TableHead className="text-center">تعداد محصولات</TableHead>
                <TableHead className="text-left pl-6">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-24 text-gray-500"
                  >
                    هنوز هیچ دسته‌بندی ایجاد نشده است.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-800 text-lg">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
                        {category.productCount}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <div className="flex items-center bg-gray-100 rounded-lg p-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 hover:bg-white hover:text-black rounded-md"
                          onClick={() => handleReorder(category.id, "up")}
                          disabled={isSubmitting || index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 hover:bg-white hover:text-black rounded-md"
                          onClick={() => handleReorder(category.id, "down")}
                          disabled={
                            isSubmitting || index === categories.length - 1
                          }
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => handleOpenEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
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

      {/* --- دیالوگ فرم --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] font-picoopic">
          <DialogHeader>
            <DialogTitle className="text-right pr-4 border-r-4 border-brand-primary rounded-sm">
              {selectedCategory
                ? "ویرایش نام دسته‌بندی"
                : "ساخت دسته‌بندی جدید"}
            </DialogTitle>
            <DialogDescription className="text-right pt-2">
              {selectedCategory
                ? "نام جدید را وارد کنید و دکمه ذخیره را بزنید."
                : "یک نام برای گروه محصولات (مثل پیتزا، نوشیدنی) انتخاب کنید."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثلا: برگر ذغالی"
                        {...field}
                        className="h-11 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errorMessage && (
                <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">
                  {errorMessage}
                </p>
              )}
              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-10">
                    انصراف
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary-dark h-10 min-w-[100px]"
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

      {/* --- دیالوگ حذف --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] font-picoopic">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              حذف دسته‌بندی
            </DialogTitle>
            <DialogDescription className="pt-3 leading-6 text-right">
              آیا مطمئن هستید که می‌خواهید
              <span className="font-bold text-gray-900 mx-1">
                "{selectedCategory?.name}"
              </span>
              را حذف کنید؟
              <br />
              <span className="text-xs text-gray-500 mt-2 block bg-gray-100 p-2 rounded">
                نکته: فقط دسته‌بندی‌هایی که هیچ محصولی ندارند قابل حذف هستند.
              </span>
            </DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 mt-2">
              {errorMessage}
            </p>
          )}
          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                لغو
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
