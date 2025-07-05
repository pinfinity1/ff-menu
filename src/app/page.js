import http from "@/app/api/axiosInstance";
import { Logo } from "@/components/Logo/Logo";
import { Header } from "@/components/Header/Header";
import { MenuItems } from "@/components/MenuItem/MenuItems";

export default async function Home() {
  let categoryAndSubsets = [];

  try {
    const response = await http({
      url: "/category?eager=true",
      method: "GET",
    });
    if (response.data) {
      categoryAndSubsets = response.data;
    }
  } catch (error) {
    console.log("error fetching data");
  }

  const categories = categoryAndSubsets.map((item) => {
    return { id: item.id, name: item.name };
  });

  return (
    <main className="w-full relative md:max-w-[80%] lg:max-w-[40%] mx-auto h-full md:border md:shadow font-picoopic px-4 py-4">
      <Logo />
      <Header categories={categories} />
      <MenuItems subset={categoryAndSubsets} />
    </main>
  );
}
