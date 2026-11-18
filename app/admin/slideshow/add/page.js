"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AuthWrapper from "@/components/auth/Auth";

export default function AddSlidePage() {
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [link, setLink] = useState("");
  const [position, setPosition] = useState("main");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("لطفاً یک فایل تصویری انتخاب کنید");
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!image) {
      setError("انتخاب تصویر الزامی است");
      return;
    }

    if (!link.trim()) {
      setError("لینک مقصد را وارد کنید");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("image", image);
      formData.append("link", link.trim());
      formData.append("position", position);
      formData.append("order", String(order));
      formData.append("isActive", String(isActive));

      const response = await fetch("/api/slideshow", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "افزودن اسلاید ناموفق بود");
      }

      router.push("/admin/slideshow");
      router.refresh();
    } catch (err) {
      setError(err.message || "خطا در افزودن اسلاید");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="flex min-h-screen bg-gray-100">
        <div className="hidden md:block w-64 shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0">
          <Header />

          <main className="p-4 md:p-6">
            <h1 className="text-xl font-bold mb-6">افزودن اسلاید جدید</h1>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow p-5 max-w-3xl space-y-5"
            >
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block mb-2 font-medium">تصویر اسلاید</label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="w-full border rounded p-2"
                />

                {preview && (
                  <div className="relative mt-4 w-full max-w-md h-48">
                    <Image
                      src={preview}
                      alt="پیش‌نمایش اسلاید"
                      fill
                      unoptimized
                      className="object-contain rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium">لینک مقصد</label>

                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/products"
                  className="w-full border rounded p-3"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">جایگاه نمایش</label>

                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full border rounded p-3"
                >
                  <option value="main">اسلاید اصلی</option>
                  <option value="sideTop">بنر کناری بالا</option>
                  <option value="sideBottom">بنر کناری پایین</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">ترتیب نمایش</label>

                <input
                  type="number"
                  min="0"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full border rounded p-3"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />

                <label htmlFor="isActive">اسلاید فعال باشد</label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-custom-add"
                >
                  {loading ? "در حال ذخیره..." : "ذخیره اسلاید"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/slideshow")}
                  className="px-5 py-2 rounded border"
                >
                  انصراف
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}
