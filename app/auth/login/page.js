"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import GeneralError from "@/components/ui/GeneralError";
import { signIn } from "next-auth/react";
import { FaUser, FaPhone, FaShieldAlt } from "react-icons/fa";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      setError("شماره موبایل وارد شده صحیح نیست.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, type: "login" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "خطایی سمت سرور رخ داده است.");
      } else {
        setSuccess("کد تایید برای شما ارسال شد.");
        setStep(2);
      }
    } catch (error) {
      setError("خطایی رخ داده است.");
    } finally {
      setLoading(false);
    }
  };
 


const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!/^\d{6}$/.test(otp)) {
    setError("کد تأیید باید شامل ۶ رقم باشد.");
    return;
  }

  setLoading(true);

  try {
   
    const verifyResponse = await fetch("/api/auth/verify-otp-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, code: otp }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      setError(verifyData.message || "تأیید کد ناموفق بود.");
      return;
    }

    
    const result = await signIn("credentials", {
      phone,
      code: otp,
      redirect: false,
    });

    if (result?.error || !result?.ok) {
      setError("ورود انجام نشد؛ لطفاً دوباره کد تأیید را بررسی کنید.");
      return;
    }

    router.push("/dashboard");
  } catch (error) {
    setError("خطایی هنگام ورود رخ داده است.");
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
        <section className="relative hidden min-h-0 overflow-hidden bg-[var(--color-hover)] lg:block">
          <img
            src="/images/login-illustration.png"
            alt="تصویر ورود به سیستم"
            className="absolute inset-0 h-full w-full object-cover "
          />
        </section>
        {step === 1 && (
          <section
            dir="rtl"
            className="relative flex min-h-0 items-start justify-center overflow-hidden pt-20 bg-[var(--color-surface)] px-4 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-2"
            style={{ zoom: 0.9 }}
          >
            <div className="relative w-full max-w-md">
              <div className="mx-auto mt-2 mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-background)]">
                <FaUser className="h-12 w-12 text-[var(--color-primary)]" />
              </div>

              <h1 className="text-center text-3xl font-extrabold text-[var(--color-text)]">
                ورود به سیستم
              </h1>

              <p className="mt-3 text-center text-sm leading-7 text-[var(--color-muted)]">
                برای ورود به سیستم، شماره موبایل خود را وارد کنید
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
                      htmlFor="phone"
                      className="mb-1 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      شماره موبایل
                    </label>

                    <div
                      className="flex h-14 items-center gap-4 rounded-full border border-transparent bg-[var(--color-background)] px-5 
                  focus-within:border-[var(--color-primary)] focus-within:bg-white "
                    >
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
                    className="mt-4 flex h-12 w-full items-center justify-center rounded-full border-0 bg-[var(--color-primary)] font-semibold text-white  hover:bg-pink-600 disabled:opacity-60"
                  >
                    {loading ? "در حال ارسال..." : "ورود به سیستم"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
        {step === 2 && (
          <section
            dir="rtl"
            className="relative flex min-h-0 items-center justify-center overflow-hidden bg-[var(--color-surface)] px-4 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-2"
            style={{ zoom: 0.9 }}
          >
            <div className="relative w-full max-w-md ">
              <div className="mx-auto mt-2 mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-background)]">
                <FaShieldAlt className="h-12 w-12 text-[var(--color-primary)]" />
              </div>

              <h1 className="text-center text-3xl font-extrabold text-[var(--color-text)]">
                کد تایید
              </h1>

              <p className="mt-3 text-center text-sm leading-7 text-[var(--color-muted)]">
                کد تایید را وارد کنید
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

                <form onSubmit={handleLogin} className="space-y-2">
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                    >
                      کد تایید
                    </label>

                    <div className="flex h-14 items-center gap-3 rounded-full border border-transparent bg-[var(--color-background)] px-5 focus-within:border-[var(--color-primary)] focus-within:bg-white ">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="کد تأیید ۶ رقمی"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
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
      </div>
    </main>
  );
};

export default Login;
