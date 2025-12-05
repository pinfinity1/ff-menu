"use client";

import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  GripVertical, // آیکون دستگیره برای کشیدن
} from "lucide-react";

// --- ایمپورت‌های DND Kit ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// --- کامپوننت سطر قابل کشیدن (Sortable Row) ---
function SortableRow({ category, onEdit, onDelete, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1, // وقتی در حال کشیدن است بالاتر قرار بگیرد
    position: "relative",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`bg-white hover:bg-gray-50 transition-colors ${
        isDragging ? "shadow-xl border-brand-primary border-2 scale-105" : ""
      }`}
    >
      {/* ستون دستگیره (Drag Handle) */}
      <TableCell className="w-10 text-center cursor-grab touch-none">
        <div {...attributes} {...listeners} className="p-2">
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-700" />
        </div>
      </TableCell>

      <TableCell className="font-medium text-gray-800 text-lg">
        {category.name}
      </TableCell>

      <TableCell className="text-center">
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
          {category.productCount || 0}
        </span>
      </TableCell>

      <TableCell className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => onEdit(category)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => onDelete(category)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// --- کامپوننت اصلی ---
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

  // سنسورها برای تشخیص کشیدن (موس و تاچ)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // باید ۸ پیکسل حرکت کند تا درگ شروع شود (جلوگیری از کلیک اشتباه)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategories = useCallback(async () => {
    // فقط برای رفرش دیتا (اختیاری)
    const res = await fetch("/api/category", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // ۱. آپدیت سریع استیت (Optimistic UI)
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // ۲. ارسال ترتیب جدید به سرور در پس‌زمینه
        saveNewOrder(newOrder);

        return newOrder;
      });
    }
  };

  const saveNewOrder = async (newItems) => {
    const orderedIds = newItems.map((item) => item.id);
    try {
      await fetch("/api/category/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      // نیازی به نمایش پیام موفقیت نیست تا حس روانی حفظ شود
    } catch (error) {
      setErrorMessage("خطا در ذخیره ترتیب جدید");
    }
  };

  // --- بقیه هندلرها (Create, Edit, Delete) مشابه قبل ---
  const handleOpenCreate = () => {
    setSelectedCategory(null);
    form.reset({ name: "" });
    setIsFormOpen(true);
  };
  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    form.reset({ name: category.name });
    setIsFormOpen(true);
  };
  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
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
        router.refresh(); // رفرش سرور کامپوننت
        fetchCategories(); // رفرش استیت داخلی
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
    try {
      const res = await fetch(`/api/category/${selectedCategory.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteOpen(false);
        setCategories(categories.filter((c) => c.id !== selectedCategory.id));
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "خطایی رخ داد");
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
          className="bg-brand-primary hover:bg-brand-primary-dark text-white"
        >
          <Plus className="ml-2 h-4 w-4" />
          افزودن دسته‌بندی جدید
        </Button>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        {isPageLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-10"></TableHead> {/* ستون دستگیره */}
                  <TableHead className="text-right">نام دسته‌بندی</TableHead>
                  <TableHead className="text-center">تعداد محصولات</TableHead>
                  <TableHead className="text-left pl-6">عملیات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <SortableContext
                  items={categories.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {categories.map((category, index) => (
                    <SortableRow
                      key={category.id}
                      category={category}
                      index={index}
                      onEdit={handleOpenEdit}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        )}
      </div>

      {/* --- دیالوگ‌های Create/Edit و Delete دقیقاً مشابه قبل هستند --- */}
      {/* برای خلوت شدن کد، کد دیالوگ‌ها که تغییری نکرده را اینجا نمی‌گذارم */}
      {/* اما شما باید کدهای Dialog فرم و حذف را که در فایل قبلی داشتید اینجا کپی کنید */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] font-picoopic">
          <DialogHeader>
            <DialogTitle className="text-right pr-4 border-r-4 border-brand-primary rounded-sm">
              {selectedCategory
                ? "ویرایش نام دسته‌بندی"
                : "ساخت دسته‌بندی جدید"}
            </DialogTitle>
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
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline">انصراف</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary-dark"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "ذخیره"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] font-picoopic">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 /> حذف دسته‌بندی
            </DialogTitle>
            <DialogDescription className="pt-3 text-right">
              آیا مطمئن هستید؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">لغو</Button>
            </DialogClose>
            <Button
              onClick={onDelete}
              disabled={isSubmitting}
              variant="destructive"
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
