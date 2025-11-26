/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // اگر متغیر محیطی IMAGE_UNOPTIMIZED برابر "true" بود، بهینه‌سازی را خاموش کن (برای لوکال داکر)
    // در غیر این صورت (روی سرور)، بهینه‌سازی روشن باشد.
    unoptimized: process.env.NEXT_PUBLIC_IMAGE_UNOPTIMIZED === "true",

    remotePatterns: [
      {
        protocol: "http",
        hostname: "minio", // برای شبکه داخلی داکر
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "localhost", // برای سیستم خودت
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1", // محض اطمینان
        port: "9000",
      },
      // --- قسمت مربوط به سرور واقعی ---
      // اینجا آی‌پی یا دامنه سرور را اضافه می‌کنیم تا همیشه آماده باشد
      // (حتی اگر الان استفاده نشود، بودنش ضرری ندارد)
      {
        protocol: "http",
        hostname: "YOUR_SERVER_IP_OR_DOMAIN", // <--- آی‌پی سرور را اینجا بنویسید
        port: "9000",
      },
    ],
  },
};

export default nextConfig;
