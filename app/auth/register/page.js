"use client";

import React, { useState } from "react";
import { FaUser, FaPhone } from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
            alt="تصویر حساب کاربری"
            className="absolute inset-0 h-full w-full object-cover "
          />
        </section>

        <section
          dir="rtl"
          className="relative flex min-h-0 items-center justify-center overflow-hidden bg-[var(--color-surface)] px-4 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-2"
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

            <div className="mt-4">
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

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    نام و نام خانوادگی
                  </label>

                  <div className="flex h-14 items-center gap-3 rounded-full border border-transparent bg-[var(--color-background)] px-5 focus-within:border-[var(--color-primary)] focus-within:bg-white ">
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
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    شماره تلفن
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
                      placeholder="شماره تلفن"
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
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-full border-0 bg-[var(--color-primary)] font-semibold text-white  hover:bg-pink-600 disabled:opacity-60"
                >
                  {loading ? "در حال ارسال..." : "ایجاد حساب کاربری"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
