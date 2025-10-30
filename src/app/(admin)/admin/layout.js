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
} from "@/components/ui/sheet"; //

const NavLinks = () => (
  <nav className="flex flex-col gap-4 p-4 text-sm font-medium">
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-brand-primary transition-all"
    >
      <Image src={Logo} alt="لوگو" width={32} height={32} />
      <span className="text-lg font-bold">پنل مدیریت</span>
    </Link>
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-brand-primary"
    >
      <Home className="h-4 w-4" />
      داشبورد
    </Link>
    <Link
      href="/admin/categories"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-brand-primary"
    >
      <Folder className="h-4 w-4" />
      مدیریت دسته‌بندی‌ها
    </Link>
    <Link
      href="/admin/products"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-brand-primary"
    >
      <Package className="h-4 w-4" />
      مدیریت محصولات
    </Link>
  </nav>
);

export default function AdminLayout({ children }) {
  return (
    <div className="light flex min-h-screen w-full flex-col">
      <aside className="fixed inset-y-0 right-0 z-10 hidden w-60 flex-col border-l bg-secondary sm:flex">
        <NavLinks />
      </aside>

      <div className="flex flex-col sm:pr-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4  sm:px-6">
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">باز کردن منو</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-xs bg-secondary"
              >
                <SheetHeader>
                  <SheetTitle className="sr-only">منوی اصلی</SheetTitle>
                  <SheetDescription className="sr-only">
                    لینک‌های ناوبری پنل مدیریت
                  </SheetDescription>
                </SheetHeader>
                <NavLinks />
              </SheetContent>
            </Sheet>
          </div>

          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-brand-primary transition-all"
          >
            <Image src={Logo} alt="لوگو" width={32} height={32} />
            <span className="text-lg font-bold">پنل مدیریت</span>
          </Link>

          <LogoutButton />
        </header>

        <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
