export const dynamic = "force-dynamic";

// import { Logo } from "@/components/Logo/Logo";
// import { Header } from "@/components/Header/Header";
// import { MenuItems } from "@/components/MenuItem/MenuItems";

// async function getMenuData() {
//   try {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
//     //
//     // ما باید پارامتر eager=true را برای گرفتن محصولات اضافه کنیم
//     const response = await fetch(`${baseUrl}/api/category?eager=true`, {
//       cache: "no-store",
//     });
//     if (!response.ok)
//       throw new Error(`Failed to fetch: ${response.statusText}`);
//     return response.json();
//   } catch (error) {
//     console.log("Error fetching data from internal API:", error);
//     return [];
//   }
// }

export default async function Home() {
  // const categoryAndSubsets = await getMenuData();
  // const categories = categoryAndSubsets.map((item) => ({
  //   id: item.id,
  //   name: item.name,
  // }));

  return (
    <main className="w-full relative md:max-w-[80%] lg:max-w-[40%] mx-auto h-full md:border md:shadow font-picoopic px-4 py-4">
      {/* <Logo /> */}
      {/* <Header categories={categories} /> */}
      {/* <MenuItems subset={categoryAndSubsets} /> */}
    </main>
  );
}
