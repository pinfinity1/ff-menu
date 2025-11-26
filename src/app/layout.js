import "./globals.css";

export const metadata = {
  title: "گرین فست‌ فود",
  description: "ُاولین فست‌ فود دست‌ ساز",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`antialiased bg-gray-50 text-gray-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
