import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { ProductClient } from "@/components/admin/products/ProductClient";
export const dynamic = "force-dynamic";

async function getProductsData() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true },
        },
        variants: {
          orderBy: { price: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return products.map((product) => ({
      ...product,
      price: Number(product.price),
      categoryName: product.category.name,
      // 👇 تبدیل قیمت سایزها به عدد (برای جلوگیری از ارور Decimal)
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
    }));
  } catch (error) {
    console.error("Failed to fetch products data:", error);
    return [];
  }
}

async function getCategoriesData() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      order: c.order,
    }));
  } catch (error) {
    console.error("Failed to fetch categories data:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const [initialProducts, initialCategories] = await Promise.all([
    getProductsData(),
    getCategoriesData(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-800">مدیریت محصولات</h1>

      <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>لیست محصولات</CardTitle>
          <CardDescription>
            محصولات منوی خود را اینجا اضافه، ویرایش یا حذف کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <ProductClient
            initialProducts={initialProducts}
            initialCategories={initialCategories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
