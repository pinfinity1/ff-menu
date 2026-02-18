"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TomanIcon } from "@/components/Icons/TomanIcon"; // فرض بر این است که فایل آیکون را ساخته‌اید

const formatedNumber = (num) => {
  if (!num) return "۰";
  return Number(num).toLocaleString("fa-IR");
};

function MenuItemCard({ productDetails }) {
  if (!productDetails) return null;

  const { name, description, imageUrl, price, variants } = productDetails;

  // استیت بدون مقدار اولیه (هیچ‌چیزی انتخاب نشده)
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const hasValidImage = imageUrl && imageUrl !== "/images/icon.png";

  return (
    <Dialog>
      {/* --- کارت محصول (لیست) --- */}
      <div className="group flex flex-row md:flex-col w-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 gap-3 md:gap-4">
        <DialogTrigger asChild>
          <div className="relative w-24 h-24 min-w-24 md:w-full md:h-64 rounded-lg overflow-hidden bg-gray-50 cursor-pointer">
            {hasValidImage ? (
              <>
                <Image
                  src={imageUrl}
                  alt={name || "محصول"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100px, 100vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
              </>
            ) : (
              <ImagePlaceholder />
            )}
          </div>
        </DialogTrigger>

        <div className="flex flex-col flex-1 justify-between h-24 md:h-auto">
          <div>
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
              {name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-5 line-clamp-2">
              {description || "بدون توضیحات"}
            </p>
          </div>
        </div>
      </div>

      {/* --- مودال (Popup) --- */}
      <DialogContent className="sm:max-w-md w-[95%] max-h-[85vh] overflow-y-auto rounded-xl font-picoopic p-0 gap-0 border-none shadow-2xl bg-white scrollbar-hide">
        {/* هدر + عکس */}
        <div className="relative w-full h-96 bg-gray-50">
          {hasValidImage ? (
            <Image
              src={imageUrl}
              alt={name || "محصول"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-30">
              <ImagePlaceholder />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

          <div className="absolute bottom-4 right-4 text-white z-10">
            <DialogTitle className="text-2xl font-bold shadow-black drop-shadow-md">
              {name}
            </DialogTitle>
          </div>
        </div>

        <DialogDescription className="sr-only">جزئیات محصول</DialogDescription>

        <div className="p-5 flex flex-col gap-5">
          {/* توضیحات */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600 leading-7 text-justify">
              {description || "توضیحات خاصی ثبت نشده است."}
            </p>
          </div>

          {/* لیست قیمت‌ها (بدون تیتر) */}
          {variants && variants.length > 0 ? (
            <RadioGroup
              value={String(selectedVariantId)}
              onValueChange={(v) => setSelectedVariantId(Number(v))}
              className="flex flex-col gap-2.5"
              dir="rtl"
            >
              {variants.map((v) => (
                <label
                  key={v.id}
                  htmlFor={`v-${v.id}`}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                    selectedVariantId === v.id
                      ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                      : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      value={String(v.id)}
                      id={`v-${v.id}`}
                      className="data-[state=checked]:border-brand-primary data-[state=checked]:text-brand-primary w-5 h-5 border-2 border-gray-400"
                    />
                    <span
                      className={`text-sm font-bold ${selectedVariantId === v.id ? "text-brand-primary-dark" : "text-gray-600"}`}
                    >
                      {v.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-lg font-bold tracking-tight ${selectedVariantId === v.id ? "text-brand-primary" : "text-gray-700"}`}
                    >
                      {formatedNumber(v.price)}
                    </span>
                    <TomanIcon
                      className={
                        selectedVariantId === v.id
                          ? "text-brand-primary"
                          : "text-gray-400"
                      }
                    />
                  </div>
                </label>
              ))}
            </RadioGroup>
          ) : (
            /* تک قیمتی */
            <div className="flex items-center justify-between bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/20">
              <span className="text-gray-700 font-bold text-sm">قیمت:</span>
              <div className="flex items-center gap-1 text-brand-primary-dark text-2xl font-black">
                <span>{formatedNumber(price)}</span>
                <TomanIcon />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MenuItemCard;
