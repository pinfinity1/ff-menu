import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host"); // دامنه‌ای که کاربر تایپ کرده

  // --- ۱. لاجیک ساب‌دامین (جدید) ---
  // اگر کاربر با admin.domain.com آمده بود
  if (hostname && hostname.startsWith("admin.")) {
    const mainDomain = hostname.replace("admin.", ""); // حذف admin. از اول

    // هدایت به آدرس اصلی + /admin
    // مثال: admin.greenfastfood.ir -> greenfastfood.ir/admin/dashboard
    const url = new URL(
      `/admin${pathname === "/" ? "/dashboard" : pathname}`,
      `http://${mainDomain}`
    );

    // در پروداکشن حتما https استفاده می‌شود، اینجا هندل می‌کنیم:
    if (process.env.NODE_ENV === "production") {
      url.protocol = "https:";
    }

    return NextResponse.redirect(url);
  }

  // --- ۲. لاجیک احراز هویت (قبلی) ---
  const sessionCookie = request.cookies.get("session")?.value;
  let session;
  try {
    session = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch (error) {
    session = null;
  }

  const isLoggedIn = session?.isLoggedIn;
  const isAdminLoginPath = pathname === "/admin/login";

  const isProtectedAdminPath =
    pathname.startsWith("/admin") && !isAdminLoginPath;

  if (isLoggedIn && isAdminLoginPath) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (!isLoggedIn && isProtectedAdminPath) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
