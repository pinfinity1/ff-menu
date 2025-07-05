import "./globals.css";
import Providers from "@/components/Providers/Providers";

export const metadata = {
  title: "گرین فست‌ فود",
  description: "ُاولین فست‌ فود دست‌ ساز",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
