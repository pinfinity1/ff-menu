import { NextResponse } from "next/server";
import { getProducts, addProduct } from "@/lib/mock-db";

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json(products);
  } catch (error) {
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

    // تبدیل مقادیر فرم
    const productData = {
      ...data,
      price: parseFloat(data.price),
      categoryId: parseInt(data.categoryId),
    };

    const newProduct = addProduct(productData);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
