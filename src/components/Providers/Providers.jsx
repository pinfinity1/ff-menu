"use client";

import { CategoryProvider } from "@/context/CategoryContext";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }) {
  return (
    <CategoryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </CategoryProvider>
  );
}
