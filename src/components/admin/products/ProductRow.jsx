// src/components/admin/products/ProductRow.jsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical } from "lucide-react";
import Image from "next/image";

export function ProductRow({ product, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const formatPrice = (price) => Number(price).toLocaleString("fa-IR");

  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`
        transition-colors border-b-gray-100 
        ${isDragging ? "bg-blue-50 shadow-lg border-2 border-brand-primary relative" : "hover:bg-gray-50"}
      `}
    >
      {/* 1. دستگیره درگ (فقط دسکتاپ) - در موبایل حذف می‌شود تا فضا باز شود */}
      <TableCell className="w-10 text-center cursor-grab touch-none hidden md:table-cell">
        <div {...attributes} {...listeners} className="p-2">
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-700" />
        </div>
      </TableCell>

      {/* 2. تصویر محصول */}
      <TableCell>
        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
          {product.imageUrl && product.imageUrl !== "/images/icon.png" ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center p-2 opacity-50">
              <Image
                src="/images/icon.png"
                alt="default"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          )}
        </div>
      </TableCell>

      {/* 3. نام و قیمت (ترکیبی برای موبایل) */}
      <TableCell className="text-right">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-gray-800 text-sm md:text-base">
            {product.name}
          </span>

          {/* قیمت: در موبایل اینجا نمایش داده می‌شود، در دسکتاپ مخفی */}
          <span className="text-xs text-gray-500 md:hidden">
            {hasVariants ? "چند قیمتی" : `${formatPrice(product.price)} تومان`}
          </span>

          {product.hasVariants && (
            <span className="md:hidden inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
              متغیر
            </span>
          )}
        </div>
      </TableCell>

      {/* 4. قیمت (ستون جداگانه فقط برای دسکتاپ) */}
      <TableCell className="hidden md:table-cell">
        {hasVariants ? (
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
            چند قیمتی
          </span>
        ) : (
          `${formatPrice(product.price)} تومان`
        )}
      </TableCell>

      {/* 5. دکمه‌ها */}
      <TableCell>
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
