"use client";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
const AddCategory = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const validateForm = () => {
    if (name.trim() === "") {
      setFormError("نام دسته بندی الزامی میباشد");
      return false;
    } else if (name.length < 3 || name.length > 30) {
      setFormError("نام دسته بندی باید بین ۳ تا ۳۰ باشد");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.status === 400) {
        let message = await response.json();
        setFormError(message.message);
      }
      if (!response.ok) throw new Error("مشکلی در ساخت دسته بندی پیش آمده است");
      router.push("/admin/categories");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip">
      <div className="flex min-h-screen w-full min-w-0">
        <div className="hidden shrink-0 md:block md:w-64">
          <Sidebar />
        </div>
        <div className="min-w-0 flex-1">
          <Header />
          <main
            className="min-h-[80vh] min-w-0 p-2 sm:p-3 md:p-4"
            onClick={(e) => {
              if (e.target.closest("button, input, label, a")) return;
              document.getElementById("category-name")?.focus();
            }}
          >
            <div className="mx-auto w-full max-w-3xl rounded-xl border border-[var(--color-border)] p-3 shadow-sm sm:p-5 md:p-6">
              <h2 className="my-4">افزودن دسته بندی جدید</h2>
              {error && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {formError && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    نام دسته بندی
                  </label>

                  <input
                    id="category-name"
                    type="text"
                    placeholder="نام دسته بندی ..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition hover:opacity-80"
                >
                  ذخیره
                </button>
              </form>
            </div>
          </main>
        </div>
        <div className="md:hidden">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
