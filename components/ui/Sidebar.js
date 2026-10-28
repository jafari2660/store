"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaBox,
  FaHome,
  FaTags,
  FaLayerGroup,
  FaPercent,
  FaUser,
  FaComments,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
     
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
        aria-expanded={isOpen}
        className="fixed right-4 top-4 z-[60] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 
                   text-xl text-[var(--color-primary)] shadow-md
                   transition-colors hover:bg-[var(--color-hover)] md:hidden"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

     
      {isOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          aria-label="بستن منو"
          className="fixed inset-0 z-40 bg-[var(--color-text)]/40 md:hidden"
        />
      )}

      
      <aside
        className={`sidebar fixed right-0 top-0 z-50 flex h-screen w-64 flex-col transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0`}
      >
        <nav className="flex flex-col gap-2">
          <Link
            onClick={closeSidebar}
            className="flex items-center gap-2"
            href="/admin"
          >
            <FaHome />
            داشبورد
          </Link>

          <Link
            onClick={closeSidebar}
            className="flex items-center gap-2"
            href="/admin/categories"
          >
            <FaLayerGroup />
            دسته بندی ها
          </Link>

          <Link
            onClick={closeSidebar}
            className="flex items-center gap-2"
            href="/admin/tags"
          >
            <FaTags />
            مدیریت برچسب ها
          </Link>

          <Link
            onClick={closeSidebar}
            className="flex items-center gap-2"
            href="/admin/products"
          >
            <FaBox />
            مدیریت محصولات
          </Link>

          <Link
            onClick={closeSidebar}
            className="flex items-center gap-2"
            href="/admin/discountCodes"
          >
            <FaPercent />
            مدیریت کدهای تخفیف
          </Link>

          <Link
            onClick={closeSidebar}
            className="flex items-center gap-2"
            href="/admin/users"
          >
            <FaUser />
            مدیریت کاربران
          </Link>

          <Link
            onClick={closeSidebar}
            className="flex items-center gap-2"
            href="/admin/comments"
          >
            <FaComments />
            مدیریت نظرات
          </Link>
        </nav>

        <div className="mt-auto flex justify-center pb-4">
          <img
            className="h-20 w-20 object-contain"
            src="/images/lego.png"
            alt="لوگو"
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
