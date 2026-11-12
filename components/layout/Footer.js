
"use client";

import Link from "next/link";

import {
  FaBookOpen,
  FaHeadset,
  FaFileAlt,
  FaBox,
  FaInstagram,
  FaTelegramPlane,
} from "react-icons/fa";

const features = [
  {
    image: "/images/footer/1.png",
    title: "امکان تحویل اکسپرس",
  },
  {
    image: "/images/footer/2.png",
    title: "پرداخت در محل",
  },
  {
    image: "/images/footer/3.png",
    title: "پشتیبانی ۲۴ ساعته",
  },
  {
    image: "/images/footer/4.png",
    title: "۷ روز ضمانت بازگشت",
  },
  {
    image: "/images/footer/5.png",
    title: "ضمانت اصالت کالا",
  },
];

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

const usefulLinks = [
  { title: "درباره ما", href: "/about" },
  { title: "تماس با ما", href: "/contact" },
  { title: "سوالات متداول", href: "/faq" },
  { title: "حریم خصوصی", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer
      id="about"
      dir="rtl"
      className="w-full bg-[var(--color-surface)] px-4 pb-5 pt-10 md:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Features */}
        <div className="grid grid-cols-2 gap-6 border-b border-[var(--color-border)] pb-10 sm:grid-cols-3 lg:grid-cols-5">

          {features.map((item, index) => (
            <div
              key={item.title}
              className={`flex flex-col items-center gap-3 text-center ${
                index !== 4
                  ? "lg:border-l lg:border-[var(--color-border)]"
                  : ""
              }`}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-hover)] p-3 transition duration-300 hover:-translate-y-1">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-contain"
                />
              </div>

              <span className="text-xs font-bold text-[var(--color-text)] sm:text-sm">
                {item.title}
              </span>
            </div>
          ))}

        </div>

        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 border-b border-[var(--color-border)] py-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-3 text-2xl font-extrabold text-[var(--color-primary)] no-underline"
            >
              <FaBookOpen className="text-4xl" />
              کتاب یار
            </Link>

            <p className="max-w-xs text-sm leading-8 text-[var(--color-muted)]">
              فروشگاه کتاب‌یار همراه شما در مسیر یادگیری و
              کتاب‌خوانی است. ما تلاش می‌کنیم بهترین خدمات
              را به شما ارائه دهیم.
            </p>

            <div className="mt-6 flex items-center gap-3">

              <a
                href="#"
                aria-label="اینستاگرام"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-hover)] text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="تلگرام"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-hover)] text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
              >
                <FaTelegramPlane />
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:border-r lg:border-[var(--color-border)] lg:pr-10">

            <h3 className="mb-7 text-lg font-extrabold text-[var(--color-text)]">
              دسترسی سریع
            </h3>

            <div className="flex flex-col gap-5">

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
          <div className="lg:border-r lg:border-[var(--color-border)] lg:pr-10">

            <h3 className="mb-7 text-lg font-extrabold text-[var(--color-text)]">
              خدمات مشتریان
            </h3>

            <div className="flex flex-col gap-5">

              {serviceLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex w-fit items-center gap-3 text-sm text-[var(--color-muted)] no-underline transition hover:text-[var(--color-primary)]"
                  >
                    <Icon className="text-[var(--color-primary-light)]" />
                    {link.title}
                  </Link>
                );
              })}

            </div>
          </div>

          {/* Useful Links */}
          <div className="lg:border-r lg:border-[var(--color-border)] lg:pr-10">

            <h3 className="mb-7 text-lg font-extrabold text-[var(--color-text)]">
              لینک‌های مفید
            </h3>

            <div className="flex flex-col gap-5">

              {usefulLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-sm text-[var(--color-muted)] no-underline transition hover:text-[var(--color-primary)]"
                >
                  {link.title}
                </Link>
              ))}

            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-center sm:flex-row">

          <p className="text-xs leading-7 text-[var(--color-muted)]">
            تمامی حقوق محفوظ است · فروشگاه کتاب‌یار © ۱۴۰۵
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
