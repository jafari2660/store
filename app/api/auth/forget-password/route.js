"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPhone, FaShieldAlt, FaLock, FaArrowRight } from "react-icons/fa";

const ForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const phoneRegex = /^(\+98|0)?9\d{9}$/;

  // ارسال کد بازیابی رمز
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!phoneRegex.test(phone)) {
      setError("شماره موبایل وارد شده صحیح نیست.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          type: "reset-password",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "ارسال کد تأیید ناموفق بود.");
        return;
      }

      setSuccess(data.message || "کد تأیید برای شما ارسال شد.");
      setStep(2);
    } catch {
      setError("خطایی هنگام ارسال کد رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  // تأیید کد و ثبت رمز جدید
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(code)) {
      setError("کد تأیید باید شامل ۶ رقم باشد.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد.");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          code,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "بازیابی رمز عبور ناموفق بود.");
        return;
      }

      setSuccess("رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch {
      setError("خطایی هنگام تغییر رمز عبور رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <section
        dir="rtl"
        className="w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl sm:p-8"
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-background)]">
          {step === 1 ? (
            <FaPhone className="h-9 w-9 text-[var(--color-primary)]" />
          ) : step === 2 ? (
            <FaShieldAlt className="h-9 w-9 text-[var(--color-primary)]" />
          ) : (
            <FaLock className="h-9 w-9 text-[var(--color-primary)]" />
          )}
        </div>

        <h1 className="text-center text-2xl font-extrabold text-[var(--color-text)]">
          فراموشی رمز عبور
        </h1>

        <p className="mt-3 text-center text-sm leading-7 text-[var(--color-muted)]">
          {step === 1
            ? "شماره موبایل حساب کاربری خود را وارد کنید."
            : step === 2
              ? "کد تأیید ارسال‌شده و رمز عبور جدید خود را وارد کنید."
              : "رمز عبور جدید خود را تعیین کنید."}
        </p>

        <div className="mt-6">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  شماره موبایل
                </label>

                <input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="شماره موبایل"
                  required
                  className="h-14 w-full rounded-full bg-[var(--color-background)] px-5 text-left text-sm outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-white disabled:opacity-60"
              >
                {loading ? "در حال ارسال..." : "دریافت کد تأیید"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  کد تأیید
                </label>

                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="کد تأیید ۶ رقمی"
                  required
                  className="h-14 w-full rounded-full bg-[var(--color-background)] px-5 text-center outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  رمز عبور جدید
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="حداقل ۸ کاراکتر"
                  required
                  className="h-14 w-full rounded-full bg-[var(--color-background)] px-5 outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  تکرار رمز عبور
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="رمز عبور را دوباره وارد کنید"
                  required
                  className="h-14 w-full rounded-full bg-[var(--color-background)] px-5 outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-white disabled:opacity-60"
              >
                {loading ? "در حال ثبت..." : "تغییر رمز عبور"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setCode("");
                  setPassword("");
                  setConfirmPassword("");
                  setError("");
                  setSuccess("");
                }}
                className="w-full py-2 text-sm text-[var(--color-muted)]"
              >
                تغییر شماره موبایل
              </button>
            </form>
          )}
        </div>

        <Link
          href="/auth/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          <FaArrowRight />
          بازگشت به صفحه ورود
        </Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
