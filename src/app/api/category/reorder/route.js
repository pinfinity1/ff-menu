// src/app/api/category/reorder/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(request) {
  try {
    const { orderedIds } = await request.json(); // لیستی از آیدی‌ها به ترتیب جدید

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json({ message: "دیتای نامعتبر" }, { status: 400 });
    }

    // استفاده از Transaction برای آپدیت همزمان و سریع
    const transaction = orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id: id },
        data: { order: index }, // ایندکس آرایه میشه ترتیب جدید (0, 1, 2, ...)
      })
    );

    await prisma.$transaction(transaction);

    return NextResponse.json({ message: "ترتیب ذخیره شد" }, { status: 200 });
  } catch (error) {
    console.error("Reorder Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
