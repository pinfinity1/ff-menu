// src/app/api/import/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "هیچ فایلی آپلود نشد." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // فرض می‌کنیم داده‌ها در اولین شیت هستند
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { message: "فایل اکسل خالی است." },
        { status: 400 }
      );
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of jsonData) {
      // 1. اعتبارسنجی: نام، قیمت و دسته‌بندی اجباری هستند
      if (!row.name || row.price === undefined || !row.category) continue;

      const categoryName = String(row.category).trim();
      const productName = String(row.name).trim();
      const productPrice = Number(row.price);
      const productDesc = row.description ? String(row.description) : "";

      // 2. پیدا کردن یا ساختن دسته‌بندی
      let category = await prisma.category.findFirst({
        where: { name: categoryName },
      });

      if (!category) {
        const lastCat = await prisma.category.findFirst({
          orderBy: { order: "desc" },
        });
        const newOrder = lastCat ? lastCat.order + 1 : 1;

        category = await prisma.category.create({
          data: {
            name: categoryName,
            order: newOrder,
          },
        });
      }

      // 3. بررسی وجود محصول
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: productName,
          categoryId: category.id,
        },
      });

      if (existingProduct) {
        // --- حالت آپدیت هوشمند ---
        // فقط قیمت و توضیحات را آپدیت می‌کنیم، عکس دست‌نخورده می‌ماند
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            price: productPrice,
            description: productDesc,
            // imageUrl را اینجا نمی‌آوریم تا عکس قبلی حفظ شود
          },
        });
        updatedCount++;
      } else {
        // --- حالت ایجاد محصول جدید ---
        const lastProd = await prisma.product.findFirst({
          where: { categoryId: category.id },
          orderBy: { order: "desc" },
        });
        const newProdOrder = lastProd ? lastProd.order + 1 : 1;

        await prisma.product.create({
          data: {
            name: productName,
            price: productPrice,
            description: productDesc,
            categoryId: category.id,
            order: newProdOrder,
            imageUrl: "/images/icon.png", // عکس پیش‌فرض برای محصول جدید از اکسل
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      message: `عملیات موفق: ${createdCount} محصول جدید اضافه شد و ${updatedCount} محصول بروزرسانی شد.`,
    });
  } catch (error) {
    console.error("Excel Import Error:", error);
    return NextResponse.json(
      { message: "خطا در پردازش فایل اکسل." },
      { status: 500 }
    );
  }
}
