// file: src/app/api/products/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // ایمپورت Prisma

export async function GET() {
  try {
    // گرفتن محصولات همراه با نام دسته‌بندی آن‌ها (با استفاده از relation)
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true }, // فقط نام دسته‌بندی را انتخاب کن
        },
      },
      // (اختیاری) مرتب‌سازی بر اساس ID
      orderBy: {
        id: "asc",
      },
    });

    // فرمت‌دهی داده‌ها برای کامپوننت ProductClient
    const formattedProducts = products.map((product) => ({
      ...product,
      categoryName: product.category.name,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // اعتبارسنجی ساده
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

    const newProduct = await prisma.product.create({
      data: productData,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
