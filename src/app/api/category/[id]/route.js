import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// (تابع GET بدون تغییر)
export async function GET(request, { params }) {
  try {
    const { id: paramId } = await params; // <--- باید await شود
    const id = parseInt(paramId);
    const category = await prisma.category.findUnique({
      where: { id: id },
    });

    if (category) {
      return NextResponse.json(category);
    }
    return NextResponse.json(
      { message: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ویرایش یک دسته‌بندی
export async function PUT(request, { params }) {
  try {
    // --- راه‌حل: خطوط را جابجا می‌کنیم ---
    // ۱. ابتدا request را مصرف می‌کنیم
    const { name } = await request.json();
    // ۲. سپس به params دسترسی پیدا می‌کنیم
    const { id: paramId } = await params; // <--- باید await شود
    const id = parseInt(paramId);
    // -------------------------------------

    if (!name) {
      return NextResponse.json({ message: "نام الزامی است" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: { name: name },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// حذف یک دسته‌بندی
export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params; // <--- باید await شود
    const id = parseInt(paramId);

    await prisma.category.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "دسته‌بندی حذف شد" }, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error.code === "P2003") {
      return NextResponse.json(
        { message: "این دسته‌بندی دارای محصول است و قابل حذف نیست." },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
