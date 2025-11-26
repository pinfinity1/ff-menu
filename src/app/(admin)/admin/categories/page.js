import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CategoryClient } from "@/components/admin/CategoryClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getCategoriesData() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: "asc" },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      productCount: c._count.products,
      order: c.order,
    }));
  } catch (error) {
    console.error("Failed to fetch categories data:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const initialCategories = await getCategoriesData();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          مدیریت دسته‌بندی‌ها
        </h1>
      </div>

      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>لیست دسته‌بندی‌ها</CardTitle>
          <CardDescription>
            دسته‌بندی‌های منوی خود را اینجا مدیریت کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryClient initialData={initialCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
