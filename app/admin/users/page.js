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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(users.length / itemsPerPage);

 const currentUsers = users.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error("مشکل دریافت اطلاعات کاربران ");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("حذف کاربر انجام نشد");
      }

      setUsers((previousUsers) =>
        previousUsers.filter((user) => user._id !== id),
      );
    } catch (error) {
      setError(error.message || "مشکلی در حذف پیش آمد");
    }
  };

  const handleRoleChange = async (user) => {
    const role = user.role === "ADMIN" ? "USER" : "ADMIN";

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("تغییر نقش کاربر انجام نشد");
      }

      const updatedUser = await response.json();

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === user._id ? updatedUser : item,
        ),
      );
    } catch (error) {
      setError(error.message || "مشکلی در تغییر نقش پیش آمد");
    }
  };

  return (
    <AuthWrapper>
    <div className="w-full">
      <div className="flex flex-wrap">
        <div className="h-screen w-full md:w-1/6">
          <Sidebar />
        </div>

        <div className="w-full md:w-5/6">
          <Header />

          <main className="p-4">
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
                <h4 className="font-bold text-[var(--color-text)]">
                  مدیریت کاربران
                </h4>

                <Link href="/admin/users/add" className="btn-custom-add">
                  <AiOutlinePlus />
                  افزودن
                </Link>
              </div>

              <div className="w-full min-w-0 overflow-x-auto">
                {error && <GeneralError error={error} />}

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <table className="w-full min-w-[750px] table-auto border-collapse text-right">
                    <thead>
                      <tr className="bg-[var(--color-background)] text-sm text-[var(--color-muted)]">
                        <th className="px-5 py-4 font-semibold">شناسه</th>
                        <th className="px-5 py-4 font-semibold"> نام کاربر</th>
                        <th className="px-5 py-4 font-semibold"> موبایل </th>
                        <th className="px-5 py-4 font-semibold"> ایمیل </th>
                        <th className="px-5 py-4 font-semibold"> وضعیت </th>
                        <th className="px-5 py-4 font-semibold">عملیات</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border)]">
                      {currentUsers.map((user, index) => (
                        <tr
                          key={user._id || index}
                          className="transition-colors duration-200 hover:bg-[var(--color-hover)]"
                        >
                          <td className="px-5 py-2 text-sm text-[var(--color-text)]">
                            {toPersianDigits(user._id)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-2 text-sm font-medium text-[var(--color-text)]">
                            {user.name}
                          </td>

                          <td className="px-5 py-2 text-sm font-medium text-[var(--color-text)]">
                            {user.phone}
                          </td>

                          <td className="px-5 py-2 text-sm font-medium text-[var(--color-text)]">
                            {user.email?.trim() || "ایمیل وارد نشده"}
                          </td>

                          <td className="px-5 py-2 text-sm font-medium text-[var(--color-text)]">
                            {user.role === "ADMIN" ? "ادمین" : "کاربر"}
                          </td>

                          <td className="px-5 py-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleRoleChange(user)}
                                className="whitespace-nowrap btn-custom-edit"
                              >
                                {user.role === "ADMIN"
                                  ? "تبدیل به کاربر"
                                  : "تبدیل به ادمین"}
                              </button>
                              <Link
                                href={`/admin/users/${user._id}`}
                                className="btn-custom-edit"
                                title="ویرایش"
                              >
                                <AiOutlineEdit size={18} />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDelete(user._id)}
                                className="btn-custom-delete"
                                title="حذف"
                              >
                                <AiOutlineDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {users.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-6 text-center text-[var(--color-muted)]"
                          >
                            هنوز کاربری ثبت نشده است.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {!loading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={users.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
    </AuthWrapper>
  );
};

export default Users;
