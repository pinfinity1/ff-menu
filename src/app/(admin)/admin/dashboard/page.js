import { cookies } from "next/headers";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button";

function getUser() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie);
  } catch (error) {
    return null;
  }
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">خوش آمدید</h1>
      <p className="text-muted-foreground">
        از اینجا می‌توانید منوی رستوران را مدیریت کنید.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>مدیریت دسته‌بندی‌ها</CardTitle>
            <CardDescription>
              ایجاد، ویرایش یا حذف دسته‌بندی‌های منو (مثل پیتزا، برگر، نوشیدنی).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              <Link href="/admin/categories">برو به دسته‌بندی‌ها</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مدیریت محصولات</CardTitle>
            <CardDescription>
              اضافه کردن، ویرایش یا حذف محصولات از هر دسته‌بندی.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* --- اصلاح رنگ دکمه --- */}
            <Button
              asChild
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              <Link href="/admin/products">برو به محصولات</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
