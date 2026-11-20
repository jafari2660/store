
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/home/ProductCard";
import Pagination from "@/components/ui/Pagination";

const INITIAL_FILTERS = {
  q: "",
  minPrice: "",
  maxPrice: "",
  inStock: false,
  discounted: false,
  fileType: "",
};

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("fa-IR")} تومان`;
}

function calculateDiscount(price, discountPrice) {
  if (!discountPrice || discountPrice >= price || price <= 0) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
        >
          <div className="h-40 rounded-lg bg-gray-200" />
          <div className="mt-4 h-4 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function CategoryProducts({ categoryId }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
  });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("sort", sort);

        if (appliedFilters.q.trim()) {
          params.set("q", appliedFilters.q.trim());
        }

        if (appliedFilters.minPrice !== "") {
          params.set("minPrice", appliedFilters.minPrice);
        }

        if (appliedFilters.maxPrice !== "") {
          params.set("maxPrice", appliedFilters.maxPrice);
        }

        if (appliedFilters.inStock) {
          params.set("inStock", "true");
        }

        if (appliedFilters.discounted) {
          params.set("discounted", "true");
        }

        if (appliedFilters.fileType) {
          params.set("fileType", appliedFilters.fileType);
        }

        const response = await fetch(
          `/api/categories/${categoryId}/products?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "دریافت محصولات ناموفق بود.");
        }

        setProducts(data.products || []);
        setCategory(data.category || null);
        setPagination(data.pagination);
        setPage(data.pagination.currentPage);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "ارتباط با سرور برقرار نشد.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [categoryId, page, sort, appliedFilters, retryKey]);

  function handleFilterChange(event) {
    const { name, value, type, checked } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setFormError("");

    const min =
      filters.minPrice === "" ? null : Number(filters.minPrice);

    const max =
      filters.maxPrice === "" ? null : Number(filters.maxPrice);

    if (min !== null && (!Number.isFinite(min) || min < 0)) {
      setFormError("حداقل قیمت معتبر نیست.");
      return;
    }

    if (max !== null && (!Number.isFinite(max) || max < 0)) {
      setFormError("حداکثر قیمت معتبر نیست.");
      return;
    }

    if (min !== null && max !== null && min > max) {
      setFormError("حداقل قیمت نمی‌تواند از حداکثر قیمت بیشتر باشد.");
      return;
    }

    setPage(1);
    setAppliedFilters({ ...filters, q: filters.q.trim() });
    setMobileFiltersOpen(false);
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setFormError("");
    setPage(1);
  }

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([key, value]) => {
      if (key === "inStock" || key === "discounted") {
        return value === true;
      }

      return value !== "";
    }
  ).length;

  return (
    <main dir="rtl" className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <nav
        aria-label="مسیر صفحه"
        className="mb-5 text-sm text-[var(--color-muted)]"
      >
        <Link
          href="/"
          className="text-[var(--color-primary)] no-underline hover:underline"
        >
          صفحه اصلی
        </Link>

        <span className="mx-2">/</span>

        <span>{category?.name || "دسته‌بندی محصولات"}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">
            {category?.name || "محصولات دسته‌بندی"}
          </h1>

          <p className="mt-2 text-sm text-[var(--color-muted)]">
            محصولات این دسته‌بندی را جست‌وجو و فیلتر کنید.
          </p>
        </div>

        <span className="text-sm text-[var(--color-muted)]">
          {pagination.totalItems.toLocaleString("fa-IR")} محصول
        </span>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((value) => !value)}
          aria-expanded={mobileFiltersOpen}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium"
        >
          {mobileFiltersOpen ? "بستن فیلترها" : "فیلتر محصولات"}
          {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>

        <span className="text-xs text-[var(--color-muted)]">
          مرتب‌سازی نتایج
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-4">
        <aside
          className={`${
            mobileFiltersOpen ? "block" : "hidden"
          } rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:sticky md:top-4 md:col-span-1 md:block`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-[var(--color-text)]">
              فیلتر محصولات
            </h2>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              پاک کردن همه
            </button>
          </div>

          <form onSubmit={applyFilters} className="space-y-4">
            <div>
              <label
                htmlFor="category-search"
                className="mb-2 block text-sm font-medium"
              >
                جست‌وجو در این دسته
              </label>

              <input
                id="category-search"
                name="q"
                type="search"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="نام محصول..."
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">
                محدوده قیمت (تومان)
              </p>

              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="حداقل قیمت"
                  name="minPrice"
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="از"
                  className="min-w-0 w-full rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
                />

                <input
                  aria-label="حداکثر قیمت"
                  name="maxPrice"
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="تا"
                  className="min-w-0 w-full rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="inStock"
                checked={filters.inStock}
                onChange={handleFilterChange}
                className="h-4 w-4 accent-pink-500"
              />
              فقط کالاهای موجود
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="discounted"
                checked={filters.discounted}
                onChange={handleFilterChange}
                className="h-4 w-4 accent-pink-500"
              />
              فقط کالاهای تخفیف‌دار
            </label>

            <div>
              <label
                htmlFor="category-file-type"
                className="mb-2 block text-sm font-medium"
              >
                نوع فایل
              </label>

              <select
                id="category-file-type"
                name="fileType"
                value={filters.fileType}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              >
                <option value="">همه نوع‌ها</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="AUDIO">صوتی</option>
                <option value="ZIP">ZIP</option>
                <option value="RAR">RAR</option>
              </select>
            </div>

            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              اعمال فیلترها
            </button>
          </form>
        </aside>

        <section
          className="min-w-0 md:col-span-3"
          aria-label="فهرست محصولات"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-sm text-[var(--color-muted)]">
              {pagination.totalItems.toLocaleString("fa-IR")} نتیجه
            </p>

            <label className="flex items-center gap-2 text-sm">
              مرتب‌سازی:

              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="max-w-[170px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-sm"
              >
                <option value="newest">جدیدترین</option>
                <option value="cheapest">ارزان‌ترین</option>
                <option value="expensive">گران‌ترین</option>
                <option value="popular">پربازدیدترین</option>
              </select>
            </label>
          </div>

          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--color-muted)]">
                فیلترهای فعال:
              </span>

              {appliedFilters.q && (
                <span className="rounded-full bg-[var(--color-hover)] px-3 py-1 text-xs">
                  جست‌وجو: {appliedFilters.q}
                </span>
              )}

              {appliedFilters.minPrice && (
                <span className="rounded-full bg-[var(--color-hover)] px-3 py-1 text-xs">
                  از {Number(appliedFilters.minPrice).toLocaleString("fa-IR")}
                </span>
              )}

              {appliedFilters.maxPrice && (
                <span className="rounded-full bg-[var(--color-hover)] px-3 py-1 text-xs">
                  تا {Number(appliedFilters.maxPrice).toLocaleString("fa-IR")}
                </span>
              )}

              {appliedFilters.inStock && (
                <span className="rounded-full bg-[var(--color-hover)] px-3 py-1 text-xs">
                  فقط موجود
                </span>
              )}

              {appliedFilters.discounted && (
                <span className="rounded-full bg-[var(--color-hover)] px-3 py-1 text-xs">
                  تخفیف‌دار
                </span>
              )}

              {appliedFilters.fileType && (
                <span className="rounded-full bg-[var(--color-hover)] px-3 py-1 text-xs">
                  نوع فایل: {appliedFilters.fileType}
                </span>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                حذف همه
              </button>
            </div>
          )}

          {loading ? (
            <LoadingCards />
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
            >
              <p className="mb-3 text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => setRetryKey((value) => value + 1)}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
              >
                تلاش دوباره
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-12 text-center">
              <p className="mb-2 font-bold text-[var(--color-text)]">
                محصولی پیدا نشد
              </p>

              <p className="mb-4 text-sm text-[var(--color-muted)]">
                عبارت جست‌وجو یا فیلترها را تغییر دهید.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {products.map((product) => {
                const discountPercent = calculateDiscount(
                  product.price,
                  product.discountPrice
                );

                return (
                  <ProductCard
                    key={product._id}
                    product={{
                      ...product,
                      price: formatPrice(product.effectivePrice),
                      oldPrice: product.isDiscounted
                        ? formatPrice(product.price)
                        : null,
                      discount: product.isDiscounted
                        ? `${discountPercent}٪`
                        : null,
                    }}
                  />
                );
              })}
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="mt-5 rounded-xl bg-[var(--color-surface)]">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                onPageChange={setPage}
                itemsPerPage={pagination.limit || 12}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
