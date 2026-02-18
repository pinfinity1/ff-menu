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
        variants: {
          orderBy: { price: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    const formattedProducts = products.map((product) => ({
      ...product,
      categoryName: product.category.name,
      hasVariants: product.variants.length > 0,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.categoryId) {
      return NextResponse.json(
        { message: "فیلدهای اجباری ناقص هستند" },
        { status: 400 },
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
      categoryId: categoryId,
      imageUrl: data.imageUrl || "/images/icon.png",
      order: newOrder,
      price: parseFloat(data.price || 0),
    };

    if (
      data.variants &&
      Array.isArray(data.variants) &&
      data.variants.length > 0
    ) {
      productData.variants = {
        create: data.variants.map((v) => ({
          name: v.name,
          price: parseFloat(v.price),
        })),
      };
    }

    const newProduct = await prisma.product.create({
      data: productData,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
