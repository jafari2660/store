export async function getCategories() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/categories/home-menu`,
    {
      cache: "force-cache",
    }
  );

  if (!res.ok) {
    throw new Error("مشکلی در دریافت دسته بندی رخ داده است");
  }

  return res.json();
}
