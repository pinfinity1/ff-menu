import { usePublicStore } from "@/app/store/publicStore";

export const HeaderItems = ({ categoryDetail }) => {
  const { id, name } = categoryDetail;
  const category = usePublicStore((state) => state.category);
  const setCategory = usePublicStore((state) => state.setCategory);

  const handleContext = () => {
    setCategory(categoryDetail);

    // پیدا کردن المنت شروع منو
    const menuStart = document.getElementById("menu-start");

    if (menuStart) {
      menuStart.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // فال‌بک (اگر المنت پیدا نشد به بالای صفحه برو)
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // تشخیص اینکه آیا این آیتم فعال است یا نه
  const isActive = category?.id === id;

  return (
    <button
      onClick={handleContext}
      className={`
        relative whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out
        ${
          isActive
            ? "bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/30 scale-105"
            : "bg-transparent text-gray-600 hover:bg-black/5 hover:text-black"
        }
      `}
    >
      {name}

      {/* یک نقطه کوچک زیر آیتم فعال برای زیبایی بیشتر (اختیاری) */}
      {isActive && (
        <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50"></span>
      )}
    </button>
  );
};
