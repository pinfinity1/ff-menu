import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "فست فود سبز",
  description: "اولین فست فود دست ساز استان🌱",
  keywords: [
    "فست فود",
    "شهرکرد",
    "فست فود سبز",
    "سالم",
    "دست ساز",
    "پیتزا",
    "برگر",
    "سفارش آنلاین غذا",
  ],
  openGraph: {
    title: "فست فود سبز",
    description: "بهترین فست فود دست‌ساز در شهرکرد.",
    url: "https://greenfastfood.ir",
    siteName: "فست فود سبز",
    locale: "fa_IR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`antialiased bg-gray-50 text-gray-900 min-h-screen`}>
        {children}
        <Toaster
          toastOptions={{
            style: {
              fontFamily: "picoopic",
            },
            classNames: {
              toast: "font-picoopic",
            },
          }}
        />
      </body>
    </html>
  );
}
