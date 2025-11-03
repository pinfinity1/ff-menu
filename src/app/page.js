import { Logo } from "@/components/Logo/Logo";
import { Header } from "@/components/Header/Header";
import { MenuItems } from "@/components/MenuItem/MenuItems";

async function getMenuData() {
  try {
    // ۳. عدم استفاده از fetch، فراخوانی مستقیم Prisma
    const data = await prisma.category.findMany({
      include: {
        products: {
          orderBy: {
            order: "asc", // محصولات را هم مرتب می‌کنیم
          },
        },
      },
      orderBy: { order: "asc" },
    });
    return data;
  } catch (error) {
    console.log("Error fetching data directly from DB:", error);
    return [];
  }
}
export default async function Home() {
  const categoryAndSubsets = await getMenuData();

  const categories = categoryAndSubsets.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return (
    <main className="w-full relative md:max-w-[80%] lg:max-w-[40%] mx-auto h-full md:border md:shadow font-picoopic px-4 py-4">
      <Logo />
      <Header categories={categories} />
      <MenuItems subset={categoryAndSubsets} />
    </main>
  );
}
