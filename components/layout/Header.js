
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
  FaBookOpen,
} from "react-icons/fa";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { title: "صفحه اصلی", href: "/" },
    { title: "فروشگاه", href: "/shop" },
    { title: "دسته‌بندی کتاب‌ها", href: "/categories" },
    { title: "پرفروش‌ها", href: "/bestsellers" },
    { title: "تماس با ما", href: "/contact" },
  ];

  return (
    <header
      dir="rtl"
      className="w-full px-4 md:px-8 py-5"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">

        {/* کپسول منو */}
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

          {/* آیکون جست‌وجو */}
          <Link
            href="/search"
            aria-label="جست‌وجو"
            className="text-[var(--color-text)] transition hover:text-[var(--color-primary)]"
          >
            <FaSearch className="text-lg" />
          </Link>

          {/* آیکون حساب کاربری */}
          <Link
            href="/account"
            aria-label="حساب کاربری"
            className="text-[var(--color-text)] transition hover:text-[var(--color-primary)]"
          >
            <FaUser className="text-lg" />
          </Link>

          {/* آیکون سبد خرید */}
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
          onClick={() => setMenuOpen(!menuOpen)}
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
                className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
