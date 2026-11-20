
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { getFeaturedProducts } from "@/app/home/lib/getFeaturedProducts";


const FeaturedProducts = () => {
  const carouselRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دریافت محصولات
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const data = await getFeaturedProducts();


        if (!Array.isArray(data)) {
          throw new Error("داده‌های دریافتی معتبر نیستند");
        }

        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Featured Products Error:", err);

        if (isMounted) {
          setError(err);
        }
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

    if (
      !$ ||
      !$.fn ||
      !$.fn.owlCarousel ||
      !carouselRef.current
    ) {
      console.error("Owl Carousel یا jQuery بارگذاری نشده است");
      return;
    }

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
        0: {
          items: 2,
          margin: 8,
        },
        576: {
          items: 2,
          margin: 12,
        },
        768: {
          items: 3,
          margin: 12,
        },
        1024: {
          items: 4,
          margin: 14,
        },
      },
    });

    return () => {
      if ($carousel.hasClass("owl-loaded")) {
        $carousel.trigger("destroy.owl.carousel");
      }
    };
  }, [products, loading]);

  if (loading) {
    return (
      <div className="py-8 text-center" dir="rtl">
        در حال بارگذاری محصولات...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500" dir="rtl">
        خطا در بارگذاری محصولات
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-4 w-full px-3" dir="rtl">
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
              {products.map((product, index) => (
                <div
                  key={product._id || product.id || index}
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
