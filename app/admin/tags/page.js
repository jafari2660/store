"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GeneralError from "@/components/ui/GeneralError";
import { AiOutlinePlus } from "react-icons/ai";

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 10;

  const filteredTags = tags.filter((tag) =>
    String(tag.name ?? "")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);

  const currentTags = filteredTags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/tags");
        if (!response.ok) {
          throw new Error("مشکل در دریافت برچسب‌ها");
        }

        const data = await response.json();
        setTags(Array.isArray(data) ? data : data.tags || []);
      } catch (error) {
        setError(error.message || "مشکلی در دریافت برچسب‌ها رخ داد");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این برچسب مطمئن هستید؟")) return;

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "حذف برچسب انجام نشد");
      }

      setTags((previousTags) =>
        previousTags.filter((tag) => tag._id !== id)
      );
      setError(null);
    } catch (error) {
      setError(error.message || "مشکلی در حذف برچسب رخ داد");
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0">
      <div className="flex min-h-screen w-full min-w-0">
        {/* سایدبار دسکتاپ */}
        <div className="hidden md:block md:w-64 md:shrink-0">
          <Sidebar />
        </div>

        {/* محتوای اصلی */}
        <div className="min-w-0 w-full flex-1">
          <Header />

          <main className="min-w-0 p-2 sm:p-3 md:p-4">
            <div className="content min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              {/* عنوان و دکمه افزودن */}
              <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <h4 className="text-base font-bold text-[var(--color-text)] sm:text-lg">
                  مدیریت برچسب‌ها
                </h4>

                <Link
                  href="/admin/tags/add"
                  className="btn-custom-add inline-flex w-fit items-center justify-center gap-2"
                >
                  <AiOutlinePlus />
                  افزودن برچسب
                </Link>
              </div>

              {/* جست‌وجو */}
              <div className="border-b border-[var(--color-border)] p-3 sm:p-5">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="جست‌وجو بر اساس نام برچسب..."
                  aria-label="جست‌وجو در برچسب‌ها"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              {/* جدول */}
              <div className="min-w-0 overflow-x-auto">
                {error && <GeneralError error={error} />}

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <table className="w-full min-w-[600px] border-collapse text-right">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                        <th className="p-3 text-sm font-semibold text-[var(--color-text)] sm:p-4">
                          #
                        </th>
                        <th className="p-3 text-sm font-semibold text-[var(--color-text)] sm:p-4">
                          نام برچسب
                        </th>
                        <th className="p-3 text-sm font-semibold text-[var(--color-text)] sm:p-4">
                          عملیات
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTags.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-6 text-center text-sm text-[var(--color-text)]"
                          >
                            {searchTerm.trim()
                              ? "نتیجه‌ای برای جست‌وجوی شما پیدا نشد."
                              : "هنوز برچسبی ثبت نشده است."}
                          </td>
                        </tr>
                      ) : (
                        currentTags.map((tag, index) => (
                          <tr
                            key={tag._id}
                            className="border-b border-[var(--color-border)] last:border-b-0"
                          >
                            <td className="p-3 text-sm text-[var(--color-text)] sm:p-4">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>

                            <td className="p-3 text-sm text-[var(--color-text)] sm:p-4">
                              {tag.name}
                            </td>

                            <td className="p-3 sm:p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/admin/tags/edit/${tag._id}`}
                                  className="btn-custom-edit"
                                >
                                  ویرایش
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(tag._id)}
                                  className="btn-custom-delete"
                                >
                                  حذف
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* صفحه‌بندی */}
              {!loading && filteredTags.length > 0 && (
                <div className="min-w-0 overflow-x-auto">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredTags.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </main>
        </div>

        {/* سایدبار موبایل */}
        <div className="md:hidden">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default TagsPage;