import React from 'react';
import Link from 'next/link';
const Header = () => {
  return (

<nav className="w-full min-w-0 bg-[var(--color-background)] px-3 py-3 pr-72 
text-[var(--color-text)] sm:px-4 sm:py-4 sm:pr-72 md:pr-4">
  <Link
    href="/"
    className="break-words text-xl font-bold text-[var(--color-text)] sm:text-2xl"
  >
    پنل ادمین
  </Link>
</nav>
  );
};

export default Header;