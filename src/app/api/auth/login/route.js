import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: "نام کاربری و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // ۲. رمز عبور ورودی را با هش ذخیره شده در دیتابیس مقایسه کنید
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // اگر رمز عبور اشتباه بود
      return NextResponse.json(
        { message: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // لاگین موفق بود
    const sessionData = {
      userId: user.id,
      username: user.username,
      isLoggedIn: true,
    };

    // تنظیم کوکی امن httpOnly
    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 روز
      path: "/",
    });

    return NextResponse.json({ message: "ورود موفق" }, { status: 200 });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
