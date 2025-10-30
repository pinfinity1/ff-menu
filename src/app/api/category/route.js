import { NextResponse } from "next/server";
import { getCategories, addCategory, getFullCategories } from "@/lib/mock-db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eager = searchParams.get("eager");

    let data;
    if (eager === "true") {
      data = getFullCategories(); //
    } else {
      data = getCategories(); // برای پنل ادمین
    }

    return NextResponse.json(data);
  } catch (error) {
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
    const newCategory = addCategory(name);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
