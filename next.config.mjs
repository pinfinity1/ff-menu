/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
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
  async rewrites() {
    return [
      {
        source: "/storage/:path*",
        destination: "http://minio:9000/menu/:path*",
      },
    ];
  },
};

export default nextConfig;
