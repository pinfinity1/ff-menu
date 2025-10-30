// import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";

export const metadata = {
  title: "گرین فست‌ فود",
  description: "ُاولین فست‌ فود دست‌ ساز",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`antialiased`}>
        {/* <ScrollToTop /> */}
        {children}
      </body>
    </html>
  );
}
