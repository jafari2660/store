
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";

const RelatedProducts = ({ categoryId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sliderRef = useRef(null);

  // دریافت محصولات مرتبط
  useEffect(() => {
    const controller = new AbortController();

    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl =
          process.env.NEXTAUTH_URL || "http://localhost:3000" ;

        const res = await fetch(
          `${baseUrl}/api/products/home/related?category=${encodeURIComponent(categoryId)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("خطایی در دریافت اطلاعات");
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("خطایی در دریافت اطلاعات");
        }

        setRelatedProducts(data);

      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (categoryId) {
      fetchRelatedProducts();
    } else {
      setRelatedProducts([]);
      setLoading(false);
    }

    return () => controller.abort();

  }, [categoryId]);

  // حرکت اسلایدر
  const scrollSlider = (direction) => {
    if (!sliderRef.current) return;

    const amount = sliderRef.current.clientWidth * 0.8;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <p className="text-center py-5">
        در حال بارگذاری...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center py-5 text-red-500">
        {error}
      </p>
    );
  }

  if (relatedProducts.length === 0) return null;

  return (
    <section className="mb-4">
      <section className="container-xxl">
        <section className="row">
          <section className="col">

            <section className="content-wrapper bg-[var(--color-surface)] p-3 rounded-2 border border-[var(--color-border)]">

              {/* عنوان بخش */}
              <section className="content-header">

                <section className="flex justify-between items-center mb-4">

                  <h2 className="content-header-title text-[var(--color-text)] font-bold">
                    <span>کالاهای مرتبط</span>
                  </h2>

                  {/* دکمه‌های کنترل اسلایدر */}
                  <section className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() => scrollSlider("right")}
                      aria-label="محصولات قبلی"
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)] transition"
                    >
                      <AiOutlineRight size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollSlider("left")}
                      aria-label="محصولات بعدی"
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)] transition"
                    >
                      <AiOutlineLeft size={18} />
                    </button>

                  </section>

                </section>

              </section>

              {/* لیست محصولات */}
              <section
                ref={sliderRef}
                dir="rtl"
                className="flex gap-3 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory scrollbar-hide"
              >

                {relatedProducts.map((relatedProduct) => (

                  <section
                    key={relatedProduct._id}
                    className="flex-none w-[190px] sm:w-[210px] snap-start"
                  >

                    <section className="lazyload-item-wrapper h-full">

                      <section className="product relative h-full border border-[var(--color-border)] rounded-lg p-2 bg-[var(--color-surface)] hover:shadow-md transition-shadow">

                        {/* دکمه سبد خرید */}
                        <section className="product-add-to-cart absolute top-3 left-3 z-10">

                          <button
                            type="button"
                            title="افزودن به سبد خرید"
                            aria-label="افزودن به سبد خرید"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition"
                          >
                            <AiOutlineShoppingCart size={18} />
                          </button>

                        </section>

                        {/* دکمه علاقه‌مندی */}
                        <section className="product-add-to-favorite absolute top-12 left-3 z-10">

                          <button
                            type="button"
                            title="افزودن به علاقه‌مندی"
                            aria-label="افزودن به علاقه‌مندی"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition"
                          >
                            <AiOutlineHeart size={18} />
                          </button>

                        </section>

                        {/* اطلاعات محصول */}
                        <Link
                          href={`/products/${relatedProduct._id}`}
                          className="product-link block"
                        >

                          {/* تصویر محصول */}
                          <section className="product-image relative w-full h-[170px] mb-3">

                            <Image
                              src={relatedProduct.image}
                              alt={relatedProduct.name || "تصویر محصول"}
                              fill
                              sizes="(max-width: 640px) 190px, 210px"
                              className="object-contain"
                            />

                          </section>

                          {/* نام محصول */}
                          <section className="product-name min-h-[48px]">

                            <h3 className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-6">
                              {relatedProduct.name}
                            </h3>

                          </section>

                          {/* قیمت محصول */}
                          <section className="product-price-wrapper mt-3">

                            <section className="product-price text-sm font-bold text-[var(--color-primary)]">
                              {Number(relatedProduct.price || 0).toLocaleString("fa-IR")} تومان
                            </section>

                          </section>

                        </Link>

                      </section>

                    </section>

                  </section>

                ))}

              </section>

            </section>

          </section>
        </section>
      </section>
    </section>
  );
};

export default RelatedProducts;
