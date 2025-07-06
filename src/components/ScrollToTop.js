// src/components/ScrollToTop.js
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.history.scrollRestoration = "manual";

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
