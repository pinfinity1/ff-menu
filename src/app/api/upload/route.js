// file: src/app/api/upload/route.js
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT_INTERNAL, // http://minio:9000
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

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
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(putCommand);

    const publicUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "خطای سرور هنگام آپلود" },
      { status: 500 }
    );
  }
}
