"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GeneralError from "@/components/ui/GeneralError";
import Pagination from "@/components/ui/Pagination";
import { toPersianDigits } from "@/app/lib/numberUtils";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/comments");

        if (!response.ok) {
          throw new Error("مشکل در دریافت نظرات");
        }

        const data = await response.json();
        setComments(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const handleToggleApproval = async (comment) => {
    setUpdatingId(comment._id);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: !comment.isApproved,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "مشکل در تغییر وضعیت نظر");
      }

      setComments((prevComments) =>
        prevComments.map((item) =>
          item._id === comment._id
            ? { ...item, isApproved: data.isApproved }
            : item,
        ),
      );
    } catch (error) {
      setError(error.message || "مشکلی در ارتباط با سرور پیش آمده است");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredComments = comments.filter((comment) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return true;

    const searchableText = [
      comment.user?.name,
      comment.user?.phone,
      comment.text,
      comment.product?.name,
      comment.isApproved ? "تأیید شده" : "در انتظار تأیید",
      comment.isApproved ? "تایید شده" : "در انتظار تایید",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

  const currentComments = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen w-full min-w-0">
      <div className="flex min-h-screen w-full min-w-0">
        <div className="hidden shrink-0 md:block md:w-64">
          <Sidebar />
        </div>

        <div className="min-w-0 flex-1">
          <Header />

          <main className="min-h-[80vh] min-w-0 p-2 sm:p-4 md:p-6">
            <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)]
             bg-[var(--color-surface)] shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-3 sm:p-5">
                <h4 className="font-bold text-[var(--color-text)]">
                  مدیریت نظرات
                </h4>
              </div>

              <div className="border-b border-[var(--color-border)] p-3 sm:p-4">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="جست‌وجو در نام کاربر، موبایل، متن نظر یا محصول..."
                  aria-label="جست‌وجو در نظرات"
                  className="w-full min-w-0 rounded-lg border border-[var(--color-border)] 
                  bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)]
                   outline-none transition focus:border-[var(--color-primary)] sm:max-w-md"
                />

                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  تعداد نتایج: {toPersianDigits(filteredComments.length)}
                </p>
              </div>

              <div className="min-w-0">
                {error && <GeneralError error={error} />}

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[900px] table-fixed border-collapse text-right">
                      <thead>
                        <tr className="bg-[var(--color-background)] text-sm text-[var(--color-muted)]">
                          <th className="table-header-cell">شناسه</th>
                          <th className="table-header-cell">نام کاربر</th>
                          <th className="table-header-cell">شماره موبایل</th>
                          <th className="table-header-cell">متن نظر</th>
                          <th className="table-header-cell">نام محصول</th>
                          <th className="table-header-cell">وضعیت تأیید</th>
                          <th className="table-header-cell">تاریخ ثبت</th>
                          <th className="table-header-cell">عملیات</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[var(--color-border)]">
                        {currentComments.map((comment, index) => (
                          <tr
                            key={comment._id}
                            className="transition-colors duration-200 hover:bg-[var(--color-hover)]"
                          >
                            <td className="table-cell">
                              {toPersianDigits(
                                (currentPage - 1) * itemsPerPage + index + 1,
                              )}
                            </td>

                            <td className="table-cell">
                              {comment.user?.name || "نامشخص"}
                            </td>

                            <td className="table-cell">
                              {toPersianDigits(comment.user?.phone || "نامشخص")}
                            </td>

                            <td
                              className="table-cell"
                              title={comment.text || ""}
                            >
                              {comment.text || "بدون متن"}
                            </td>

                            <td className="table-cell">
                              {comment.product?.name || "نامشخص"}
                            </td>

                            <td className="table-cell">
                              <span
                                className={
                                  comment.isApproved
                                    ? "font-medium text-green-600"
                                    : "font-medium text-amber-600"
                                }
                              >
                                {comment.isApproved
                                  ? "تأیید شده"
                                  : "در انتظار تأیید"}
                              </span>
                            </td>

                            <td className="table-cell">
                              {comment.createdAt
                                ? toPersianDigits(
                                    new Date(
                                      comment.createdAt,
                                    ).toLocaleDateString("fa-IR"),
                                  )
                                : "نامشخص"}
                            </td>

                            <td className="table-cell">
                              <button
                                type="button"
                                onClick={() => handleToggleApproval(comment)}
                                disabled={updatingId === comment._id}
                                className={`rounded-md border px-2 py-2 text-xs text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 ${
                                  comment.isApproved
                                    ? "border-slate-700 bg-slate-700"
                                    : "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                }`}
                              >
                                {updatingId === comment._id
                                  ? "در حال ثبت..."
                                  : comment.isApproved
                                    ? "لغو تأیید"
                                    : "تأیید نظر"}
                              </button>
                            </td>
                          </tr>
                        ))}

                        {currentComments.length === 0 && (
                          <tr>
                            <td
                              colSpan={8}
                              className="p-6 text-center text-sm text-[var(--color-muted)]"
                            >
                              {searchTerm.trim()
                                ? "نظری با این عبارت پیدا نشد."
                                : "نظری برای نمایش وجود ندارد."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && (
                  <div className="min-w-0 overflow-x-auto">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredComments.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        <div className="md:hidden">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Comments;
