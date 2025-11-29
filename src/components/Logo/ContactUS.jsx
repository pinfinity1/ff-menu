import Image from "next/image";
import { Clock, Phone, Instagram } from "lucide-react";

export const ContactUS = () => {
  return (
    <div className="w-full flex flex-col items-center pb-8 font-picoopic">
      {/* تصویر با افکت سایه */}
      <div className="relative w-56 h-56 md:w-64 md:h-64 mb-8 rounded-2xl overflow-hidden shadow-xl shadow-brand-primary/10 rotate-3 hover:rotate-0 transition-transform duration-500 ease-out border-4 border-white">
        <Image
          src="/images/why-green-fast-food.jpeg"
          alt="داستان گرین فست‌فود"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* لیست اطلاعات با طراحی کارتی */}
      <div className="w-full flex flex-col gap-3 px-2">
        {/* کارت تلفن */}
        <a
          href="tel:+983832226065"
          className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors duration-300 border border-transparent hover:border-green-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-green-600 rounded-full shadow-sm group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <span className="text-gray-600 group-hover:text-green-700 font-medium text-sm">
              تماس با ما
            </span>
          </div>
          <span
            dir="ltr"
            className="text-lg font-bold text-gray-800 group-hover:text-green-800"
          >
            038-3222-6065
          </span>
        </a>

        {/* کارت اینستاگرام */}
        <a
          href="https://www.instagram.com/sabz.fastfood/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-pink-50 rounded-xl transition-colors duration-300 border border-transparent hover:border-pink-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-pink-600 rounded-full shadow-sm group-hover:scale-110 transition-transform">
              <Instagram size={20} />
            </div>
            <span className="text-gray-600 group-hover:text-pink-700 font-medium text-sm">
              اینستاگرام
            </span>
          </div>
          <span
            dir="ltr"
            className="text-lg font-bold text-gray-800 group-hover:text-pink-800 font-sans"
          >
            @sabz.fastfood
          </span>
        </a>

        {/* کارت ساعت کاری */}
        <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm mt-2">
          <div className="p-2 bg-gray-100 text-gray-500 rounded-full">
            <Clock size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-0.5">ساعات کاری</span>
            <span className="text-gray-700 font-bold text-sm md:text-base">
              همه روزه از ۱۲ ظهر تا ۱۲ شب
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
