"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FaUser, FaPhone } from "react-icons/fa";
import NoAuthWrapper from "@/components/auth/NoAuthWrapper";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const phoneRegex = /^(\+98|0)?9\d{9}$/;

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    const normalizedPhone = phone.trim();

    if (!phoneRegex.test(normalizedPhone)) {
      setError("شماره موبایل وارد شده صحیح نیست.");
      return;
    }

    if (!loginPassword) {
      setError("رمز عبور را وارد کنید.");
      return;
    }

    try {
      setLoading(true);

      const result = await signIn("credentials", {
        phone,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setError("شماره موبایل یا رمز عبور اشتباه است.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("خطایی هنگام ورود رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoAuthWrapper>
    <main className="h-screen box-border overflow-hidden bg-[var(--color-background)] p-3 sm:p-4 lg:p-8">
      <div
        dir="ltr"
        className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 overflow-hidden rounded-3xl bg-[var(--color-surface)] shadow-xl lg:grid-cols-2"
      >
        
        <section className="relative hidden min-h-0 overflow-hidden bg-[var(--color-hover)] lg:block">
          <img
            src="/images/login-illustration.png"
            alt="تصویر ورود به سیستم"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>

        
        <section
          dir="rtl"
          className="relative flex min-h-0 items-start justify-center overflow-y-auto bg-[var(--color-surface)] px-4 pt-12 py-3 sm:px-8 sm:py-4 lg:px-10"
          style={{ zoom: 0.9 }}
        >
          <div className="relative w-full max-w-md">
            <div className="mx-auto mb-3 mt-2 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-background)]">
              <FaUser className="h-12 w-12 text-[var(--color-primary)]" />
            </div>

            <h1 className="text-center text-3xl font-extrabold text-[var(--color-text)]">
              ورود به سیستم
            </h1>

            <p className="mt-3 text-center text-sm leading-7 text-[var(--color-muted)]">
              برای ورود به حساب کاربری، شماره موبایل و رمز عبور خود را وارد
              کنید.
            </p>

            <div className="mt-5">
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  {success}
                </div>
              )}

              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    شماره موبایل
                  </label>

                  <div className="flex h-14 items-center gap-4 rounded-full border border-transparent bg-[var(--color-background)] px-5 focus-within:border-[var(--color-primary)] focus-within:bg-white">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      dir="ltr"
                      placeholder="شماره موبایل"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="min-w-0 flex-1 border-0 bg-transparent text-left text-sm text-[var(--color-text)] outline-none placeholder:text-right placeholder:text-[var(--color-muted)] focus:border-0 focus:ring-0"
                    />

                    <FaPhone className="h-6 w-6 shrink-0 text-[var(--color-muted)]" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="loginPassword"
                    className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    رمز عبور
                  </label>

                  <input
                    id="loginPassword"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="رمز عبور خود را وارد کنید"
                    required
                    className="h-14 w-full rounded-full bg-[var(--color-background)] px-5 text-sm outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="flex justify-start">
                  <Link
                    href="/auth/forget-password"
                    className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    فراموشی رمز عبور
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-full border-0 bg-[var(--color-primary)] font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                >
                  {loading ? "لطفاً صبر کنید..." : "ورود به سیستم"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
    </NoAuthWrapper>
  );
};

export default Login;
