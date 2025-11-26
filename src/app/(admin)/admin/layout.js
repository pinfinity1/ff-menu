import Link from "next/link";
import Image from "next/image";
import { Home, Package, Folder, Menu } from "lucide-react";
import { LogoutButton } from "@/components/admin/LogoutButton";
import Logo from "@/public/images/icon.png";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const NavLinks = () => (
  <nav className="flex flex-col gap-2 p-4 text-sm font-medium">
    <div className="flex items-center gap-3 px-2 mb-6 mt-2">
      <Image
        src={Logo}
        alt="لوگو"
        width={40}
        height={40}
        className="rounded-full shadow-sm"
      />
      <span className="text-lg font-bold text-gray-800">پنل مدیریت</span>
    </div>

    <Link
      href="/admin/dashboard"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
    >
      <Home className="h-5 w-5" />
      داشبورد
    </Link>
    <Link
      href="/admin/categories"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
    >
      <Folder className="h-5 w-5" />
      مدیریت دسته‌بندی‌ها
    </Link>
    <Link
      href="/admin/products"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
    >
      <Package className="h-5 w-5" />
      مدیریت محصولات
    </Link>
  </nav>
);

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-picoopic">
      {/* سایدبار دسکتاپ */}
      <aside className="hidden w-64 border-l bg-white shadow-sm sm:block fixed inset-y-0 right-0 z-20">
        <NavLinks />
        <div className="absolute bottom-4 w-full px-4">
          {/* اینجا می‌توان دکمه خروج را هم اضافه کرد */}
        </div>
      </aside>

      <div className="flex flex-col w-full sm:pr-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white/80 backdrop-blur px-4 sm:px-6 shadow-sm">
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">باز کردن منو</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64 p-0 bg-white font-picoopic"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>منو</SheetTitle>
                  <SheetDescription>ناوبری</SheetDescription>
                </SheetHeader>
                <NavLinks />
              </SheetContent>
            </Sheet>
          </div>

          {/* نمایش لوگو در موبایل */}
          <div className="flex items-center gap-2 sm:hidden">
            <span className="font-bold text-gray-700">گرین فست‌فود</span>
          </div>

          <div className="mr-auto flex items-center gap-2">
            <LogoutButton />
          </div>
        </header>

        {/* محتوای اصلی صفحات */}
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
