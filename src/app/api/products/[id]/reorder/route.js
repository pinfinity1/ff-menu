import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function swapOrder(productA, productB) {
  return prisma.$transaction([
    prisma.product.update({
      where: { id: productA.id },
      data: { order: productB.order },
    }),
    prisma.product.update({
      where: { id: productB.id },
      data: { order: productA.order },
    }),
  ]);
}

export async function PATCH(request, { params }) {
  try {
    const id = parseInt(params.id);
    const { direction } = await request.json();

    const productA = await prisma.product.findUnique({ where: { id: id } });
    if (!productA) {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    let productB;
    if (direction === "up") {
      productB = await prisma.product.findFirst({
        where: {
          order: { lt: productA.order },
          categoryId: productA.categoryId,
        },
        orderBy: { order: "desc" },
      });
    } else if (direction === "down") {
      productB = await prisma.product.findFirst({
        where: {
          order: { gt: productA.order },
          categoryId: productA.categoryId,
        },
        orderBy: { order: "asc" },
      });
    }

    if (productB) {
      await swapOrder(productA, productB);
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
