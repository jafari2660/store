"use client";

import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GeneralError from "@/components/ui/GeneralError";
import { AiOutlineEdit, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/app/lib/numberUtils";
import Pagination from "@/components/ui/Pagination";
import AuthWrapper from "@/components/auth/Auth";

const DiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedCells, setExpandedCells] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDiscountCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/discountCodes");

      if (!response.ok) {
        throw new Error("مشکل در دریافت کدهای تخفیف");
      }

      const data = await response.json();
      setDiscountCodes(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const toPersianDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("fa-IR").format(date);
  };

  const filteredDiscountCodes = discountCodes.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    return [
      item._id,
      item.code,
      item.percentage,
      toPersianDigits(item.percentage),
      toPersianDate(item.expiresDate),
      toPersianDigits(toPersianDate(item.expiresDate)),
      item.isActive ? "فعال" : "غیرفعال",
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(search),
    );
  });

  const totalPages = Math.ceil(filteredDiscountCodes.length / itemsPerPage);

  const currentDiscountCodes = filteredDiscountCodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این کد تخفیف مطمئن هستید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/discountCodes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("حذف کد تخفیف انجام نشد");
      }

      setDiscountCodes((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      setError(error.message);
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

          <main className="min-h-[80vh] min-w-0 p-2 sm:p-4 md:p-5">
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <h4 className="font-bold text-[var(--color-text)]">
                  مدیریت کدهای تخفیف
                </h4>

                <Link
                  href="/admin/discountCodes/add"
                  className="btn-custom-add inline-flex w-fit items-center justify-center gap-2"
                >
                  <AiOutlinePlus />
                  افزودن
                </Link>
              </div>

              <div className="p-3 sm:p-5">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="جست‌وجو بر اساس شناسه، کد، درصد، تاریخ یا وضعیت..."
                  aria-label="جست‌وجو در کدهای تخفیف"
                  className="w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="w-full min-w-0 overflow-x-auto">
                {error && <GeneralError error={error} />}

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <table className="w-full min-w-[760px] table-fixed border-collapse text-right">
                    <thead>
                      <tr className="bg-[var(--color-background)] text-sm text-[var(--color-muted)]">
                        <th className="table-header-cell">شناسه</th>
                        <th className="table-header-cell">کد تخفیف</th>
                        <th className="table-header-cell">درصد تخفیف</th>
                        <th className="table-header-cell">تاریخ انقضا</th>
                        <th className="table-header-cell">وضعیت</th>
                        <th className="table-header-cell">عملیات</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDiscountCodes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="table-cell text-center">
                            {searchTerm.trim()
                              ? "نتیجه‌ای برای جست‌وجوی شما پیدا نشد."
                              : "کد تخفیفی ثبت نشده است."}
                          </td>
                        </tr>
                      ) : (
                        currentDiscountCodes.map((item) => (
                          <tr key={item._id}>
                            <td
                              className={`table-cell cursor-pointer hover:bg-[var(--color-hover)] ${
                                expandedCells[`${item._id}-id`]
                                  ? "whitespace-nowrap overflow-visible"
                                  : "truncate whitespace-nowrap overflow-hidden"
                              }`}
                              dir="ltr"
                              onClick={() =>
                                setExpandedCells((prev) => ({
                                  ...prev,
                                  [`${item._id}-id`]: !prev[`${item._id}-id`],
                                }))
                              }
                              title="برای نمایش کامل شناسه کلیک کنید"
                            >
                              {item._id}
                            </td>

                            <td className="table-cell">{item.code}</td>

                            <td className="table-cell">
                              {toPersianDigits(item.percentage)}٪
                            </td>

                            <td className="table-cell">
                              {toPersianDigits(toPersianDate(item.expiresDate))}
                            </td>

                            <td className="table-cell">
                              {item.isActive ? "فعال" : "غیرفعال"}
                            </td>

                            <td className="table-cell">
                              <div className="flex justify-center gap-2">
                                <Link
                                  href={`/admin/discountCodes/${item._id}`}
                                  className="btn-custom-edit"
                                  title="ویرایش"
                                >
                                  <AiOutlineEdit size={18} />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(item._id)}
                                  className="btn-custom-delete"
                                  title="حذف"
                                >
                                  <AiOutlineDelete size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredDiscountCodes.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
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

export default DiscountCodes;
