import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFileFromS3 } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        variants: {
          orderBy: { price: "asc" },
        },
      },
    });

    if (product) {
      return NextResponse.json(product);
    }
    return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    // 1. استخراج داده‌ها از بدنه درخواست
    const { name, description, price, categoryId, imageUrl, variants } = data;

    // 2. منطق اصلاح قیمت: اگر محصول سایزبندی (Variant) دارد، قیمت اصلی را 0 می‌گذاریم
    // این کار باعث می‌شود در دیتابیس قیمت قدیمی باقی نماند
    const finalPrice = variants && variants.length > 0 ? 0 : Number(price || 0);

    if (!name || !categoryId) {
      return NextResponse.json(
        { message: "فیلدهای اجباری ناقص هستند" },
        { status: 400 },
      );
    }

    // بررسی و حذف عکس قدیمی از S3 (لاجیک قبلی شما که درست بود)
    const oldProduct = await prisma.product.findUnique({
      where: { id: id },
      select: { imageUrl: true },
    });

    if (
      oldProduct &&
      oldProduct.imageUrl !== imageUrl &&
      oldProduct.imageUrl !== "/images/icon.png"
    ) {
      await deleteFileFromS3(oldProduct.imageUrl);
    }

    // 3. اجرای تراکنش برای آپدیت همزمان محصول و سایزها
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: id },
        data: {
          name,
          description,
          price: finalPrice, // 👈 استفاده از قیمت اصلاح شده
          categoryId: parseInt(categoryId),
          imageUrl: imageUrl || "/images/icon.png",
        },
      });

      // مدیریت سایزها (Variants)
      if (variants && Array.isArray(variants)) {
        // حذف سایزهای قبلی
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        // ایجاد سایزهای جدید
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v) => ({
              productId: id,
              name: v.name,
              price: Number(v.price), // تبدیل به عدد برای جلوگیری از ارور Decimal
            })),
          });
        }
      }

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const productToDelete = await prisma.product.findUnique({
      where: { id: id },
      select: { imageUrl: true },
    });

    if (!productToDelete) {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: id },
    });

    if (productToDelete.imageUrl) {
      await deleteFileFromS3(productToDelete.imageUrl);
    }

    return NextResponse.json({ message: "محصول حذف شد" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
