import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

// تابع کمکی: تبدیل اعداد فارسی/عربی و حذف ویرگول به عدد انگلیسی
const parsePrice = (value) => {
  if (!value) return 0;
  const str = String(value)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)) // تبدیل فارسی
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)) // تبدیل عربی
    .replace(/,/g, "") // حذف ویرگول
    .trim();
  return Number(str) || 0;
};

// تابع کمکی: استخراج سایزها از متن (مثال: "کوچک: 100 | بزرگ: 200")
const parseVariants = (priceString) => {
  if (
    !priceString ||
    typeof priceString !== "string" ||
    !priceString.includes(":")
  ) {
    return null;
  }

  // جدا کردن بخش‌ها با کاراکتر | یا خط جدید
  const parts = priceString.split(/\||\n/);
  const variants = [];

  for (const part of parts) {
    const [name, price] = part.split(":");
    if (name && price) {
      variants.push({
        name: name.trim(),
        price: parsePrice(price),
      });
    }
  }
  return variants.length > 0 ? variants : null;
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "هیچ فایلی آپلود نشد." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { message: "فایل اکسل خالی است." },
        { status: 400 },
      );
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of jsonData) {
      // 1. نرمال‌سازی داده‌ها (پشتیبانی از هدر فارسی و انگلیسی)
      const name = (row["نام محصول"] || row["name"] || "").trim();
      const catName = (row["دسته‌بندی"] || row["category"] || "").trim();
      const rawPrice = row["قیمت"] || row["price"];
      const description = (row["توضیحات"] || row["description"] || "").trim();

      if (!name || !catName) continue;

      // 2. پردازش قیمت و واریانت‌ها
      let finalPrice = 0;
      let variantsData = null;

      // بررسی اینکه آیا قیمت حاوی واریانت است؟
      const parsedVars = parseVariants(rawPrice);
      if (parsedVars) {
        variantsData = parsedVars;
        finalPrice = 0; // برای محصولات چند قیمتی، قیمت پایه صفر است
      } else {
        finalPrice = parsePrice(rawPrice);
      }

      // 3. مدیریت دسته‌بندی
      let category = await prisma.category.findFirst({
        where: { name: catName },
      });
      if (!category) {
        const lastCat = await prisma.category.findFirst({
          orderBy: { order: "desc" },
        });
        category = await prisma.category.create({
          data: { name: catName, order: (lastCat?.order ?? 0) + 1 },
        });
      }

      // 4. ایجاد یا آپدیت محصول
      const existingProduct = await prisma.product.findFirst({
        where: { name: name, categoryId: category.id },
      });

      if (existingProduct) {
        // --- آپدیت محصول ---
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            description:
              description !== "-" ? description : existingProduct.description,
            price: finalPrice,
            // اگر در اکسل واریانت جدیدی تعریف شده باشد، قبلی‌ها پاک و جدیدها ساخته می‌شوند
            variants: variantsData
              ? {
                  deleteMany: {},
                  create: variantsData,
                }
              : undefined,
          },
        });
        updatedCount++;
      } else {
        // --- ایجاد محصول جدید ---
        const lastProd = await prisma.product.findFirst({
          where: { categoryId: category.id },
          orderBy: { order: "desc" },
        });

        await prisma.product.create({
          data: {
            name: name,
            categoryId: category.id,
            description: description !== "-" ? description : "",
            price: finalPrice,
            order: (lastProd?.order ?? 0) + 1,
            imageUrl: "/images/icon.png",
            variants: variantsData
              ? {
                  create: variantsData,
                }
              : undefined,
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      message: `عملیات موفق: ${createdCount} محصول جدید و ${updatedCount} محصول بروزرسانی شد.`,
    });
  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json(
      { message: "خطا در پردازش فایل: " + error.message },
      { status: 500 },
    );
  }
}
