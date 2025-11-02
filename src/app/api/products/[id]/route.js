import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFileFromS3 } from "@/lib/s3";

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

// تابع PUT (ویرایش) آپدیت می‌شود
export async function PUT(request, { params }) {
  try {
    const data = await request.json(); // ۱. دیتای جدید از فرم
    const id = parseInt(params.id);

    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json(
        { message: "فیلدهای اجباری ناقص هستند" },
        { status: 400 }
      );
    }

    // ۲. محصول قدیمی را از دیتابیس می‌خوانیم تا URL عکس قبلی را داشته باشیم
    const oldProduct = await prisma.product.findUnique({
      where: { id: id },
      select: { imageUrl: true }, // فقط به آدرس عکس نیاز داریم
    });

    if (!oldProduct) {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    const oldImageUrl = oldProduct.imageUrl;
    const newImageUrl = data.imageUrl;

    // ۳. بررسی می‌کنیم که آیا عکس قدیمی باید حذف شود؟
    // (یعنی عکس قدیمی وجود داشته، با عکس جدید متفاوت بوده، و عکس پیش‌فرض هم نبوده)
    if (
      oldImageUrl &&
      oldImageUrl !== newImageUrl &&
      oldImageUrl !== "/images/icon.png"
    ) {
      await deleteFileFromS3(oldImageUrl); // <-- حذف عکس قدیمی از MinIO
    }

    // ۴. آماده‌سازی دیتای نهایی
    const productData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      categoryId: parseInt(data.categoryId),
      imageUrl: newImageUrl || "/images/icon.png", // اگر عکس جدید "" بود، پیش‌فرض را بگذار
    };

    // ۵. دیتابیس را با اطلاعات جدید آپدیت می‌کنیم
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

// تابع DELETE (حذف) آپدیت می‌شود
export async function DELETE(request, { params }) {
  try {
    await request.text(); // (مصرف request برای سازگاری)
    const id = parseInt(params.id);

    // ۱. محصول را از دیتابیس می‌خوانیم تا URL عکس را داشته باشیم
    const productToDelete = await prisma.product.findUnique({
      where: { id: id },
      select: { imageUrl: true },
    });

    if (!productToDelete) {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    // ۲. ابتدا محصول را از دیتابیس حذف می‌کنیم
    await prisma.product.delete({
      where: { id: id },
    });

    // ۳. سپس عکس آن را از MinIO حذف می‌کنیم
    // (این کار را بعد از حذف دیتابیس انجام می‌دهیم تا اگر دیتابیس فیل شد، عکس الکی پاک نشود)
    await deleteFileFromS3(productToDelete.imageUrl);

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
