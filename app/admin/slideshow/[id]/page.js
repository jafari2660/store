"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AuthWrapper from "@/components/auth/Auth";

export default function EditSlidePage() {
  const params = useParams();
  const router = useRouter();

  const slideId = params.id;

  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [preview, setPreview] = useState("");

  const [link, setLink] = useState("");
  const [position, setPosition] = useState("main");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchSlide = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/slideshow/${slideId}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "خطا در دریافت اسلاید");
        }

        setCurrentImage(data.image);
        setLink(data.link);
        setPosition(data.position);
        setOrder(data.order);
        setIsActive(data.isActive);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "خطا در دریافت اطلاعات اسلاید");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slideId) {
      fetchSlide();
    }

    return () => controller.abort();
  }, [slideId]);

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

    if (!link.trim()) {
      setError("لینک مقصد را وارد کنید");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }

      formData.append("link", link.trim());
      formData.append("position", position);
      formData.append("order", String(order));
      formData.append("isActive", String(isActive));

      const response = await fetch(`/api/slideshow/${slideId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ویرایش اسلاید ناموفق بود");
      }

      router.push("/admin/slideshow");
      router.refresh();
    } catch (err) {
      setError(err.message || "خطا در ویرایش اسلاید");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen w-full min-w-0 overflow-x-clip">
          <div className="flex min-h-screen w-full min-w-0">
            <div className="hidden shrink-0 md:block md:w-64">
              <Sidebar />
            </div>

            <div className="min-w-0 flex-1">
              <Header />
              <div className="p-6">
                <LoadingSpinner />
              </div>
            </div>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen w-full min-w-0 overflow-x-clip">
        <div className="flex min-h-screen w-full min-w-0">

          <div className="hidden shrink-0 md:block md:w-64">
            <Sidebar />
          </div>

          <div className="min-w-0 flex-1">
            <Header />

            <main className="p-4 md:p-6">
              <h1 className="text-xl font-bold mb-6">
                ویرایش اسلاید
              </h1>

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
                  <label className="block mb-2 font-medium">
                    تصویر فعلی اسلاید
                  </label>

                  {currentImage && (
                    <div className="relative w-full max-w-md h-48">
                      <Image
                        src={currentImage}
                        alt="تصویر فعلی اسلاید"
                        fill
                        unoptimized
                        className="object-contain rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    انتخاب تصویر جدید (اختیاری)
                  </label>

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
                        alt="پیش‌نمایش تصویر جدید"
                        fill
                        unoptimized
                        className="object-contain rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    لینک مقصد
                  </label>

                  <input
                    type="text"
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    placeholder="/products"
                    className="w-full border rounded p-3"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    جایگاه نمایش
                  </label>

                  <select
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    className="w-full border rounded p-3"
                  >
                    <option value="main">اسلاید اصلی</option>
                    <option value="sideTop">بنر کناری بالا</option>
                    <option value="sideBottom">بنر کناری پایین</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    ترتیب نمایش
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={order}
                    onChange={(event) =>
                      setOrder(Number(event.target.value))
                    }
                    className="w-full border rounded p-3"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) =>
                      setIsActive(event.target.checked)
                    }
                  />

                  <label htmlFor="isActive">
                    اسلاید فعال باشد
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-custom-edit"
                  >
                    {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
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
      </div>
    </AuthWrapper>
  );
}
