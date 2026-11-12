import React from 'react';
import ProductCard from "./ProductCard";
const FeaturedProducts = () => {
  
const products = [
  {
    id: 1,
    name: "کتاب من پیش از تو اثر جوجو مویز",
    image: "/images/products/1.jpg",
    price: "220,000 تومان",
  },
  {
    id: 2,
    name: "کتاب تختخوابت را مرتب کن اثر ویلیام مک‌ریون",
    image: "/images/products/2.jpg",
    price: "89,000 تومان",
  },
  {
    id: 3,
    name: "کتاب ملت عشق اثر الیف شافاک",
    image: "/images/products/3.jpg",
    price: "185,000 تومان",
  },
];

  return (
    <section className="mb-3 w-full px-3" dir="rtl">
      <div className="container mx-auto">
        <div className="rounded-lg bg-[var(--color-surface)] p-3">

          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="border-r-4 border-[var(--color-primary)] pr-3 text-base font-bold text-[var(--color-text)]">
              پربازدیدترین کتاب‌ها
            </h2>

            <a
              href="#"
              className="text-sm text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-light)]"
            >
              مشاهده همه
            </a>
          </div>

          {/* Products */}
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[220px] min-w-[220px] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}


export default FeaturedProducts;
