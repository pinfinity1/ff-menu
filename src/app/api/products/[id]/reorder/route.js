// src/app/api/products/reorder/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(request) {
  try {
    const { orderedIds } = await request.json();

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json({ message: "دیتای نامعتبر" }, { status: 400 });
    }

    // آپدیت گروهی و سریع
    const transaction = orderedIds.map((id, index) =>
      prisma.product.update({
        where: { id: id },
        data: { order: index },
      })
    );

    await prisma.$transaction(transaction);

    return NextResponse.json({ message: "ترتیب ذخیره شد" }, { status: 200 });
  } catch (error) {
    console.error("Product Reorder Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
