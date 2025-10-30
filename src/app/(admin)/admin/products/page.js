import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProductClient } from "@/components/admin/ProductClient"; // می‌سازیم

// تابع واکشی داده‌ها در سرور
async function getData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // ۱. واکشی لیست محصولات
  const productsRes = await fetch(`${baseUrl}/api/products`, {
    cache: "no-store",
  });
  const products = await productsRes.json();

  // ۲. واکشی لیست دسته‌بندی‌ها (برای فرم)
  const categoriesRes = await fetch(`${baseUrl}/api/category`, {
    cache: "no-store",
  });
  const categories = await categoriesRes.json();

  return { products, categories };
}

export default async function ProductsPage() {
  const { products, categories } = await getData();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">مدیریت محصولات</h1>

      <Card>
        <CardHeader>
          <CardTitle>لیست محصولات</CardTitle>
          <CardDescription>
            محصولات منوی خود را اینجا اضافه، ویرایش یا حذف کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductClient initialProducts={products} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
