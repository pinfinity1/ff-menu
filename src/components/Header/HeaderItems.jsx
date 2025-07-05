import { usePublicStore } from "@/app/store/publicStore";

export const HeaderItems = ({ categoryDetail }) => {
  const { id, name } = categoryDetail;
  const category = usePublicStore((state) => state.category);
  const setCategory = usePublicStore((state) => state.setCategory);

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
          category?.id !== id
            ? "bg-brand-primary-dark text-white"
            : "bg-white text-brand-primary-dark"
        }
        `}
    >
      <p>{name}</p>
    </button>
  );
};
