// file: src/app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (product) {
      return NextResponse.json(product);
    }
    return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // ۱. ابتدا request را مصرف می‌کنیم (برای سازگاری با Next.js 15)
    const data = await request.json();
    // ۲. سپس params را می‌خوانیم
    const id = parseInt(params.id);

    // اعتبارسنجی
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json(
        { message: "فیلدهای اجباری ناقص هستند" },
        { status: 400 }
      );
    }

    const productData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      categoryId: parseInt(data.categoryId),
      imageUrl: data.imageUrl || "/images/icon.png",
    };

    const updated = await prisma.product.update({
      where: { id: id },
      data: productData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // (مصرف request برای سازگاری با Next.js 15)
    await request.text();

    const id = parseInt(params.id);

    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "محصول حذف شد" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
