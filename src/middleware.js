import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

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
