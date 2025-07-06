import Image from "next/image";
import { ContactUS } from "./ContactUS";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Utensils } from "lucide-react";
import MainLogo from "@/public/images/icon.png";

export const Logo = () => {
  return (
    <>
      <div className="w-full flex flex-col items-center relative">
        <div className="w-[160px] h-[160px] rounded-full overflow-hidden ">
          <Image
            src={MainLogo}
            width={0}
            height={0}
            priority
            className="w-full h-full"
            alt="logo"
          />
        </div>
        <Drawer>
          <DrawerTrigger asChild>
            <div className="w-10 h-10 absolute top-2 left-0 bg-brand-primary/20 backdrop-blur shadow-lg hover:shadow-xl rounded-md  flex items-center justify-center transition-all duration-150 cursor-pointer">
              <Utensils size={20} className="text-brand-primary" />
            </div>
          </DrawerTrigger>
          <DrawerContent className={"bg-white"}>
            <DrawerTitle className="pt-10 pb-6">
              <div className="relative w-full h-[2px] bg-brand-primary-dark rounded-full">
                <span className="bg-white text-brand-primary-dark px-4 absolute right-10 -top-3">
                  درباره‌ ما
                </span>
              </div>
            </DrawerTitle>
            <ContactUS />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
