"use client";

import { toPersianDigits } from "@/app/lib/numberUtils";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const maxVisiblePages = 3;

  let startPage = Math.max(
    1,
    currentPage - Math.floor(maxVisiblePages / 2)
  );

  let endPage = Math.min(
    totalPages,
    startPage + maxVisiblePages - 1
  );

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] p-4">
      <p className="text-sm text-[var(--color-muted)]">
        صفحه {toPersianDigits(currentPage)} از{" "}
        {toPersianDigits(totalPages)}
        {" — "}
        مجموع {toPersianDigits(totalItems)} مورد
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm disabled:opacity-40"
        >
          قبلی
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-10 rounded-lg border px-3 py-2 text-sm ${
              currentPage === page
                ? "border-pink-500 bg-pink-500 text-white"
                : "border-[var(--color-border)] text-[var(--color-text)] hover:bg-pink-50"
            }`}
          >
            {toPersianDigits(page)}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm disabled:opacity-40"
        >
          بعدی
        </button>
      </div>
    </div>
  );
}