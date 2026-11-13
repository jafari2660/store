"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const carouselRef = useRef(null);

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

  useEffect(() => {
    const $ = window.jQuery;

    if (!$ || !$.fn.owlCarousel || !carouselRef.current) return;

    const $carousel = $(carouselRef.current);

    $carousel.owlCarousel({
      rtl: true,
      loop: products.length > 4,
      margin: 12,
      nav: true,
      dots: false,
      autoplay: true,
      autoplayTimeout: 4000,
      autoplayHoverPause: true,
      smartSpeed: 700,
      navText: ["‹", "›"],
      responsive: {
        0: { items: 2, margin: 8 },
        576: { items: 2, margin: 12 },
        768: { items: 3, margin: 12 },
        1024: { items: 4, margin: 14 },
      },
    });

    return () => {
      if ($carousel.hasClass("owl-loaded")) {
        $carousel.trigger("destroy.owl.carousel");
      }
    };
  }, []);

  return (
    <section
      className="mb-4 w-full px-3"
      dir="rtl"
    >
      <div className="container mx-auto">

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm sm:p-4">

          {/* Header */}
          <div className="mb-5 flex items-center justify-between">

            <h2 className="border-r-4 border-[var(--color-primary)] pr-3 text-base font-bold text-[var(--color-text)] sm:text-lg">
              پربازدیدترین کتاب‌ها
            </h2>

            <Link
              href="/books"
              className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-hover)] sm:text-sm"
            >
              مشاهده همه
            </Link>

          </div>

          {/* Products Carousel */}
          <div className="relative px-1" dir="ltr">

            <div
              ref={carouselRef}
              className="owl-carousel owl-theme"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="px-1"
                  dir="rtl"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
