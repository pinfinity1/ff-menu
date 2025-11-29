// src/components/ImagePlaceholder.jsx
import Image from "next/image";

export const ImagePlaceholder = () => {
  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center overflow-hidden">
      <div className="relative w-1/2 h-1/2 opacity-40 grayscale">
        <Image
          src="/images/icon.png"
          alt="لوگو"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
};
