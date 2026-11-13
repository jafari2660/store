
"use client";

import Image from "next/image";
import Link from "next/link";
import { AiOutlineShoppingCart, AiOutlineHeart } from "react-icons/ai";

const ProductCard = ({ product }) => {
  return (
    <article
      dir="rtl"
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all duration-300 hover:border-[var(--color-primary-light)] hover:shadow-lg"
    >
      {/* Action Buttons */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          aria-label="افزودن به سبد خرید"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
        >
          <AiOutlineShoppingCart size={19} />
        </button>

        <button
          type="button"
          aria-label="افزودن به علاقه‌مندی"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
        >
          <AiOutlineHeart size={19} />
        </button>
      </div>

      {/* Product Link */}
      <Link
        href={product.href || "#"}
        className="flex flex-1 flex-col no-underline"
      >
        {/* Book Image */}
        <div className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-lg p-3 sm:h-[210px]">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={400}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
            className="h-full w-full object-contain transition-transform duration-300 "
          />
        </div>

        {/* Product Name */}
        <h3 className="mt-3 min-h-12 line-clamp-2 text-sm font-medium leading-6 text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto pt-4">
          {product.oldPrice && product.discount && (
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs text-[var(--color-muted)] line-through">
                {product.oldPrice}
              </span>

              <span className="rounded-md bg-[var(--color-hover)] px-2 py-1 text-xs font-medium text-[var(--color-primary)]">
                {product.discount}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--color-muted)]">
              قیمت:
            </span>
            <span className="text-sm font-bold text-[var(--color-primary)]">
              {product.price}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
