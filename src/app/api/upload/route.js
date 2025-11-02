import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { s3Client, S3_BUCKET_NAME, NEXT_PUBLIC_S3_PUBLIC_URL } from "@/lib/s3";

const generateFileName = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

export async function POST(request) {
  try {
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

    await s3Client.send(putCommand); // <-- از کلاینت ایمپورت شده

    const publicUrl = `${NEXT_PUBLIC_S3_PUBLIC_URL}/${fileName}`; // <-- از متغیر ایمپورت شده

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "خطای سرور هنگام آپلود" },
      { status: 500 }
    );
  }
}
