import { NextResponse } from "next/server";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

// تابع احراز هویت (حتما باید async باشد)
async function isAuthenticated() {
  const cookieStore = await cookies(); // <--- این خط مشکل را حل می‌کند
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return false;
  try {
    const session = JSON.parse(sessionCookie);
    return !!session.username;
  } catch (e) {
    return false;
  }
}

export async function POST(request) {
  // ۱. بررسی لاگین
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "فایلی ارسال نشده است" },
        { status: 400 }
      );
    }

    // ۲. آماده‌سازی فایل
    const buffer = Buffer.from(await file.arrayBuffer());
    // نرمال‌سازی نام فایل (استفاده از uuid برای جلوگیری از تکرار)
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // ۳. دریافت نام باکت از متغیرهای محیطی
    const bucketName = process.env.S3_BUCKET_NAME;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    // ۴. ارسال به MinIO
    await s3Client.send(new PutObjectCommand(uploadParams));

    // ۵. ساخت لینک نمایش عکس
    // اگر آدرس پابلیک در env ست شده باشد، از آن استفاده می‌کنیم
    const publicUrlBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;

    // حذف اسلش آخر اگر وجود داشت
    const baseUrl = publicUrlBase ? publicUrlBase.replace(/\/$/, "") : "";
    const fileUrl = `${baseUrl}/${fileName}`;

    return NextResponse.json({ publicUrl: fileUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "خطا در آپلود فایل: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (!url)
      return NextResponse.json(
        { message: "آدرس فایل الزامی است" },
        { status: 400 }
      );

    // استخراج نام فایل از URL
    const fileName = url.split("/").pop();
    const bucketName = process.env.S3_BUCKET_NAME;

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      })
    );

    return NextResponse.json({ message: "فایل حذف شد" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: "خطا در حذف فایل" }, { status: 500 });
  }
}
