import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/mock-db";

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const product = getProductById(id);
    if (product) {
      return NextResponse.json(product);
    }
    return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    // اعتبارسنجی ساده
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json(
        { message: "فیلدهای اجباری ناقص هستند" },
        { status: 400 }
      );
    }

    const productData = {
      ...data,
      price: parseFloat(data.price),
      categoryId: parseInt(data.categoryId),
    };

    const updated = updateProduct(id, productData);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    deleteProduct(id);
    return NextResponse.json({ message: "محصول حذف شد" });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
