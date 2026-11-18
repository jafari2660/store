
import React from "react";
import {
  AiOutlineSafetyCertificate,
  AiOutlineShop,
  AiOutlineInfoCircle,
  AiOutlineAppstore,
} from "react-icons/ai";

const ProductDetails = ({ name, description, stock, category }) => {
  return (
    <section
      dir="rtl"
      className="content-wrapper bg-[var(--color-surface)] border border-[var(--color-border)] p-4 sm:p-5 rounded-xl mb-4"
    >
      {/* عنوان محصول */}
      <section className="content-header mb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="content-header-title content-header-title-small text-lg sm:text-xl font-bold text-[var(--color-text)] leading-8">
            {name}
          </h2>
          <div className="content-header-link"></div>
        </div>
      </section>

      {/* اطلاعات محصول */}
      <section className="product-info space-y-4">

        {/* گارانتی */}
        <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <AiOutlineSafetyCertificate className="text-xl text-[var(--color-primary)] shrink-0" />
          <span>
            گارانتی اصالت و سلامت فیزیکی کالا
          </span>
        </div>

        {/* موجودی */}
        <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <AiOutlineShop className="text-xl text-[var(--color-primary)] shrink-0" />
          <span>
         {stock > 0 ? `موجود ${stock} عدد` : "ناموجود"}
          </span>
        </div>

        {/* دسته‌بندی */}
        <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <AiOutlineAppstore className="text-xl text-[var(--color-primary)] shrink-0" />
          <span>
            دسته‌بندی:
            <span className="mr-1 font-medium">
              {category?.name || "بدون دسته‌بندی"}
            </span>
          </span>
        </div>

        {/* توضیحات */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <h3 className="flex items-center gap-2 font-bold text-[var(--color-text)] mb-3">
            <AiOutlineInfoCircle className="text-xl text-[var(--color-primary)]" />
            توضیحات محصول
          </h3>

          <p className="text-sm text-[var(--color-muted)] leading-8 whitespace-pre-line text-justify">
            {description || "توضیحاتی برای این محصول ثبت نشده است."}
          </p>
        </div>

      </section>
    </section>
  );
};

export default ProductDetails;
