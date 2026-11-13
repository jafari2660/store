"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
const BrandSection = () => {
  const brands = [
    { name: "Huawei", image: "/images/brand/huawei.jpg", slug: "huawei" },
    { name: "ADATA", image: "/images/brand/adata.png", slug: "adata" },
    { name: "Casio", image: "/images/brand/casio.jpg", slug: "casio" },
    { name: "Gplus", image: "/images/brand/gplus.jpg", slug: "gplus" },
    { name: "Logitech", image: "/images/brand/logitech.jpg", slug: "logitech" },
    { name: "Nokia", image: "/images/brand/nokia.jpg", slug: "nokia" },
    { name: "Pakshoma", image: "/images/brand/pakshoma.png", slug: "pakshoma" },
    {
      name: "Panasonic",
      image: "/images/brand/panasonic.png",
      slug: "panasonic",
    },
    {
      name: "Pars Khazar",
      image: "/images/brand/parskhazar.png",
      slug: "parskhazar",
    },
    { name: "Samsung", image: "/images/brand/samsung.png", slug: "samsung" },
    { name: "Snowa", image: "/images/brand/snowa.png", slug: "snowa" },
    { name: "Xvision", image: "/images/brand/xvision.png", slug: "xvision" },
  ];

  const carouselRef = useRef(null);

  useEffect(() => {
    const $ = window.jQuery;

    if (!$ || !$.fn.owlCarousel || !carouselRef.current) return;

    const $carousel = $(carouselRef.current);

    if ($carousel.hasClass("owl-loaded")) {
      $carousel.trigger("destroy.owl.carousel");
    }

    $carousel.owlCarousel({
      rtl: true,
      loop: true,
      margin: 16,
      nav: true,
      dots: false,
      autoplay: true,
      autoplayTimeout: 3500,
      autoplayHoverPause: true,
      smartSpeed: 700,
      navText: ["‹", "›"],
      responsive: {
        0: { items: 2, margin: 10 },
        480: { items: 3, margin: 12 },
        768: { items: 4, margin: 14 },
        1024: { items: 5, margin: 16 },
        1200: { items: 6, margin: 18 },
      },
    });

    return () => {
      if ($carousel.hasClass("owl-loaded")) {
        $carousel.trigger("destroy.owl.carousel");
      }
    };
  }, []);

  return (
    <section className="mb-4 w-full py-5">
      <div className="container mx-auto max-w-[1400px] px-3 sm:px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="relative pr-4 text-base font-bold text-[var(--color-text)] sm:text-lg">
            <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]" />
            برندهای ویژه
          </h2>

          <Link
            href="/brands"
            className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-hover)] sm:text-sm"
          >
            مشاهده همه
          </Link>
        </div>

        {/* Brands Carousel */}
        <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-5 shadow-sm sm:px-5">
          <div ref={carouselRef} className="owl-carousel owl-theme">
            {brands.map((brand) => (
              <div key={brand.slug} className="px-1">
                <Link
                  href={`/brands/${brand.slug}`}
                  title={brand.name}
                  className="flex h-24 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors duration-200 hover:border-[var(--color-primary-light)] hover:bg-[var(--color-hover)]"
                >
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    width={150}
                    height={80}
                    sizes="(max-width: 480px) 40vw, (max-width: 1024px) 25vw, 150px"
                    className="h-full w-full object-contain"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
