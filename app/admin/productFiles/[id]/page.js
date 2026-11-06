
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AuthWrapper from "@/components/auth/Auth";

export default function ProductFiles() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

 async function getData() {
  try {
    const productRes = await fetch(`/api/products/${id}`);
    const filesRes = await fetch(`/api/productFiles/${id}`);

    const productData = await productRes.json();
    const filesData = await filesRes.json();

    if (!productRes.ok) {
      throw new Error(productData.message || "خطا در دریافت محصول");
    }

    if (!filesRes.ok) {
      throw new Error(filesData.message || "خطا در دریافت فایل‌ها");
    }

    setProduct(productData);
    setFiles(filesData);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  getData();
}, [id]);

  async function handleUpload(e) {
    e.preventDefault();

    if (!selectedFile) {
      setError("لطفاً یک فایل انتخاب کنید.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", selectedFile.name);

      const response = await fetch(`/api/productFiles/${id}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در ذخیره فایل");
      }

      setSelectedFile(null);
      e.target.reset();
      await getData();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(fileId) {
    if (!confirm("آیا از حذف این فایل مطمئن هستید؟")) return;

    try {
      const response = await fetch(
       `/api/productFiles/${id}/${fileId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در حذف فایل");
      }

      setFiles(files.filter((file) => file._id !== fileId));
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <AuthWrapper>
      <div className="min-h-screen w-full min-w-0 overflow-x-clip">
        <div className="flex min-h-screen w-full min-w-0 gap-4">

          <div className="hidden shrink-0 md:block md:w-64">
            <Sidebar />
          </div>

          <div className="min-w-0 flex-1">
            <Header />

            <main className="content min-h-screen min-w-0 p-3 sm:p-4">

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">

                <div className="border-b border-[var(--color-border)] p-4">
                  <h2 className="font-bold text-[var(--color-text)]">
                    مدیریت فایل‌های محصول
                  </h2>

                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    محصول: {product?.name}
                  </p>

                  <Link
                    href="/admin/productFiles"
                    className="mt-3 inline-block text-sm text-[var(--color-primary)]"
                  >
                    بازگشت به محصولات
                  </Link>
                </div>

                <div className="border-b border-[var(--color-border)] p-4">

                  {error && (
                    <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <form onSubmit={handleUpload}>
                    <label className="mb-2 block text-sm font-medium">
                      انتخاب فایل جدید
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.zip,.rar,.mp3,.wav,.m4a"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="input-field"
                    />

                    <button
                      type="submit"
                      disabled={saving || !selectedFile}
                      className="btn-custom-add mt-3 disabled:opacity-50"
                    >
                      {saving ? "در حال ذخیره..." : "ذخیره فایل"}
                    </button>
                  </form>
                </div>

                <div className="p-4">
                  <h3 className="mb-4 font-bold">
                    فایل‌های محصول
                  </h3>

                  {files.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)]">
                      هنوز فایلی برای این محصول ثبت نشده است.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {files.map((file) => (
                        <div
                          key={file._id}
                          className="flex flex-col justify-between gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0">
                            <p className="break-all font-medium">
                              {file.title}
                            </p>

                            <p className="mt-1 text-xs text-[var(--color-muted)]">
                              {file.extension.toUpperCase()} -
                              {" "}
                              {(file.size / (1024 * 1024)).toFixed(2)}
                              {" "}MB
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDelete(file._id)}
                            className="btn-custom-delete w-fit"
                          >
                            حذف فایل
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </main>
          </div>

          <div className="md:hidden">
            <Sidebar />
          </div>

        </div>
      </div>
    </AuthWrapper>
  );
}
