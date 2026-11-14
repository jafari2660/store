"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

const formatPrice = (price) =>
  new Intl.NumberFormat("fa-IR").format(price);

const DiscountedBooks = () => {
  const carouselRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products/discounted", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("خطا در دریافت کتاب‌ها");
        }

        const data = await response.json();

        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Discounted books error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || products.length === 0) return;

    const $ = window.jQuery;

    if (!$ || !$.fn?.owlCarousel || !carouselRef.current) return;

    const $carousel = $(carouselRef.current);

    if ($carousel.hasClass("owl-loaded")) {
      $carousel.trigger("destroy.owl.carousel");
    }

    $carousel.owlCarousel({
      rtl: true,
      loop: products.length > 4,
      margin: 12,
      nav: true,
      dots: false,
      autoplay: products.length > 1,
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
  }, [products, loading]);

  if (loading || products.length === 0) {
    return null;
  }

  const discountedProducts = products.map((product) => {
    const discountPercent = Math.round(
      ((product.price - product.discountPrice) / product.price) * 100
    );

    return {
      ...product,
      href: "/books",
      oldPrice: formatPrice(product.price),
      price: formatPrice(product.discountPrice),
      discount: `${formatPrice(discountPercent)}٪`,
    };
  });

  return (
    <section className="mb-4 w-full px-3" dir="rtl">
      <div className="container mx-auto">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm sm:p-4">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="border-r-4 border-[var(--color-primary)] pr-3 text-base font-bold text-[var(--color-text)] sm:text-lg">
              کتاب‌های تخفیف‌خورده
            </h2>

            <Link
              href="/books"
              className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-hover)] sm:text-sm"
            >
              مشاهده همه
            </Link>
          </div>

          <div className="relative px-1" dir="ltr">
            <div
              ref={carouselRef}
              className="owl-carousel owl-theme"
            >
              {discountedProducts.map((product) => (
                <div
                  key={product._id}
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

export default DiscountedBooks;