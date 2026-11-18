
export async function getFeaturedProducts() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/products/featured`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("مشکلی در دریافت محصولات پربازدید رخ داده است");
  }

  return res.json();
}
