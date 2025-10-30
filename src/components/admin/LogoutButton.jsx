"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to logout", error);
    }
    // کاربر را به صفحه لاگین می‌فرستیم
    // استفاده از window.location.href باعث رفرش کامل و پاک شدن stateها می‌شود
    window.location.href = "/admin/login";
  };

  return (
    <Button variant="outline" size="icon" onClick={handleLogout}>
      <LogOut className="h-5 w-5" />
      <span className="sr-only">خروج</span>
    </Button>
  );
}
