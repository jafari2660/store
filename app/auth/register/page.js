"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaUser,
  FaPhone,
  FaShieldAlt,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [otp, setOtp] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name || name.trim().length < 3 || name.trim().length > 30) {
      setError("نام و نام خانوادگی باید بین 3 تا 30 کاراکتر باشد.");
      return;
    }

    const normalizedPhone = phone.trim();

    const phoneRegex = /^(\+98|0)?9\d{9}$/;

    if (!phoneRegex.test(normalizedPhone)) {
      setError("شماره موبایل وارد شده صحیح نیست.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!email || !emailRegex.test(email.trim())) {
      setError("لطفاً یک ایمیل معتبر وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizedPhone,
          email: email.trim().toLowerCase(),
          type: "register",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "خطایی سمت سرور رخ داده است.");
      } else {
        setSuccess("کد تأیید برای شما ارسال شد.");
        setStep(2);
      }
    } catch (error) {
      setError("خطایی رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phone: phone.trim(),
          type: "set-password",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "ارسال کد تعیین رمز ناموفق بود.");
      } else {
        setSuccess("کد تأیید تعیین رمز برای شما ارسال شد.");
      }
    } catch (error) {
      setError("خطا در ارسال کد تأیید.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp || !/^\d{6}$/.test(otp)) {
      setError("کد تأیید باید 6 رقمی باشد.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          code: otp,
          name: name.trim(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "خطایی سمت سرور رخ داده است.");
        return;
      }

      setStep(3);
      setSuccess("ثبت‌نام تأیید شد. اکنون رمز ثابت خود را تعیین کنید.");
    } catch (error) {
      setError("خطایی در تأیید ثبت‌نام رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!passwordOtp || !/^\d{6}$/.test(passwordOtp)) {
      setError("کد تأیید باید 6 رقمی باشد.");
      return;
    }

    if (!newPassword || newPassword.length < 8 || newPassword.length > 128) {
      setError("رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          code: passwordOtp,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "تعیین رمز عبور ناموفق بود.");
        return;
      }

      setSuccess("رمز ثابت شما با موفقیت فعال شد.");
      setStep(4);
    } catch (error) {
      setError("خطا در ثبت رمز عبور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen box-border overflow-hidden bg-[var(--color-background)] p-3 sm:p-4 lg:p-8">
      <div
        dir="ltr"
        className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 overflow-hidden rounded-3xl bg-[var(--color-surface)] shadow-xl lg:grid-cols-2"
      >
        {/* تصویر سمت چپ */}
        <section className="relative hidden min-h-0 overflow-hidden bg-[var(--color-hover)] lg:block">
          <img
            src="/images/login-illustration.png"
            alt="تصویر حساب کاربری"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>

        {/* مرحله اول: اطلاعات ثبت‌نام */}
        {step === 1 && (
          <section
            dir="rtl"
            className="relative flex min-h-0 items-start justify-center overflow-hidden bg-[var(--color-surface)] px-4 pt-20 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-2"
            style={{ zoom: 0.9 }}
          >
            <div className="relative w-full max-w-md">
              <div className="mx-auto mt-2 mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-background)]">
                <FaUser className="h-12 w-12 text-[var(--color-primary)]" />
              </div>

              <h1 className="text-center text-3xl font-extrabold text-[var(--color-text)]">
                ایجاد حساب کاربری
              </h1>

              <p className="mt-3 text-center text-sm leading-7 text-[var(--color-muted)]">
                برای ساخت حساب کاربری، اطلاعات خود را وارد کنید
              </p>

              <div className="mt-2">
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

                <form onSubmit={handleSendOtp} className="space-y-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      نام و نام خانوادگی
                    </label>

                    <div className="flex h-14 items-center gap-3 rounded-full border border-transparent bg-[var(--color-background)] px-5 focus-within:border-[var(--color-primary)] focus-within:bg-white">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="نام و نام خانوادگی"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-0 focus:ring-0"
                      />

                      <FaUser className="h-6 w-6 shrink-0 text-[var(--color-muted)]" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      ایمیل
                    </label>

                    <div className="flex h-14 items-center gap-3 rounded-full border border-transparent bg-[var(--color-background)] px-5 focus-within:border-[var(--color-primary)] focus-within:bg-white">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        dir="ltr"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="min-w-0 flex-1 border-0 bg-transparent text-left text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-0 focus:ring-0"
                      />

                      <FaEnvelope className="h-6 w-6 shrink-0 text-[var(--color-muted)]" />
                    </div>
                  </div>

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

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex h-12 w-full items-center justify-center rounded-full border-0 bg-[var(--color-primary)] font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                  >
                    {loading ? "در حال ارسال..." : "ایجاد حساب کاربری"}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
                  قبلاً ثبت‌نام کرده‌اید؟{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[var(--color-primary)]"
                  >
                    ورود به حساب
                  </Link>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* مرحله دوم: تأیید کد ثبت‌نام */}
        {step === 2 && (
          <section
            dir="rtl"
            className="relative flex min-h-0 items-center justify-center overflow-hidden bg-[var(--color-surface)] px-4 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-2"
            style={{ zoom: 0.9 }}
          >
            <div className="relative w-full max-w-md">
              <div className="mx-auto mt-2 mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-background)]">
                <FaShieldAlt className="h-12 w-12 text-[var(--color-primary)]" />
              </div>

              <h1 className="text-center text-3xl font-extrabold text-[var(--color-text)]">
                کد تأیید ثبت‌نام
              </h1>

              <p className="mt-3 text-center text-sm leading-7 text-[var(--color-muted)]">
                کد تأیید ارسال‌شده به شماره موبایل خود را وارد کنید.
              </p>

              <div className="mt-2">
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

                <form onSubmit={handleVerifyOtp} className="space-y-2">
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      کد تأیید
                    </label>

                    <div className="flex h-14 items-center gap-3 rounded-full border border-transparent bg-[var(--color-background)] px-5 focus-within:border-[var(--color-primary)] focus-within:bg-white">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        dir="ltr"
                        placeholder="کد تأیید ۶ رقمی"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        required
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-0 focus:ring-0"
                      />

                      <FaShieldAlt className="h-6 w-6 shrink-0 text-[var(--color-muted)]" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                  >
                    {loading ? "در حال بررسی..." : "تأیید کد"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

      
        {step === 3 && (
          <section
            dir="rtl"
            className="relative flex min-h-0 items-center justify-center origin-top scale-[0.85] overflow-hidden bg-[var(--color-surface)] px-4 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-2"
            style={{ zoom: 0.9 }}
          >
            <div className="relative w-full max-w-md">
              <div className="mx-auto mt-2 mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-background)]">
                <FaLock className="h-12 w-12 text-[var(--color-primary)]" />
              </div>

              <h1 className="text-center text-3xl font-extrabold text-[var(--color-text)]">
                ایجاد رمز ثابت
              </h1>

              <p className="mt-3 text-center text-sm leading-7 text-[var(--color-muted)]">
                برای ورودهای بعدی، یک رمز عبور ثابت انتخاب کنید.
              </p>

              <div className="mt-2">
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

                <form onSubmit={handleSetPassword} className="space-y-3">
                
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      رمز عبور جدید
                    </label>

                    <div className="flex h-14 items-center gap-3 rounded-full bg-[var(--color-background)] px-5 focus-within:border focus-within:border-[var(--color-primary)]">
                      <input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="حداقل ۸ کاراکتر"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none focus:ring-0"
                      />

                      <FaLock className="h-5 w-5 text-[var(--color-muted)]" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      تکرار رمز عبور
                    </label>

                    <div className="flex h-14 items-center gap-3 rounded-full bg-[var(--color-background)] px-5 focus-within:border focus-within:border-[var(--color-primary)]">
                      <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="رمز عبور را دوباره وارد کنید"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none focus:ring-0"
                      />

                      <FaLock className="h-5 w-5 text-[var(--color-muted)]" />
                    </div>
                  </div>

                   <div>
                    <label
                      htmlFor="passwordOtp"
                      className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      کد تأیید
                    </label>

                    <div className="flex h-14 items-center gap-3 rounded-full bg-[var(--color-background)] px-5 focus-within:border focus-within:border-[var(--color-primary)]">
                      <input
                        id="passwordOtp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        dir="ltr"
                        placeholder="کد ۶ رقمی"
                        value={passwordOtp}
                        onChange={(e) =>
                          setPasswordOtp(e.target.value.replace(/\D/g, ""))
                        }
                        required
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none focus:ring-0"
                      />

                      <FaShieldAlt className="h-5 w-5 text-[var(--color-muted)]" />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendPasswordOtp}
                      disabled={loading}
                      className="mt-2 text-sm font-semibold text-[var(--color-primary)] disabled:opacity-50"
                    >
                      ارسال کد تأیید
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                  >
                    {loading ? "در حال ثبت رمز..." : "فعال‌سازی رمز ثابت"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

       
        {step === 4 && (
          <section
            dir="rtl"
            className="relative flex min-h-0 items-center justify-center overflow-hidden bg-[var(--color-surface)] px-4 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-2"
          >
            <div className="w-full max-w-md text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-background)]">
                <FaShieldAlt className="h-12 w-12 text-green-600" />
              </div>

              <h1 className="text-2xl font-extrabold text-[var(--color-text)]">
                ثبت‌نام کامل شد
              </h1>

              <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                حساب کاربری و رمز ثابت شما با موفقیت فعال شدند. اکنون می‌توانید
                با شماره موبایل و رمز عبور وارد شوید.
              </p>

              <Link
                href="/auth/login"
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-white hover:bg-pink-600"
              >
                ورود به حساب کاربری
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Register;
