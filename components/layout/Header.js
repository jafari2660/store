"use client";

import React, { useEffect, useState } from "react";
import { getCategories } from "@/app/home/lib/getCategories";
import Link from "next/link";
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaBookOpen,
} from "react-icons/fa";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();

        console.log("دسته‌بندی‌های دریافتی:", data);

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("خطا در دریافت دسته‌بندی‌ها:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const navLinks = [
    { title: "صفحه اصلی", href: "/" },
    { title: "فروشگاه", href: "/shop" },
    { title: "پرفروش‌ها", href: "/bestsellers" },
    { title: "تماس با ما", href: "/contact" },
  ];

  return (
    <header dir="rtl" className="w-full px-4 md:px-8 py-5">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* منوی دسکتاپ */}
        <nav className="hidden lg:flex items-center gap-2 rounded-full bg-[var(--color-surface)] px-5 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.05)]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full no-underline px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-all duration-200 hover:text-[var(--color-primary)]"
            >
              {link.title}
            </Link>
          ))}

          {/* منوی بازشونده دسته‌بندی‌ها */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              aria-expanded={categoryMenuOpen}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:text-[var(--color-primary)]"
            >
              دسته‌بندی‌ها
              <FaChevronDown
                className={`mr-2 inline-block text-xs transition-transform duration-300 ${
                  categoryMenuOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {categoryMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 min-w-48 rounded-2xl bg-[var(--color-surface)] p-2 shadow-xl">
                {loading ? (
                  <p className="px-4 py-3 text-sm">در حال بارگذاری...</p>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category._id}
                      href="#"
                      onClick={() => setCategoryMenuOpen(false)}
                      className="block no-underline rounded-xl px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm">دسته‌بندی‌ای وجود ندارد</p>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* کپسول لوگو و آیکون‌ها */}
        <div className="flex items-center gap-4 rounded-full bg-[var(--color-surface)] px-5 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.05)]">
          {/* لوگو */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-extrabold no-underline text-[var(--color-primary)]"
          >
            <FaBookOpen className="text-2xl" />
            <span>کتاب یار</span>
          </Link>

          <span className="h-7 w-px bg-[var(--color-border)]" />

          {/* جست‌وجو */}
          <Link
            href="/search"
            aria-label="جست‌وجو"
            className="text-[var(--color-text)] transition hover:text-[var(--color-primary)]"
          >
            <FaSearch className="text-lg" />
          </Link>

          {/* حساب کاربری */}
          <Link
            href="/account"
            aria-label="حساب کاربری"
            className="text-[var(--color-text)] transition hover:text-[var(--color-primary)]"
          >
            <FaUser className="text-lg" />
          </Link>

          {/* سبد خرید */}
          <Link
            href="/cart"
            aria-label="سبد خرید"
            className="text-[var(--color-text)] transition hover:text-[var(--color-primary)]"
          >
            <FaShoppingCart className="text-lg" />
          </Link>
        </div>

        {/* دکمه منوی موبایل */}
        <button
          type="button"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setCategoryMenuOpen(false);
          }}
          aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
          aria-expanded={menuOpen}
          className="lg:hidden flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] shadow-[0_4px_25px_rgba(0,0,0,0.05)]"
        >
          {menuOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <FaBars className="text-xl" />
          )}
        </button>
      </div>

      {/* منوی موبایل */}
      {menuOpen && (
        <nav className="lg:hidden mx-auto mt-4 max-w-7xl rounded-3xl bg-[var(--color-surface)] p-4 shadow-[0_4px_25px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="no-underline rounded-xl  px-4 py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
              >
                {link.title}
              </Link>
            ))}

            {/* عنوان دسته‌بندی‌ها در موبایل */}
            <button
              type="button"
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              aria-expanded={categoryMenuOpen}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-right text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-hover)]"
            >
              دسته‌بندی‌ها
              <FaChevronDown
                className={`text-xs transition-transform duration-300 ${
                  categoryMenuOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* فهرست بازشونده دسته‌بندی‌ها */}
            {categoryMenuOpen && (
              <div className="mr-4 flex flex-col gap-1 border-r-2 border-[var(--color-border)] pr-3">
                {loading ? (
                  <span className="px-4 py-2 text-sm">در حال بارگذاری...</span>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category._id}
                      href="#"
                      onClick={() => {
                        setCategoryMenuOpen(false);
                        setMenuOpen(false);
                      }}
                      className="rounded-xl px-4 py-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <span className="px-4 py-2 text-sm">
                    دسته‌بندی‌ای وجود ندارد
                  </span>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
