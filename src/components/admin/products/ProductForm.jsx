// src/components/admin/products/ProductForm.jsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageUploader } from "../ImageUploader"; // آدرس را چک کنید
import { useEffect } from "react";

// اسکیما (Validation)
const formSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است"),
  imageUrl: z.any().optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "نام سایز"),
        price: z.coerce.number().min(0),
      }),
    )
    .optional(),
});

export function ProductForm({
  defaultValues,
  categories,
  onSubmit,
  isSubmitting,
  onCancel,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      imageUrl: "",
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // ریست کردن فرم وقتی محصول تغییر میکند
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        {/* نام و دسته‌بندی */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام محصول</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                    <SelectTrigger>
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

        {/* قیمت (اگر و فقط اگر سایز بندی نباشد) */}
        {fields.length === 0 && (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قیمت (تومان)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    className="font-mono text-left"
                    dir="ltr"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* بخش مدیریت سایزها */}
        <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700">
              تنوع قیمت / سایز
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", price: "" })}
              className="h-8 text-xs"
            >
              <Plus className="w-3 h-3 ml-1" /> افزودن
            </Button>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <FormField
                  control={form.control}
                  name={`variants.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-[2]">
                      <FormControl>
                        <Input
                          placeholder="نام (کوچک)"
                          {...field}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="flex-[3]">
                      <FormControl>
                        <Input
                          placeholder="قیمت"
                          type="number"
                          {...field}
                          className="h-8 text-sm font-mono text-left"
                          dir="ltr"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="h-8 w-8 text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* آپلود عکس */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصویر</FormLabel>
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

        {/* دکمه‌ها (چسبیده به پایین در موبایل) */}
        <div className="flex gap-3 pt-4 border-t mt-4 sticky bottom-0 bg-white pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            لغو
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-primary hover:bg-brand-primary-dark"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "ذخیره"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
