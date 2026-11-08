
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
  const [author, setAuthor] = useState("");
  const [speaker, setSpeaker] = useState("");

  const [editingFileId, setEditingFileId] = useState(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editSpeaker, setEditSpeaker] = useState("");

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
        throw new Error(
          productData.message || "خطا در دریافت محصول"
        );
      }

      if (!filesRes.ok) {
        throw new Error(
          filesData.message || "خطا در دریافت فایل‌ها"
        );
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
    if (id) getData();
  }, [id]);

  async function handleUpload(e) {
    e.preventDefault();

    setError("");

    if (!selectedFile) {
      setError("لطفاً یک فایل انتخاب کنید.");
      return;
    }

    if (
      author.trim().length < 2 ||
      author.trim().length > 100
    ) {
      setError(
        "نام نویسنده باید بین ۲ تا ۱۰۰ کاراکتر باشد."
      );
      return;
    }

    if (
      product?.fileType === "AUDIO" &&
      (
        speaker.trim().length < 2 ||
        speaker.trim().length > 100
      )
    ) {
      setError(
        "نام گوینده باید بین ۲ تا ۱۰۰ کاراکتر باشد."
      );
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("title", selectedFile.name);
      formData.append("author", author.trim());

      if (product?.fileType === "AUDIO") {
        formData.append("speaker", speaker.trim());
      }

      const response = await fetch(
        `/api/productFiles/${id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "خطا در ذخیره فایل"
        );
      }

      setSelectedFile(null);
      setAuthor("");
      setSpeaker("");

      e.target.reset();

      await getData();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(file) {
    setEditingFileId(file._id);
    setEditAuthor(file.author || "");
    setEditSpeaker(file.speaker || "");
    setError("");
  }

  function cancelEditing() {
    setEditingFileId(null);
    setEditAuthor("");
    setEditSpeaker("");
    setError("");
  }

  async function handleUpdateFile(fileId) {
    setError("");

    if (
      editAuthor.trim().length < 2 ||
      editAuthor.trim().length > 100
    ) {
      setError(
        "نام نویسنده باید بین ۲ تا ۱۰۰ کاراکتر باشد."
      );
      return;
    }

    if (
      product?.fileType === "AUDIO" &&
      (
        editSpeaker.trim().length < 2 ||
        editSpeaker.trim().length > 100
      )
    ) {
      setError(
        "نام گوینده باید بین ۲ تا ۱۰۰ کاراکتر باشد."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/productFiles/${id}/${fileId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            author: editAuthor.trim(),
            speaker:
              product?.fileType === "AUDIO"
                ? editSpeaker.trim()
                : "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "خطا در ویرایش فایل"
        );
      }

      setFiles((previousFiles) =>
        previousFiles.map((file) =>
          file._id === fileId
            ? {
                ...file,
                author: data.author,
                speaker: data.speaker,
              }
            : file
        )
      );

      cancelEditing();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(fileId) {
    const confirmed = confirm(
      "آیا از حذف این فایل مطمئن هستید؟"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(
        `/api/productFiles/${id}/${fileId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "خطا در حذف فایل"
        );
      }

      setFiles((previousFiles) =>
        previousFiles.filter(
          (file) => file._id !== fileId
        )
      );

      if (editingFileId === fileId) {
        cancelEditing();
      }
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <AuthWrapper>
      <div className="min-h-screen w-full min-w-0 overflow-x-clip">
        <div className="flex min-h-screen w-full min-w-0 gap-4">

          {/* سایدبار */}
          <div className="hidden shrink-0 md:block md:w-64">
            <Sidebar />
          </div>

          <div className="min-w-0 flex-1">
            <Header />

            <main className="content min-h-screen min-w-0 p-3 sm:p-4">

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">

                {/* عنوان صفحه */}
                <div className="border-b border-[var(--color-border)] p-4">

                  <h2 className="font-bold text-[var(--color-text)]">
                    مدیریت فایل‌های محصول
                  </h2>

                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    محصول: {product?.name}
                  </p>

                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    نوع فایل: {product?.fileType}
                  </p>

                  <Link
                    href="/admin/productFiles"
                    className="mt-3 inline-block text-sm text-[var(--color-primary)]"
                  >
                    بازگشت به محصولات
                  </Link>

                </div>

                {/* فرم آپلود */}
                <div className="border-b border-[var(--color-border)] p-4">

                  <h3 className="mb-4 font-bold">
                    افزودن فایل جدید
                  </h3>

                  {error && (
                    <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <form
                    onSubmit={handleUpload}
                    className="space-y-3"
                  >

                    {/* نویسنده */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        نام نویسنده
                      </label>

                      <input
                        type="text"
                        value={author}
                        onChange={(e) =>
                          setAuthor(e.target.value)
                        }
                        placeholder="نام نویسنده این فایل"
                        required
                        minLength={2}
                        maxLength={100}
                        className="input-field w-full"
                      />
                    </div>

                    {/* گوینده فقط برای فایل صوتی */}
                    {product?.fileType === "AUDIO" && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                          نام گوینده
                        </label>

                        <input
                          type="text"
                          value={speaker}
                          onChange={(e) =>
                            setSpeaker(e.target.value)
                          }
                          placeholder="نام گوینده این فایل صوتی"
                          required
                          minLength={2}
                          maxLength={100}
                          className="input-field w-full"
                        />
                      </div>
                    )}

                    {/* انتخاب فایل */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        انتخاب فایل
                      </label>

                      <input
                        type="file"
                        accept={
                          product?.fileType === "PDF"
                            ? ".pdf"
                            : product?.fileType === "DOCX"
                              ? ".docx"
                              : product?.fileType === "AUDIO"
                                ? ".mp3,.wav,.m4a"
                                : product?.fileType === "ZIP"
                                  ? ".zip"
                                  : product?.fileType === "RAR"
                                    ? ".rar"
                                    : ""
                        }
                        onChange={(e) =>
                          setSelectedFile(
                            e.target.files?.[0] || null
                          )
                        }
                        className="input-field w-full"
                      />
                    </div>

                    {selectedFile && (
                      <p className="text-xs text-[var(--color-muted)]">
                        فایل انتخاب‌شده: {selectedFile.name}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        !selectedFile ||
                        !author.trim() ||
                        (
                          product?.fileType === "AUDIO" &&
                          !speaker.trim()
                        )
                      }
                      className="btn-custom-add mt-3 disabled:opacity-50"
                    >
                      {saving
                        ? "در حال ذخیره..."
                        : "آپلود و ذخیره فایل"}
                    </button>

                  </form>
                </div>

                {/* جدول فایل‌ها */}
                <div className="p-4">

                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[var(--color-text)]">
                      فایل‌های محصول
                    </h3>

                    <span className="text-sm text-[var(--color-muted)]">
                      تعداد: {files.length}
                    </span>
                  </div>

                  {error && (
                    <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  {files.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)]">
                      هنوز فایلی برای این محصول ثبت نشده است.
                    </p>
                  ) : (
                    <div className="w-full overflow-x-auto">

                      <table className="w-full min-w-[850px] text-sm text-right">

                        <thead>
                          <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">

                            <th className="p-3 font-medium">
                              عنوان فایل
                            </th>

                            <th className="p-3 font-medium">
                              نویسنده
                            </th>

                            <th className="p-3 font-medium">
                              گوینده
                            </th>

                            <th className="p-3 font-medium">
                              فرمت
                            </th>

                            <th className="p-3 font-medium">
                              حجم
                            </th>

                            <th className="p-3 font-medium">
                              عملیات
                            </th>

                          </tr>
                        </thead>

                        <tbody>
                          {files.map((file) => (
                            <tr
                              key={file._id}
                              className="border-b border-[var(--color-border)] last:border-0"
                            >

                              {editingFileId === file._id ? (
                                <>
                                  {/* عنوان فایل */}
                                  <td className="max-w-[220px] break-all p-3 font-medium">
                                    {file.title}
                                  </td>

                                  {/* ویرایش نویسنده */}
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={editAuthor}
                                      onChange={(e) =>
                                        setEditAuthor(e.target.value)
                                      }
                                      maxLength={100}
                                      className="input-field w-40"
                                      placeholder="نام نویسنده"
                                    />
                                  </td>

                                  {/* ویرایش گوینده */}
                                  <td className="p-3">
                                    {product?.fileType === "AUDIO" ? (
                                      <input
                                        type="text"
                                        value={editSpeaker}
                                        onChange={(e) =>
                                          setEditSpeaker(e.target.value)
                                        }
                                        maxLength={100}
                                        className="input-field w-40"
                                        placeholder="نام گوینده"
                                      />
                                    ) : (
                                      "—"
                                    )}
                                  </td>

                                  <td className="p-3 uppercase">
                                    {file.extension}
                                  </td>

                                  <td className="p-3 whitespace-nowrap">
                                    {(
                                      file.size /
                                      (1024 * 1024)
                                    ).toFixed(2)}{" "}
                                    MB
                                  </td>

                                  {/* دکمه‌های ویرایش */}
                                  <td className="p-3">
                                    <div className="flex flex-wrap gap-2">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateFile(file._id)
                                        }
                                        disabled={saving}
                                        className="btn-custom-add whitespace-nowrap disabled:opacity-50"
                                      >
                                        {saving
                                          ? "در حال ذخیره..."
                                          : "ذخیره"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={cancelEditing}
                                        disabled={saving}
                                        className="btn-custom-delete whitespace-nowrap disabled:opacity-50"
                                      >
                                        انصراف
                                      </button>

                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="max-w-[220px] break-all p-3 font-medium text-[var(--color-text)]">
                                    {file.title}
                                  </td>

                                  <td className="p-3">
                                    {file.author || "—"}
                                  </td>

                                  <td className="p-3">
                                    {product?.fileType === "AUDIO"
                                      ? file.speaker || "—"
                                      : "—"}
                                  </td>

                                  <td className="p-3 uppercase">
                                    {file.extension}
                                  </td>

                                  <td className="p-3 whitespace-nowrap">
                                    {(
                                      file.size /
                                      (1024 * 1024)
                                    ).toFixed(2)}{" "}
                                    MB
                                  </td>

                                  {/* عملیات */}
                                  <td className="p-3">
                                    <div className="flex flex-wrap gap-2">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          startEditing(file)
                                        }
                                        className="btn-custom-add !min-w-[76px] !w-[76px] !h-8 !px-2 !py-1 inline-flex items-center justify-center text-xs leading-none whitespace-nowrap"
                                      >
                                        ویرایش
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDelete(file._id)
                                        }
                                        className="btn-custom-delete !min-w-[76px] !w-[76px] !h-8 !px-2 !py-1 inline-flex items-center justify-center text-xs leading-none whitespace-nowrap"
                                      >
                                        حذف فایل
                                      </button>

                                    </div>
                                  </td>
                                </>
                              )}

                            </tr>
                          ))}
                        </tbody>

                      </table>

                    </div>
                  )}

                </div>

              </div>

            </main>
          </div>

          {/* سایدبار موبایل */}
          <div className="md:hidden">
            <Sidebar />
          </div>

        </div>
      </div>
    </AuthWrapper>
  );
}
