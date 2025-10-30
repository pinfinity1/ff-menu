"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; //

// اسکیما اعتبارسنجی برای فرم محصول
const formSchema = z.object({
  name: z.string().min(1, { message: "نام محصول الزامی است." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "قیمت باید معتبر باشد." }),
  categoryId: z.string().min(1, { message: "انتخاب دسته‌بندی الزامی است." }),
  imageUrl: z
    .string()
    .url({ message: "آدرس عکس معتبر نیست." })
    .optional()
    .or(z.literal("")),
});

export function ProductClient({ initialProducts, categories }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const refreshData = () => {
    router.refresh();
  };

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
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
      categoryId: String(product.categoryId), // تبدیل ID به رشته برای Select
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

  const onSubmit = async (values) => {
    setIsLoading(true);
    setErrorMessage("");

    // اطمینان از اینکه imageUrl خالی، به عنوان پیش‌فرض ارسال شود
    const data = {
      ...values,
      imageUrl: values.imageUrl || "/images/icon.png", //
    };

    const url = selectedProduct
      ? `/api/products/${selectedProduct.id}`
      : "/api/products";
    const method = selectedProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    setIsLoading(false);
  };

  const onDelete = async () => {
    if (!selectedProduct) return;
    setIsLoading(true);
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
    setIsLoading(false);
  };

  // تابع کمکی برای فرمت قیمت
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleOpenCreate}
          className="bg-brand-primary hover:bg-brand-primary/90"
        >
          <Plus className="ml-2 h-4 w-4" />
          افزودن محصول
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">عکس</TableHead>
              <TableHead>نام محصول</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>قیمت (تومان)</TableHead>
              <TableHead className="w-[100px]">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  هیچ محصولی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.imageUrl || "/images/icon.png"} //
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleOpenDelete(product)}
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
                      defaultValue={field.value}
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
                    <FormLabel>آدرس عکس (اختیاری)</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        placeholder="https://.../image.png"
                        {...field}
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
