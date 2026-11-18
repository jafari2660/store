import React from "react";
import Link from "next/link";
import { FaBookOpen , FaUserShield } from "react-icons/fa";

const Header = () => {
  return (
    <nav
      dir="rtl"
      className="w-full min-w-0 bg-[var(--color-background)] px-3 py-3 pr-72 text-[var(--color-text)] sm:px-4 sm:py-4 sm:pr-72 md:pr-4"
    >
      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex items-center rounded-full bg-[var(--color-surface)] px-5 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.05)]">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xl font-extrabold no-underline text-[var(--color-primary)] transition hover:opacity-80"
          >
            <FaUserShield  className="text-2xl" />
            <span>پنل ادمین</span>
          </Link>
        </div>

        <div className="flex items-center rounded-full bg-[var(--color-surface)] px-5 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.05)]">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-extrabold no-underline text-[var(--color-primary)]"
          >
            <FaBookOpen className="text-2xl" />
            <span>کتاب یار</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
