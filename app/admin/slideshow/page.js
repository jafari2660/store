
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import AuthWrapper from "@/components/auth/Auth";

const positionLabels = {
  main: "اسلاید اصلی",
  sideTop: "بنر کناری بالا",
  sideBottom: "بنر کناری پایین",
};

export default function SlideshowAdmin() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/slideshow?all=true");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در دریافت اسلایدها");
      }

      setSlides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "آیا از حذف این اسلاید مطمئن هستید؟"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/slideshow/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "حذف اسلاید انجام نشد");
      }

      setSlides((prev) =>
        prev.filter((slide) => slide._id !== id)
      );
    } catch (err) {
      alert(err.message || "خطا در حذف اسلاید");
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen w-full min-w-0">
        <div className="flex min-h-screen w-full min-w-0">
          <div className="hidden shrink-0 md:block md:w-64">
            <Sidebar />
          </div>

          <div className="min-w-0 w-full flex-1">
            <Header />

            <main className="min-w-0 p-3 md:p-5">
              <div className="mx-auto max-w-6xl space-y-5">

                {/* عنوان و دکمه افزودن */}
                <section className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-lg font-bold text-[var(--color-text)]">
                      مدیریت اسلایدشو
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      مدیریت تصاویر و بنرهای صفحه اصلی
                    </p>
                  </div>

                  <Link
                    href="/admin/slideshow/new"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    + افزودن اسلاید جدید
                  </Link>
                </section>

                {/* جدول */}
                <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                  <div className="border-b border-[var(--color-border)] p-4">
                    <h2 className="font-bold text-[var(--color-text)]">
                      فهرست اسلایدها
                    </h2>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      تعداد اسلایدها: {slides.length}
                    </p>
                  </div>

                  {error && (
                    <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <p className="p-8 text-center text-sm text-[var(--color-muted)]">
                      در حال دریافت اسلایدها...
                    </p>
                  ) : slides.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="mb-4 text-sm text-[var(--color-muted)]">
                        هنوز اسلایدی ثبت نشده است.
                      </p>
                      <Link
                        href="/admin/slideshow/new"
                        className="text-sm font-medium text-[var(--color-primary)]"
                      >
                        افزودن اولین اسلاید
                      </Link>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[760px] text-right">
                        <thead>
                          <tr className="bg-[var(--color-background)] text-xs text-[var(--color-muted)]">
                            <th className="whitespace-nowrap p-4">ردیف</th>
                            <th className="whitespace-nowrap p-4">تصویر</th>
                            <th className="whitespace-nowrap p-4">لینک مقصد</th>
                            <th className="whitespace-nowrap p-4">محل نمایش</th>
                            <th className="whitespace-nowrap p-4">ترتیب</th>
                            <th className="whitespace-nowrap p-4">وضعیت</th>
                            <th className="whitespace-nowrap p-4">عملیات</th>
                          </tr>
                        </thead>

                        <tbody>
                          {slides.map((slide, index) => (
                            <tr
                              key={slide._id}
                              className="border-t border-[var(--color-border)] text-sm text-[var(--color-text)]"
                            >
                              <td className="p-4">{index + 1}</td>

                              <td className="p-3">
                                <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-[var(--color-border)]">
                                  <Image
                                    src={slide.image}
                                    alt="تصویر اسلاید"
                                    fill
                                    unoptimized
                                    sizes="96px"
                                    className="object-cover"
                                  />
                                </div>
                              </td>

                              <td className="max-w-48 truncate p-4">
                                {slide.link}
                              </td>

                              <td className="whitespace-nowrap p-4">
                                {positionLabels[slide.position] || slide.position}
                              </td>

                              <td className="p-4">{slide.order}</td>

                              <td className="p-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs ${
                                    slide.isActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {slide.isActive ? "فعال" : "غیرفعال"}
                                </span>
                              </td>

                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/admin/slideshow/new?edit=${slide._id}`}
                                    className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
                                  >
                                    ویرایش
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(slide._id)}
                                    className="whitespace-nowrap rounded-lg bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

              </div>
            </main>
          </div>

          <div className="md:hidden">
            <Sidebar />
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
