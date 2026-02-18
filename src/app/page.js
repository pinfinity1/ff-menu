import { Logo } from "@/components/Logo/Logo";
import { Header } from "@/components/Header/Header";
import { MenuItems } from "@/components/MenuItem/MenuItems";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getMenuData() {
  try {
    const data = await prisma.category.findMany({
      include: {
        products: {
          orderBy: {
            order: "asc",
          },
          // 👇 این بخش حیاتی اضافه شد: دریافت سایزها از دیتابیس
          include: {
            variants: {
              orderBy: { price: "asc" },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const formattedData = data.map((category) => ({
      ...category,
      products: category.products.map((product) => ({
        ...product,
        // تبدیل قیمت پایه به عدد
        price: Number(product.price),
        // 👇 تبدیل قیمت سایزها به عدد (اگر محصول سایز داشته باشد)
        variants: product.variants?.map((v) => ({
          ...v,
          price: Number(v.price),
        })),
      })),
    }));

    return formattedData;
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
      <div id="menu-start" className="scroll-mt-24">
        <MenuItems subset={categoryAndSubsets} />
      </div>
    </main>
  );
}
