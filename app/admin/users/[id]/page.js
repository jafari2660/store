"use client";

import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthWrapper from "@/components/auth/Auth";

const UpdateUser = () => {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "کاربر پیدا نشد");
        }

        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setRole(data.role ?? "USER");
      } catch (error) {
        setError(error.message || "مشکلی در دریافت اطلاعات کاربر پیش آمده است");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormError("");

    if (!name.trim() || name.trim().length < 3 || name.trim().length > 30) {
      setFormError("نام باید بین ۳ تا ۳۰ کاراکتر باشد");
      return;
    }

    if (!phone.trim()) {
      setFormError("شماره موبایل الزامی می‌باشد");
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "مشکلی در ویرایش کاربر پیش آمده است");
        return;
      }

      router.push("/admin/users");
    } catch {
      setError("مشکلی در ارتباط با سرور پیش آمده است");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthWrapper>
    <div className="min-h-screen w-full min-w-0 overflow-x-clip">
      <div className="flex min-h-screen w-full min-w-0">
        <div className="hidden shrink-0 md:block md:w-64">
          <Sidebar />
        </div>

        <div className="min-w-0 flex-1">
          <Header />

          <main className="min-h-[80vh] min-w-0 p-2 sm:p-3 md:p-4">
            <div className="mx-auto w-full max-w-3xl min-w-0 rounded-xl border border-[var(--color-border)] p-3 shadow-sm sm:p-5 md:p-6">
              <h2 className="my-4">ویرایش کاربر</h2>

              {error && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {formError && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    نام کاربر
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="نام کاربر را وارد کنید"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    شماره موبایل
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="شماره موبایل را وارد کنید"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    ایمیل (اختیاری)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="ایمیل را وارد کنید"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    نقش کاربر
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field"
                  >
                    <option value="USER">کاربر</option>
                    <option value="ADMIN">ادمین</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition hover:opacity-80 sm:w-auto"
                >
                  ذخیره تغییرات
                </button>
              </form>
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

export default UpdateUser;
