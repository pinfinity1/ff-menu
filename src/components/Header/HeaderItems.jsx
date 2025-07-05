"use client";
import { useCategory } from "@/context/CategoryContext";
import { useEffect } from "react";

export const HeaderItems = ({ categoryDetail }) => {
  const { id, name } = categoryDetail;
  const { category, setCategory } = useCategory();

  const handleContext = () => {
    setCategory(categoryDetail);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={handleContext}
      className={`whitespace-nowrap flex flex-col justify-center items-center px-4 py-3 rounded cursor-pointer transition-all duration-300
        ${
          category.id !== id
            ? "bg-brand-primary-dark text-white"
            : "bg-white text-brand-primary-dark"
        }
        `}
    >
      <p>{name}</p>
    </button>
  );
};
