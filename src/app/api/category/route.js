import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eager = searchParams.get("eager");

    let data;
    if (eager === "true") {
      data = await prisma.category.findMany({
        include: { products: true },
      });
    } else {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
      data = categories.map((c) => ({
        id: c.id,
        name: c.name,
        productCount: c._count.products,
      }));
    }

    return NextResponse.json(data);
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
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { message: "نام دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
