"use client";
import React from "react";
import { useState } from "react";
import Image from "next/image";

const ProductGallery = ({ images }) => {
  const mainImage =
    Array.isArray(images) && images.length > 0 ? images[0] : images;

  return (
<section className="content-wrapper bg-[var(--color-surface)] p-3 rounded-lg mb-4 border border-[var(--color-border)]"> 
       <section className="product-gallery">
        {/* تصویر اصلی */}
        <section className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg bg-[var(--color-surface)]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt="تصویر محصول"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              تصویر محصول موجود نیست
            </div>
          )}
        </section>
      </section>
    </section>
  );
};

export default ProductGallery;
