"use client";

import Image from "next/image";
import http from "@/app/api/axiosInstance";
import { useEffect, useRef, useState } from "react";
import Logo from "@/public/images/icon.png";

const imageCache = new Map();

function MenuItemCard({ productDetails }) {
  const { name, price, description, id } = productDetails;

  const [imageUrl, setImageUrl] = useState(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    }, 1000);

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
      setIsLoading(true);

      if (imageCache.has(id)) {
        setImageUrl(imageCache.get(id));
        setIsLoading(false);
        return;
      }

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

          imageCache.set(id, dataUrl);
          setImageUrl(dataUrl);
        }
      } catch (error) {
        console.error("Error fetching product image:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [shouldLoad, id]);

  const formatedNumber = (num) => Number(num).toLocaleString("fa-IR");

  // console.log(imageCache);

  return (
    <div
      ref={cardRef}
      className="w-full flex flex-col p-2 bg-white rounded text-black"
    >
      <div className="w-[280px] h-[280px] rounded overflow-hidden flex items-center justify-center shadow">
        {isLoading ? (
          <div className="w-full h-full bg-brand-primary-dark/20 animate-pulse flex items-center justify-center">
            <Image
              src={Logo}
              width={80}
              height={80}
              alt={name}
              className="opacity-60"
            />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            width={160}
            height={160}
            alt={name}
            className="object-cover w-full h-full"
          />
        ) : (
          <Image src={Logo} width={80} height={80} alt={name} />
        )}
      </div>
      <div className="w-full mt-2">
        <p className="my-2 font-bold text-[20px] tracking-wider">{name}</p>
        <div className="flex gap-2 mb-3 text-sm">
          <p className="font-semibold">محتویات:</p>
          <p className="tracking-wide">{description}</p>
        </div>
        <p className="text-left text-[16px] flex items-center justify-end">
          {formatedNumber(price)}
          <span className="pr-0.5 pt-1.5 rounded text-brand-primary-dark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M13.6426 11.866H14.8761C15.5035 11.866 15.8172 11.6558 15.8172 11.2355C15.8172 11.071 15.7868 10.8243 15.7259 10.4954C15.671 10.1603 15.6071 9.83444 15.534 9.51768L16.2284 9.33494C16.3015 9.6456 16.3685 9.98673 16.4294 10.3583C16.4964 10.7299 16.5299 11.0192 16.5299 11.2263C16.5299 11.4822 16.469 11.7228 16.3472 11.9482C16.2254 12.1675 16.0396 12.3472 15.7898 12.4873C15.5401 12.6213 15.2355 12.6883 14.8761 12.6883H13.6426V11.866ZM14.0538 7.34302H14.9675V8.25674H14.0538V7.34302ZM15.6893 7.34302H16.603V8.25674H15.6893V7.34302Z"
                fill="currentColor"
              />
              <path
                d="M10.8953 14.1774C11.3217 14.1774 11.6506 14.1257 11.8821 14.0221C12.1197 13.9246 12.2842 13.7724 12.3755 13.5652C12.4669 13.3581 12.5126 13.084 12.5126 12.7429V12.6881H11.5075C10.9958 12.6881 10.5816 12.5358 10.2648 12.2312C9.95416 11.9266 9.79883 11.5002 9.79883 10.952C9.79883 10.5804 9.86888 10.2423 10.009 9.93775C10.1552 9.63318 10.3562 9.39256 10.612 9.21591C10.874 9.03925 11.1694 8.95093 11.4984 8.95093C11.8456 8.95093 12.1501 9.03621 12.4121 9.20677C12.674 9.37733 12.875 9.6149 13.0151 9.91948C13.1552 10.218 13.2253 10.5621 13.2253 10.952V11.8657H13.737L13.7918 12.286L13.737 12.6881H13.2253V12.7429C13.2253 13.4373 13.0395 13.9856 12.6679 14.3876C12.3024 14.7957 11.7116 14.9998 10.8953 14.9998H9.91761V14.1774H10.8953ZM10.5115 10.952C10.5115 11.287 10.5907 11.5246 10.7491 11.6647C10.9075 11.7987 11.1603 11.8657 11.5075 11.8657H12.5126V10.952C12.5126 10.5804 12.4273 10.2911 12.2567 10.0839C12.0862 9.87074 11.8334 9.76414 11.4984 9.76414C11.1877 9.76414 10.944 9.87379 10.7674 10.0931C10.5968 10.3063 10.5115 10.5926 10.5115 10.952Z"
                fill="currentColor"
              />
              <path
                d="M4.56836 11.8657H4.8242C5.1105 11.8657 5.28716 11.7378 5.35416 11.482L5.64655 10.4312C5.78057 9.95606 5.98768 9.58448 6.26789 9.31645C6.5481 9.04233 6.88618 8.90527 7.28212 8.90527C7.59888 8.90527 7.87909 8.99969 8.12275 9.18853C8.36641 9.37127 8.55525 9.62102 8.68926 9.93778C8.82327 10.2484 8.89028 10.5865 8.89028 10.952C8.89028 11.4028 8.82632 11.7744 8.6984 12.0668C8.57048 12.3531 8.40296 12.5602 8.19585 12.6881C7.99483 12.8221 7.78163 12.8891 7.55624 12.8891C7.32476 12.8891 7.09329 12.8434 6.86181 12.7521C6.63033 12.6668 6.26484 12.4962 5.76534 12.2404C5.64351 12.3805 5.50036 12.4901 5.33589 12.5693C5.17142 12.6485 5.00086 12.6881 4.8242 12.6881H4.56836V11.8657ZM6.10342 11.5094C6.54201 11.7348 6.85267 11.884 7.03542 11.9571C7.21816 12.0302 7.39177 12.0668 7.55624 12.0668C7.76335 12.0668 7.91868 11.9906 8.02224 11.8383C8.1258 11.68 8.17757 11.3845 8.17757 10.952C8.17757 10.5683 8.10143 10.2698 7.94914 10.0566C7.79685 9.83727 7.57451 9.72763 7.28212 9.72763C7.06283 9.72763 6.87095 9.80377 6.70648 9.95606C6.5481 10.1083 6.42627 10.3398 6.34099 10.6505L6.10342 11.5094Z"
                fill="currentColor"
              />
              <path
                d="M4.51831 12.6886C3.91525 12.6886 3.49799 12.5272 3.26651 12.2043C3.03503 11.8754 2.91929 11.3942 2.91929 10.7607L2.91016 6.75854H3.62286L3.632 10.7607C3.632 11.0896 3.65027 11.3272 3.68682 11.4734C3.72946 11.6196 3.80865 11.7231 3.92439 11.784C4.04622 11.8389 4.24419 11.8663 4.51831 11.8663H4.65537L4.70106 12.2866L4.65537 12.6886H4.51831Z"
                fill="currentColor"
              />
              <path
                d="M1.22439 0.540074C0.883268 1.23451 0.712705 1.8802 0.712705 2.47717C0.712705 3.0315 0.846719 3.47618 1.11474 3.81121C1.38886 4.15233 1.80308 4.3229 2.35741 4.3229H3.3351C3.74932 4.3229 4.07217 4.27416 4.30365 4.1767C4.53512 4.08533 4.69959 3.93609 4.79706 3.72897C4.89452 3.52796 4.94325 3.25079 4.94325 2.89748V0.0283885H5.65596V2.89748C5.65596 3.6041 5.47017 4.15538 5.09859 4.55133C4.727 4.94728 4.13917 5.14525 3.3351 5.14525H2.35741C1.85182 5.14525 1.42237 5.02037 1.06906 4.77062C0.715751 4.52087 0.447725 4.19193 0.26498 3.7838C0.0883268 3.37567 0 2.94013 0 2.47717C0 1.73401 0.207111 0.978662 0.621333 0.211133L1.22439 0.540074ZM2.59498 0.000976562H3.5087V0.914701H2.59498V0.000976562Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </p>
      </div>
    </div>
  );
}

export default MenuItemCard;
