"use client";

import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const AddTag = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    const trimmedName = name.trim();

    if (trimmedName === "") {
      setFormError("نام برچسب الزامی می‌باشد");
      return false;
    }

    if (trimmedName.length < 3 || trimmedName.length > 30) {
      setFormError("نام برچسب باید بین ۳ تا ۳۰ کاراکتر باشد");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormError(data.message || "مشکلی در ثبت برچسب پیش آمده است");
        return;
      }

      router.push("/admin/tags");
    } catch (error) {
      setError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
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
              if (e.target.closest("button, input, label, a")) {
                return;
              }

              document.getElementById("tag-name")?.focus();
            }}
          >
            <div className="mx-auto w-full max-w-3xl min-w-0 rounded-xl border border-[var(--color-border)] p-3 shadow-sm sm:p-5 md:p-6">
              <h2 className="my-4">افزودن برچسب جدید</h2>

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
                  <label
                    htmlFor="tag-name"
className="mb-2 block text-sm font-medium text-[var(--color-text)]"                  >
                    نام برچسب
                  </label>

                  <input
                    id="tag-name"
                    type="text"
                    placeholder="نام برچسب ..."
                    value={name}
                    maxLength={30}
                    disabled={saving}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFormError("");
                    }}
                    className="w-full min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "در حال ذخیره..." : "ذخیره"}
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

export default AddTag;
