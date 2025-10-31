/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000", // پورت MinIO
        pathname: "/ff-menu-images/**", // نام باکت شما
      },
      // (در اینجا می‌توانید آدرس IP سرور نهایی خود را نیز اضافه کنید)
      // {
      //   protocol: "http",
      //   hostname: "YOUR_SERVER_IP",
      //   port: "9000",
      //   pathname: "/ff-menu-images/**",
      // }
    ],
  },
};

export default nextConfig;
