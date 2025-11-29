/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
      {
        protocol: "https",
        hostname: "files.greenfastfood.ir",
        port: "",
      },
    ],
  },
};

export default nextConfig;
