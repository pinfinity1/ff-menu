"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImageUploader({ value, onFileChange, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = null;

    if (typeof value === "string" && value) {
      setPreviewUrl(value);
    } else if (value instanceof File) {
      objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [value]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("لطفا یک فایل عکس انتخاب کنید.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("اندازه فایل باید کمتر از 5 مگابایت باشد.");
      return;
    }

    onFileChange(file);
  };

  if (previewUrl) {
    return (
      <div className="relative w-full h-48 rounded-md overflow-hidden border">
        <Image
          src={previewUrl}
          alt="پیش‌نمایش محصول"
          fill
          className="object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 left-2 z-10 size-8"
          onClick={() => onRemove("")}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
        <div className="flex flex-col items-center">
          <UploadCloud className="size-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            کلیک کنید یا عکس را بکشید و رها کنید
          </p>
          <p className="text-xs text-muted-foreground">(حداکثر 5 مگابایت)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      </label>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
