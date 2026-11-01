"use client";

import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GeneralError from "@/components/ui/GeneralError";
import { AiOutlineEdit, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { toPersianDigits } from "@/app/lib/numberUtils";
import AuthWrapper from "@/components/auth/Auth";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const filteredCategories = categories.filter((category) =>
    String(category.name ?? "")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("مشکل در دریافت دسته بندی ها");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("حذف دسته‌بندی انجام نشد");
      }

      setCategories((previousCategories) =>
        previousCategories.filter((category) => category._id !== id),
      );
    } catch (error) {
      setError(error.message || "مشکلی در حذف پیش آمد");
    }
  };

  return ( 
  <AuthWrapper>
    <div className="min-h-screen w-full min-w-0">
      <div className="flex min-h-screen w-full min-w-0">
        <div className="hidden md:block md:w-64 md:shrink-0">
          <Sidebar />
        </div>

        <div className="min-w-0 w-full flex-1">
          <Header />

          <main className="min-w-0 p-2 sm:p-3 md:p-4">
            <div className="content min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)] p-0 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <h4 className="text-base font-bold text-[var(--color-text)] sm:text-lg">
                  مدیریت دسته بندی ها
                </h4>

                <Link
                  href="/admin/categories/add"
                  className="btn-custom-add w-fit"
                >
                  <AiOutlinePlus />
                  افزودن
                </Link>
              </div>
              <div className="border-b border-[var(--color-border)] p-3 sm:p-5">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="جست‌وجوی نام دسته‌بندی..."
                  aria-label="جست‌وجوی دسته‌بندی‌ها"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-right text-[var(--color-text)] outline-none transition focus:border-blue-500 sm:max-w-md"
                />
              </div>
              <div className="w-full min-w-0 overflow-x-auto lg:overflow-x-hidden">
                {error && <GeneralError error={error} />}

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <table className="w-full min-w-[500px] table-fixed border-collapse text-right lg:min-w-0">
                    <thead>
                      <tr className="bg-[var(--color-background)] text-sm text-[var(--color-muted)]">
                        <th className="table-header-cell">شناسه</th>
                        <th className="table-header-cell">نام</th>
                        <th className="table-header-cell">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {currentCategories.map((category, index) => (
                        <tr
                          key={category._id || index}
                          className="transition-colors duration-200 hover:bg-[var(--color-hover)]"
                        >
                          <td className="table-cell">
                            {toPersianDigits(
                              (currentPage - 1) * itemsPerPage + index + 1,
                            )}
                          </td>

                          <td className="table-cell">{category.name}</td>

                          <td className="table-cell">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/admin/categories/${category._id}`}
                                className="btn-custom-edit"
                                title="ویرایش"
                                aria-label={`ویرایش ${category.name}`}
                              >
                                <AiOutlineEdit size={18} />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDelete(category._id)}
                                className="btn-custom-delete"
                                title="حذف"
                                aria-label={`حذف ${category.name}`}
                              >
                                <AiOutlineDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredCategories.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 py-6 text-center text-sm text-[var(--color-muted)] sm:px-5"
                          >
                            {searchTerm.trim()
                              ? "دسته‌بندی‌ای با این نام پیدا نشد."
                              : "هنوز دسته‌بندی‌ای ثبت نشده است."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {!loading && (
                <div className="min-w-0 overflow-x-auto">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredCategories.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
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
};

export default Categories;
