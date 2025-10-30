import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // --- مدیریت احراز هویت ---
    // در دنیای واقعی، اینجا باید اطلاعات را با دیتابیس چک کنید
    // و رمز عبور را به صورت هش (Hashed) مقایسه کنید

    // مقادیر تستی موقت:
    const MOCK_USER = "admin";
    const MOCK_PASS = "admin";

    if (username === MOCK_USER && password === MOCK_PASS) {
      // لاگین موفق بود
      const sessionData = { username: username, isLoggedIn: true };

      // تنظیم کوکی امن httpOnly
      // این کوکی در مرورگر قابل خواندن نیست و از حملات XSS جلوگیری می‌کند
      cookies().set("session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // در پروداکشن HTTPS اجباری است
        maxAge: 60 * 60 * 24, // 1 روز
        path: "/", // در تمام سایت معتبر باشد
      });

      return NextResponse.json({ message: "ورود موفق" }, { status: 200 });
    } else {
      // لاگین ناموفق بود
      return NextResponse.json(
        { message: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
