import { Clock, Phone } from "lucide-react";
import Image from "next/image";
import WhyGreenFastFood from "@/public/images/why-green-fast-food.jpeg";

export const ContactUS = () => {
  return (
    <>
      <div className="w-full min-h-[320px] pb-10">
        <div className="w-[240px] h-[240px] overflow-hidden rounded mx-auto">
          <Image
            src={WhyGreenFastFood}
            width={280}
            height={280}
            priority
            className="object-cover rounded-full w-full h-full"
            alt="why green"
          />
        </div>
        <div className="w-full rounded p-6 text-right text-[16px] flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Phone size={24} />
            <p>
              <a dir="ltr" className="mr-2 underline " href="tel:+983832226065">
                ۰۳۸-۳۲۲۲-۶۰۶۵
              </a>
            </p>
          </div>
          <div className="flex items-center  gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-instagram-icon lucide-instagram"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <a
              href="https://www.instagram.com/sabz.fastfood/"
              target="_blank"
              rel="noopener noreferrer"
              className=" font-bold underline"
            >
              sabz.fastfood
            </a>
          </div>
          <div className="flex items-center  gap-4">
            <Clock size={20} />
            <p>از ۱۲ ظهر تا ۱۲ شب</p>
          </div>
        </div>
      </div>
    </>
  );
};
