"use client";

import Image from "next/image";
import http from "@/app/api/axiosInstance";
import { useEffect, useRef, useState } from "react";

function MenuItemCard({ productDetails }) {
  const { name, price, description, id } = productDetails;

  const [imageUrl, setImageUrl] = useState(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const cardRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const handleIntersect = (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setShouldLoad(true);

        if (observerRef.current && cardRef.current) {
          observerRef.current.unobserve(cardRef.current);
          observerRef.current.disconnect();
        }
      }
    };

    const timer = setTimeout(() => {
      observerRef.current = new IntersectionObserver(handleIntersect, {
        rootMargin: "100px",
      });

      if (cardRef.current) {
        observerRef.current.observe(cardRef.current);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    if (!shouldLoad) return;

    const fetchImage = async () => {
      try {
        const response = await http({
          url: `/product/images/${id}`,
          method: "GET",
          responseType: "arraybuffer",
        });

        if (response.data) {
          const base64 = Buffer.from(response.data, "binary").toString(
            "base64"
          );
          const mimeType = response.headers["content-type"] || "image/jpeg";
          const dataUrl = `data:${mimeType};base64,${base64}`;
          setImageUrl(dataUrl);
        }
      } catch (error) {
        console.error("Error fetching product image:", error);
      }
    };

    fetchImage();
  }, [shouldLoad]);

  const formatedNumber = (num) => Number(num).toLocaleString("fa-IR");

  return (
    <div
      ref={cardRef}
      className="w-full flex flex-col p-2 bg-white rounded text-black"
    >
      <div className="w-40 h-40 rounded overflow-hidden flex items-center justify-center shadow">
        {imageUrl ? (
          <Image
            src={imageUrl}
            width={160}
            height={160}
            alt={name}
            className="object-cover w-full h-full"
          />
        ) : shouldLoad ? (
          <Image
            src="/images/sabz.jpg"
            width={80}
            height={80}
            alt="Fallback Image"
          />
        ) : (
          <div className="w-20 h-20 animate-pulse bg-gray-200 rounded"></div>
        )}
      </div>
      <div className="w-full mt-2">
        <p className="my-2 font-bold text-[16px]">{name}</p>
        <div className="text-[12px] flex gap-2 mb-3">
          <p>محتویات:</p>
          <p>{description}</p>
        </div>
        <p className="text-left text-[16px] flex items-center justify-end">
          {formatedNumber(price)}
          <span className="text-[10px] px-1 py-0.5 mt-1 rounded text-primaryDark">
            تومان
          </span>
        </p>
      </div>
    </div>
  );
}

export default MenuItemCard;
