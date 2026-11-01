"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgetPasswordPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const normalizedPhone = phone.trim();

    if (!/^(\+98|0)?9\d{9}$/.test(normalizedPhone)) {
      setError("شماره موبایل معتبر نیست");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          type: "reset-password",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "ارسال کد تایید ناموفق بود");
        return;
      }

      setPhone(normalizedPhone);
      setStep(2);
      setMessage("کد تایید برای شما ارسال شد");
    } catch (error) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError("کد تایید باید ۶ رقم باشد");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد");
      return;
    }

    if (password !== confirmPassword) {
      setError("تکرار رمز عبور مطابقت ندارد");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "تغییر رمز عبور ناموفق بود");
        return;
      }

      setStep(3);
      setMessage("رمز عبور شما با موفقیت تغییر کرد");
    } catch (error) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg sm:p-8">

        <h1 className="mb-2 text-center text-2xl font-bold text-[var(--color-text)]">
          فراموشی رمز عبور
        </h1>

        <p className="mb-6 text-center text-sm text-[var(--color-muted)]">
          {step === 1 && "شماره موبایل خود را وارد کنید"}
          {step === 2 && "کد تایید و رمز عبور جدید را وارد کنید"}
          {step === 3 && "رمز عبور شما با موفقیت تغییر کرد"}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && step !== 3 && (
          <div className="mb-4 rounded-lg bg-[var(--color-hover)] p-3 text-sm text-[var(--color-primary)]">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="شماره موبایل"
              disabled={loading}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-hover)] disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--color-primary)] p-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "در حال ارسال..." : "ارسال کد تایید"}
            </button>

          </form>
        ) : step === 2 ? (
          <form onSubmit={handleResetPassword} className="space-y-4">

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="کد تایید ۶ رقمی"
              disabled={loading}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-hover)] disabled:opacity-50"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور جدید"
              disabled={loading}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-hover)] disabled:opacity-50"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="تکرار رمز عبور جدید"
              disabled={loading}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-hover)] disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--color-primary)] p-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "در حال تغییر رمز..." : "تغییر رمز عبور"}
            </button>

          </form>
        ) : (
          <div className="space-y-4 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-hover)] text-3xl text-[var(--color-primary)]">
              ✓
            </div>

            <p className="text-sm text-[var(--color-text)]">
              رمز عبور شما با موفقیت تغییر کرد.
            </p>

            <Link
              href="/auth/login"
              className="block text-[var(--color-primary)] hover:underline"
            >
              ورود به حساب کاربری
            </Link>

          </div>
        )}

        {step !== 3 && (
          <div className="mt-6 text-center text-sm">
            <Link
              href="/auth/login"
              className="text-[var(--color-primary)] hover:underline"
            >
              بازگشت به صفحه ورود
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
