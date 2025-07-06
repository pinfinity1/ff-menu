import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";

export const metadata = {
  title: "گرین فست‌ فود",
  description: "ُاولین فست‌ فود دست‌ ساز",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ScrollToTop />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
