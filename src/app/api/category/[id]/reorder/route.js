// file: src/app/api/category/[id]/reorder/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// تابع کمکی برای جابجایی
async function swapOrder(categoryA, categoryB) {
  // از transaction استفاده می‌کنیم تا مطمئن شویم هر دو آپدیت با هم انجام می‌شوند
  return prisma.$transaction([
    prisma.category.update({
      where: { id: categoryA.id },
      data: { order: categoryB.order },
    }),
    prisma.category.update({
      where: { id: categoryB.id },
      data: { order: categoryA.order },
    }),
  ]);
}

export async function PATCH(request, { params }) {
  try {
    const { direction } = await request.json(); // "up" or "down"
    const id = parseInt(params.id);

    const categoryA = await prisma.category.findUnique({ where: { id: id } });
    if (!categoryA) {
      return NextResponse.json(
        { message: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    let categoryB;
    if (direction === "up") {
      // پیدا کردن نزدیک‌ترین دسته‌بندی با order کمتر
      categoryB = await prisma.category.findFirst({
        where: { order: { lt: categoryA.order } },
        orderBy: { order: "desc" },
      });
    } else if (direction === "down") {
      // پیدا کردن نزدیک‌ترین دسته‌بندی با order بیشتر
      categoryB = await prisma.category.findFirst({
        where: { order: { gt: categoryA.order } },
        orderBy: { order: "asc" },
      });
    }

    // اگر categoryB وجود داشت (یعنی در ابتدا یا انتهای لیست نبود)، آن‌ها را جابجا کن
    if (categoryB) {
      await swapOrder(categoryA, categoryB);
    }

    return NextResponse.json({ message: "ترتیب به‌روز شد" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
