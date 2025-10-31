"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImageUploader({ value, onUploadComplete, onRemove }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!res.ok) {
        throw new Error("خطا در دریافت لینک آپلود");
      }

      const { signedUrl, publicUrl } = await res.json();

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          onUploadComplete(publicUrl);
        } else {
          throw new Error("خطا در آپلود فایل به سرور");
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        throw new Error("خطا در شبکه هنگام آپلود");
      };

      xhr.send(file);
    } catch (err) {
      setError(err.message || "خطایی رخ داد");
      setIsUploading(false);
    }
  };

  if (value) {
    // --- نمایش عکس در صورت وجود ---
    return (
      <div className="relative w-full h-48 rounded-md overflow-hidden border">
        <Image
          src={value}
          alt="پیش‌نمایش محصول"
          fill
          className="object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 left-2 z-10 size-8"
          onClick={() => onRemove("")} // URL را خالی می‌کند
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    // --- نمایش بخش آپلود ---
    <div className="w-full">
      <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="size-8 animate-spin text-brand-primary" />
            <p className="mt-2">در حال آپلود...</p>
            <div className="w-40 mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-2 bg-brand-primary transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              کلیک کنید یا عکس را بکشید و رها کنید
            </p>
            <p className="text-xs text-muted-foreground">(حداکثر 5 مگابایت)</p>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
