// src/lib/s3.js
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// ۱. کلاینت S3 را یکبار در اینجا تعریف می‌کنیم
export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT_INTERNAL, // http://minio:9000
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

// ۲. متغیرهای باکت و URL عمومی را export می‌کنیم
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
export const NEXT_PUBLIC_S3_PUBLIC_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;

// ۳. تابع کمکی برای حذف فایل می‌سازیم
export async function deleteFileFromS3(fileUrl) {
  // اگر URL وجود نداشت یا همان عکس پیش‌فرض بود، کاری انجام نده
  if (!fileUrl || fileUrl === "/images/icon.png") {
    return;
  }

  try {
    // نام فایل را از URL کامل استخراج می‌کنیم
    // "http://minio:9000/ff-menu-images/FILENAME.jpg" -> "FILENAME.jpg"
    const fileName = fileUrl.split("/").pop();

    if (!fileName) return;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(deleteCommand);
    console.log(`Successfully deleted ${fileName} from S3`);
  } catch (error) {
    // اگر فایل در S3 نبود یا خطایی رخ داد، فقط آن را لاگ می‌زنیم
    // و اجازه می‌دهیم ادامه عملیات (مثل حذف از دیتابیس) انجام شود
    console.error("Error deleting file from S3:", error);
  }
}
