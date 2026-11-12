import Image from "next/image";
import React from "react";
import { AiOutlineShoppingCart, AiOutlineHeart } from "react-icons/ai";

const ProductCard = ({ product }) => {
  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors hover:border-[var(--color-primary-light)]">
      {/* Action Buttons */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          aria-label="افزودن به سبد خرید"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
        >
          <AiOutlineShoppingCart size={20} />
        </button>

        <button
          type="button"
          aria-label="افزودن به علاقه‌مندی"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
        >
          <AiOutlineHeart size={20} />
        </button>
      </div>

      {/* Product Link */}
      <a href="#" className="flex flex-1 flex-col" dir="rtl">
        {/* Book Image */}
        <div className="relative flex h-[200px] items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={400}
            sizes="220px"
            className="h-full w-full object-contain"
          />
        </div>

        {/* Book Name */}
        <h3 className="mt-3 min-h-12 line-clamp-2 text-sm leading-6 text-[var(--color-text)]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto pt-4">
          {product.oldPrice && product.discount && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted)] line-through">
                {product.oldPrice}
              </span>

              <span className="rounded bg-[var(--color-hover)] px-2 py-1 text-xs text-[var(--color-primary)]">
                {product.discount}
              </span>
            </div>
          )}

          <div className="text-left text-sm font-bold text-[var(--color-text)]">
            {product.price}
          </div>
        </div>
      </a>
    </article>
  );
};

export default ProductCard;
