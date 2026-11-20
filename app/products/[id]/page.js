import React from "react";
import ProductDetails from "@/components/home/ProductDetails";
import ProductGallery from "@/components/home/ProductGallery";
import RelatedProducts from "@/components/home/RelatedProducts";

async function getProductData(id) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/products/home/${id}`,
    {
      next: { revalidate: 60 },
      cache: "force-cache",
    },
  );

  if (!res.ok) {
    throw new Error("خطایی در دریافت اطلاعات");
  }

  return res.json();
}

const SingleProduct = async ({ params }) => {
  const { id } = await params;

  const product = await getProductData(id);

  return (
    <main
      id="main-body-one-col"
      className="content-wrapper min-h-screen bg-[var(--color-background)] text-[var(--color-text)] py-6"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-4 min-w-0">
            <ProductGallery images={product.image} />
          </div>

          <div className="md:col-span-5 min-w-0">
            <ProductDetails
              name={product.name}
              description={product.description}
              stock={product.stock}
              category={product.category}
            />
          </div>

          <div className="md:col-span-3 min-w-0">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center gap-3 mb-4">
                <p className="text-[var(--color-muted)]">قیمت کالا</p>
                <p className="text-[var(--color-muted)]">
                  {Number(product.price ?? 0).toLocaleString("fa-IR")}{" "}
                  <span className="text-xs">تومان</span>
                </p>
              </div>

              <div className="flex justify-between items-center gap-3 mb-4">
                <p className="text-[var(--color-muted)]">تخفیف کالا</p>
                <p className="text-[var(--color-primary)] font-bold">
                  {Number(product.discountPrice ?? 0).toLocaleString("fa-IR")}
                  <span className="text-xs">تومان</span>
                </p>
              </div>

              <div className="border-t border-[var(--color-border)] my-4" />

              <div className="flex justify-between items-center mb-5">
                <p className="font-bold">مبلغ نهایی</p>
                <p className="font-bold text-lg">
                  {Number( product.discountPrice || product.price || 0,).toLocaleString("fa-IR")}
                  <span className="text-xs"> تومان</span>
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-[var(--color-primary)] hover:opacity-90 text-white font-bold py-3 px-4 transition duration-200"
              >
                افزودن به سبد خرید
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <RelatedProducts categoryId={product.category._id} />
        </div>
      </div>
    </main>
  );
};

export default SingleProduct;
