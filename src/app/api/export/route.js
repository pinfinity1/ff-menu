// src/app/api/export/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ۱. دریافت تمام محصولات با نام دسته‌بندی
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        category: { order: "asc" },
      },
    });

    // ۲. تبدیل فرمت دیتا برای اکسل (دقیقا مطابق فرمتی که برای ایمپورت نیاز دارید)
    const excelData = products.map((p) => ({
      name: p.name,
      price: Number(p.price),
      category: p.category.name, // نام دسته‌بندی برای ایمپورت مهم است
      description: p.description || "",
    }));

    // ۳. ساخت ورک‌بوک اکسل
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Menu");

    // ۴. تبدیل به بافر
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // ۵. ارسال فایل برای دانلود
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="menu-backup.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json(
      { message: "خطا در تولید فایل اکسل" },
      { status: 500 }
    );
  }
}
