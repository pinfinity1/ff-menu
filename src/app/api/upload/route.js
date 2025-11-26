import { NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"; // اضافه شدن دستور حذف
import crypto from "crypto";
import { s3Client, S3_BUCKET_NAME, NEXT_PUBLIC_S3_PUBLIC_URL } from "@/lib/s3";
import { cookies } from "next/headers";

const generateFileName = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

// تابع کمکی برای چک کردن لاگین (امنیت)
function isAuthenticated() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) return false;
  try {
    const session = JSON.parse(sessionCookie);
    return session.isLoggedIn;
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    // چک کردن امنیت (اختیاری ولی توصیه شده)
    if (!isAuthenticated()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.formData();
    const file = body.get("file");

    if (!file || !file.size || !file.type) {
      return NextResponse.json({ message: "فایل معتبر نیست" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop();
    const fileName = `${generateFileName()}.${fileExtension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(putCommand);

    const publicUrl = `${NEXT_PUBLIC_S3_PUBLIC_URL}/${fileName}`;
    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "خطای سرور هنگام آپلود" },
      { status: 500 }
    );
  }
}

// --- اضافه شدن متد DELETE برای رول‌بک ---
export async function DELETE(request) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url)
      return NextResponse.json({ message: "URL required" }, { status: 400 });

    // استخراج نام فایل از URL
    const fileName = url.split("/").pop();

    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(deleteCommand);
    return NextResponse.json({ message: "File deleted" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
