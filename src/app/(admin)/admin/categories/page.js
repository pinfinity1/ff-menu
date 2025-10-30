import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CategoryClient } from "@/components/admin/CategoryClient"; // این کامپوننت را در قدم بعد می‌سازیم

// تابع برای گرفتن داده‌ها در سرور
async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    // ما از API خودمان داده‌ها را می‌گیریم
    const res = await fetch(`${baseUrl}/api/category`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  // ۱. داده‌ها در سرور گرفته می‌شوند
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت دسته‌بندی‌ها</h1>
        {/* دکمه افزودن جدید در کلاینت کامپوننت خواهد بود */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست دسته‌بندی‌ها</CardTitle>
          <CardDescription>
            دسته‌بندی‌های منوی خود را اینجا اضافه، ویرایش یا حذف کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ۲. داده‌ها به کلاینت کامپوننت پاس داده می‌شوند */}
          <CategoryClient initialData={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
