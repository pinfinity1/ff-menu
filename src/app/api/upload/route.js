// file: src/app/api/upload/route.js
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// ... (تنظیمات s3Client شما دست نخورده باقی می‌ماند)
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export async function POST(request) {
  try {
    const { fileType, fileSize } = await request.json();

    if (!fileType || !fileSize) {
      return NextResponse.json(
        { message: "نوع فایل و حجم فایل الزامی است" },
        { status: 400 }
      );
    }

    const fileExtension = fileType.split("/")[1];
    const fileName = generateFileName() + "." + fileExtension;

    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const signedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 60,
    });

    // --- این قسمت مهم‌ترین تغییر است ---
    // URL ساخته شده حاوی آدرس داخلی داکر است (http://minio:9000)
    // ما باید آن را با آدرس عمومی که مرورگر می‌شناسد (http://localhost:9000) جایگزین کنیم

    // استخراج آدرس عمومی پایه (مثلا: "http://localhost:9000")
    const publicBaseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL.replace(
      `/${process.env.S3_BUCKET_NAME}`,
      ""
    );

    // جایگزینی آدرس داخلی با آدرس عمومی
    const publicFacingSignedUrl = signedUrl.replace(
      process.env.S3_ENDPOINT_URL, // "http://minio:9000"
      publicBaseUrl // "http://localhost:9000"
    );
    // ------------------------------------

    const publicFileUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      signedUrl: publicFacingSignedUrl, // <-- URL تصحیح شده را ارسال می‌کنیم
      publicUrl: publicFileUrl,
    });
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
