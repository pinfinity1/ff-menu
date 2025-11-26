import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: { order: "asc" },
    });

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
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json(
        { message: "فیلدهای اجباری ناقص هستند" },
        { status: 400 }
      );
    }

    const categoryId = parseInt(data.categoryId);

    const maxOrderProduct = await prisma.product.findFirst({
      where: { categoryId: categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const newOrder = (maxOrderProduct?.order ?? 0) + 1;

    const productData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      categoryId: categoryId,
      imageUrl: data.imageUrl || "/images/icon.png",
      order: newOrder, // <-- ۳. ذخیره order جدید
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
