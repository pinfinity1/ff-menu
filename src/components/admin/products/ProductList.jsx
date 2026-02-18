"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductRow } from "./ProductRow";

export function ProductList({
  groupedProducts,
  onDragEnd,
  onEdit,
  onDelete,
  onAddInCategory,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-10 hidden md:table-cell"></TableHead>
              <TableHead className="w-16 text-right">تصویر</TableHead>
              <TableHead className="text-right">مشخصات</TableHead>
              <TableHead className="text-right hidden md:table-cell">
                قیمت
              </TableHead>
              <TableHead className="text-left pl-4">عملیات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {groupedProducts.map((category) => (
              <React.Fragment key={category.id}>
                {/* هدر دسته‌بندی با دکمه افزودن سریع */}
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-t border-b-0">
                  <TableCell colSpan={5} className="py-2 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                        <span className="font-bold text-gray-800 text-lg">
                          {category.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary/10 h-8 px-3 text-xs font-medium transition-colors border border-brand-primary/20"
                        onClick={() => onAddInCategory(category.id)}
                      >
                        <Plus className="ml-1 h-3.5 w-3.5" />
                        افزودن به این دسته
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                <SortableContext
                  items={category.products.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {category.products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>

                {category.products.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-400 py-4 text-sm border-b-0 italic"
                    >
                      هنوز محصولی در این دسته ثبت نشده است.
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}
