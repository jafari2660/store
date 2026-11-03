"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { FaUser, FaPhone } from "react-icons/fa";
import NoAuthWrapper from "@/components/auth/NoAuthWrapper";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [loginMode, setLoginMode] = useState("password");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

 
  const validateIdentifier = (value) => {
    const raw = value.trim();

    if (raw.includes("@")) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw);
    }

    const normalized = raw.startsWith("+98")
      ? `0${raw.slice(3)}`
      : raw.startsWith("9")
        ? `0${raw}`
        : raw;

    return /^09\d{9}$/.test(normalized);
  };

  const redirectAfterLogin = async () => {
    const session = await getSession();

    if (session?.user?.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/");
    }

    router.refresh();
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateIdentifier(identifier)) {
      setError("ایمیل یا شماره موبایل وارد شده صحیح نیست.");
      return;
    }

    if (!loginPassword) {
      setError("رمز عبور را وارد کنید.");
      return;
    }

    try {
      setLoading(true);

      const result = await signIn("credentials", {
        identifier: identifier.trim(),
        password: loginPassword,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setError("ایمیل یا شماره موبایل یا رمز عبور اشتباه است.");
        return;
      }

      await redirectAfterLogin();
    } catch {
      setError("خطایی هنگام ورود رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();

    setError("");
    setSuccess("");

    if (!validateIdentifier(identifier)) {
      setError("ایمیل یا شماره موبایل وارد شده صحیح نیست.");
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
          identifier: identifier.trim(),
          type: "login",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "ارسال کد تأیید ناموفق بود.");
        return;
      }

      setOtpSent(true);
      setOtpCode("");
      setSuccess(data.message || "کد تأیید برای شما ارسال شد.");
    } catch {
      setError("خطایی هنگام ارسال کد تأیید رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError("کد تأیید باید شش رقم باشد.");
      return;
    }

    try {
      setLoading(true);

      const result = await signIn("otp-login", {
        identifier: identifier.trim(),
        code: otpCode.trim(),
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setError("کد تأیید اشتباه است یا اعتبار آن تمام شده است.");
        return;
      }

      await redirectAfterLogin();
    } catch {
      setError("خطایی هنگام ورود رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  const changeLoginMode = (mode) => {
    setLoginMode(mode);
    setLoginPassword("");
    setOtpCode("");
    setOtpSent(false);
    setError("");
    setSuccess("");
  };

  const changeIdentifier = () => {
    setOtpSent(false);
    setOtpCode("");
    setError("");
    setSuccess("");
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
                روش ورود به حساب کاربری خود را انتخاب کنید.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => changeLoginMode("password")}
                  className={`h-11 rounded-full text-sm font-semibold ${
                    loginMode === "password"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-background)] text-[var(--color-text)]"
                  }`}
                >
                  ورود با رمز عبور
                </button>

                <button
                  type="button"
                  onClick={() => changeLoginMode("otp")}
                  className={`h-11 rounded-full text-sm font-semibold ${
                    loginMode === "otp"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-background)] text-[var(--color-text)]"
                  }`}
                >
                  ورود با کد یک‌بارمصرف
                </button>
              </div>

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

                <form
                  onSubmit={
                    loginMode === "password"
                      ? handlePasswordLogin
                      : otpSent
                        ? handleOtpLogin
                        : handleSendOtp
                  }
                  className="space-y-3"
                >
                  <div>
                    <label
                      htmlFor="identifier"
                      className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      ایمیل یا شماره موبایل
                    </label>

                    <div className="flex h-14 items-center gap-4 rounded-full border border-transparent bg-[var(--color-background)] px-5 focus-within:border-[var(--color-primary)] focus-within:bg-white">
                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        dir="ltr"
                        placeholder="ایمیل یا شماره موبایل"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);

                          if (otpSent) {
                            changeIdentifier();
                          }
                        }}
                        disabled={loading || otpSent}
                        autoComplete="username"
                        required
                        className="min-w-0 flex-1 border-0 bg-transparent text-left text-sm text-[var(--color-text)] outline-none placeholder:text-right placeholder:text-[var(--color-muted)] focus:border-0 focus:ring-0"
                      />

                      <FaPhone className="h-6 w-6 shrink-0 text-[var(--color-muted)]" />
                    </div>
                  </div>

                  {loginMode === "password" && (
                    <>
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
                          onChange={(e) =>
                            setLoginPassword(e.target.value)
                          }
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
                    </>
                  )}

                  {loginMode === "otp" && otpSent && (
                    <div>
                      <label
                        htmlFor="otpCode"
                        className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                      >
                        کد تأیید ۶ رقمی
                      </label>

                      <input
                        id="otpCode"
                        name="otpCode"
                        type="text"
                        inputMode="numeric"
                        dir="ltr"
                        maxLength={6}
                        autoComplete="one-time-code"
                        value={otpCode}
                        onChange={(e) =>
                          setOtpCode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="کد ارسال‌شده را وارد کنید"
                        required
                        className="h-14 w-full rounded-full bg-[var(--color-background)] px-5 text-center text-lg tracking-widest outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />

                      <button
                        type="button"
                        onClick={changeIdentifier}
                        className="mt-3 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        تغییر ایمیل یا شماره موبایل
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex h-12 w-full items-center justify-center rounded-full border-0 bg-[var(--color-primary)] font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                  >
                    {loading
                      ? "لطفاً صبر کنید..."
                      : loginMode === "password"
                        ? "ورود به سیستم"
                        : otpSent
                          ? "تأیید کد و ورود"
                          : "ارسال کد تأیید"}
                  </button>

                 
                  {loginMode === "otp" && otpSent && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendOtp}
                      className="w-full py-2 text-sm font-semibold text-[var(--color-primary)] hover:underline disabled:opacity-50"
                    >
                      ارسال مجدد کد
                    </button>
                  )}
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