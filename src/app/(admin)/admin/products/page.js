import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProductClient } from "@/components/admin/ProductClient";

export default async function ProductsPage() {
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
          <ProductClient />
        </CardContent>
      </Card>
    </div>
  );
}
