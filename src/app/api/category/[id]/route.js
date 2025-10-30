import { NextResponse } from "next/server";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/mock-db";

// گرفتن یک دسته‌بندی خاص
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const category = getCategoryById(id);
    if (category) {
      return NextResponse.json(category);
    }
    return NextResponse.json(
      { message: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ویرایش یک دسته‌بندی
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: "نام الزامی است" }, { status: 400 });
    }
    const updatedCategory = updateCategory(id, name);
    if (updatedCategory) {
      return NextResponse.json(updatedCategory);
    }
    return NextResponse.json(
      { message: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// حذف یک دسته‌بندی
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    deleteCategory(id);
    return NextResponse.json({ message: "دسته‌بندی حذف شد" }, { status: 200 });
  } catch (error) {
    // اگر دسته‌بندی محصول داشته باشد
    if (error.message.includes("products")) {
      return NextResponse.json(
        { message: "این دسته‌بندی دارای محصول است و قابل حذف نیست." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
