import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto"; // برای ساخت نام فایل تصادفی

// ۱. راه‌اندازی کلاینت S3 (که به MinIO وصل می‌شود)
// این اطلاعات از فایل .env خوانده می‌شوند
const s3Client = new S3Client({
  region: "auto", // برای MinIO/R2 مهم نیست اما لازم است
  endpoint: process.env.S3_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // مهم: MinIO به این نیاز دارد
});

// تابع برای ساخت نام فایل منحصر به فرد
const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export async function POST(request) {
  try {
    const { fileType, fileSize } = await request.json();

    // اعتبارسنجی ساده
    if (!fileType || !fileSize) {
      return NextResponse.json(
        { message: "نوع فایل و حجم فایل الزامی است" },
        { status: 400 }
      );
    }

    // (می‌توانید اینجا حجم فایل یا نوع آن را محدود کنید)
    // if (fileSize > 1024 * 1024 * 5) { // 5MB limit
    //   return NextResponse.json({ message: "حجم فایل زیاد است" }, { status: 400 });
    // }

    const fileExtension = fileType.split("/")[1];
    const fileName = generateFileName() + "." + fileExtension;

    // ۲. ساخت دستور آپلود
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName, // نام فایل در باکت
      ContentType: fileType, // نوع فایل
      ContentLength: fileSize, // حجم فایل
    });

    // ۳. ساخت لینک آپلود امن (Presigned URL)
    // این لینک به کلاینت اجازه می‌دهد مستقیماً به MinIO آپلود کند
    const signedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 60, // لینک تا ۶۰ ثانیه معتبر است
    });

    // ۴. آدرس عمومی فایل پس از آپلود
    // این همان آدرسی است که در دیتابیس ذخیره خواهیم کرد
    const publicFileUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      signedUrl: signedUrl,
      publicUrl: publicFileUrl, // این آدرس را در فرم استفاده خواهیم کرد
    });
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
