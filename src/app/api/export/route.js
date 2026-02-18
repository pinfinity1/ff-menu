import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    });

    const exportData = products.map((product) => {
      let priceDisplay = "";

      if (product.variants && product.variants.length > 0) {
        priceDisplay = product.variants
          .map((v) => `${v.name}: ${Number(v.price).toLocaleString("fa-IR")}`)
          .join(" | ");
      } else {
        priceDisplay = Number(product.price || 0).toLocaleString("fa-IR");
      }

      return {
        شناسه: product.id,
        "نام محصول": product.name,
        دسته‌بندی: product.category ? product.category.name : "بدون دسته",
        قیمت: priceDisplay,
        توضیحات: product.description || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // تنظیم عرض ستون‌ها
    worksheet["!cols"] = [
      { wch: 5 }, // ID
      { wch: 20 }, // Name
      { wch: 15 }, // Category
      { wch: 40 }, // Price (چون رشته طولانی می‌شود عرض را زیاد کردیم)
      { wch: 40 }, // Description
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "لیست محصولات");

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="menu_products.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json(
      { message: "Error exporting data" },
      { status: 500 },
    );
  }
}
