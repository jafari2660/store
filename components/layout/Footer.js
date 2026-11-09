
"use client";

import Link from "next/link";

import {
  FaBookOpen,
  FaHeadset,
  FaFileAlt,
  FaBox,
  FaEnvelope,
  FaInstagram,
  FaTelegramPlane,
  FaArrowLeft,
} from "react-icons/fa";

export default function Footer() {
  const quickLinks = [
    { title: "صفحه اصلی", href: "/" },
    { title: "فروشگاه", href: "/shop" },
    { title: "دسته‌بندی کتاب‌ها", href: "/categories" },
    { title: "پرفروش‌ها", href: "/bestsellers" },
  ];

  const serviceLinks = [
    { title: "پشتیبانی و راهنما", href: "/support", icon: FaHeadset },
    { title: "شرایط و قوانین", href: "/terms", icon: FaFileAlt },
    { title: "پیگیری سفارش", href: "/orders", icon: FaBox },
  ];

  return (
    <footer
      id="about"
      dir="rtl"
      className="w-full px-4 pb-5 pt-8 md:px-8"
    >
<div className="mx-auto max-w-7xl rounded-[30px] bg-[var(--color-surface)] p-14 shadow-[0_4px_25px_rgba(0,0,0,0.05)] md:p-16">        
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 text-2xl font-extrabold text-[var(--color-primary)] no-underline"
            >
              <FaBookOpen className="text-3xl" />
              کتاب یار
            </Link>

            <p className="max-w-xs text-sm leading-8 text-[var(--color-muted)]">
              همیشه در کنار کتاب‌های خوب؛ همراه لحظه‌های یادگیری
              و خیال‌پردازی شما.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="اینستاگرام"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-hover)] text-[var(--color-primary)] no-underline transition hover:bg-[var(--color-primary)] hover:text-white"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="تلگرام"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-hover)] text-[var(--color-primary)] no-underline transition hover:bg-[var(--color-primary)] hover:text-white"
              >
                <FaTelegramPlane />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-base font-extrabold text-[var(--color-text)]">
              دسترسی سریع
            </h3>

            <div className="flex flex-col gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-sm text-[var(--color-muted)] no-underline transition hover:translate-x-[-3px] hover:text-[var(--color-primary)]"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Services */}
          <div>
            <h3 className="mb-6 text-base font-extrabold text-[var(--color-text)]">
              خدمات مشتریان
            </h3>

            <div className="flex flex-col gap-4">
              {serviceLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex w-fit items-center gap-2 text-sm text-[var(--color-muted)] no-underline transition hover:text-[var(--color-primary)]"
                  >
                    <Icon className="text-[var(--color-primary-light)]" />
                    {link.title}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-base font-extrabold text-[var(--color-text)]">
              ارتباط با ما
            </h3>

            <p className="mb-5 text-sm leading-8 text-[var(--color-muted)]">
              سوالی دارید؟ برای دریافت راهنمایی و پشتیبانی با ما در ارتباط باشید.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-[var(--color-hover)] px-5 py-3 text-sm font-bold text-[var(--color-primary)] no-underline transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              <FaEnvelope />
              تماس با ما
              <FaArrowLeft />
            </Link>
          </div>

        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-[var(--color-border)]" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
          <p className="text-xs leading-7 text-[var(--color-muted)]">
            تمامی حقوق محفوظ است · فروشگاه کتاب یار © ۱۴۰۵
          </p>

          <p className="text-xs text-[var(--color-muted)]">
            ساخته شده با
            <span className="mx-1 text-[var(--color-primary)]">♥</span>
            عشق به کتاب
          </p>
        </div>

      </div>
    </footer>
  );
}
