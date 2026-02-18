"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProductActions({
  onAddProduct,
  onExport,
  onRefresh,
  isPageLoading,
}) {
  const [isImporting, setIsImporting] = useState(false);

  // هندل کردن آپلود اکسل
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // اعتبارسنجی فرمت
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("لطفاً فقط فایل اکسل انتخاب کنید.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsImporting(true);
    const toastId = toast.loading("در حال پردازش فایل اکسل...");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (res.ok) {
        toast.success(result.message);
        onRefresh(); // رفرش کردن لیست محصولات
      } else {
        toast.error("خطا: " + result.message);
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      toast.dismiss(toastId);
      setIsImporting(false);
      e.target.value = ""; // پاک کردن اینپوت برای انتخاب مجدد
    }
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
      {/* سمت چپ: دکمه‌های اکسل */}
      <div className="flex w-full sm:w-auto gap-2">
        {/* دکمه ایمپورت (با اینپوت مخفی) */}
        <div className="relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            disabled={isImporting || isPageLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <Button
            variant="outline"
            className="w-auto text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 cursor-pointer"
            disabled={isImporting || isPageLoading}
          >
            {isImporting ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="ml-2 h-4 w-4" />
            )}
            <span className="text-xs sm:text-sm">ورود از اکسل</span>
          </Button>
        </div>

        {/* دکمه اکسپورت */}
        <Button
          variant="outline"
          className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
          onClick={onExport}
          disabled={isPageLoading}
        >
          <Download className="ml-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">خروجی اکسل</span>
        </Button>
      </div>

      {/* سمت راست: افزودن محصول */}
      <Button
        onClick={onAddProduct}
        disabled={isPageLoading}
        className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/20"
      >
        <Plus className="ml-2 h-5 w-5" />
        افزودن محصول جدید
      </Button>
    </div>
  );
}
