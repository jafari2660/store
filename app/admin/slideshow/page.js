
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AuthWrapper from "@/components/auth/Auth";

import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlus,
} from "react-icons/ai";

export default function SlideshowPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/slideshow?all=true", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در دریافت اسلایدها");
      }

      setSlides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "آیا از حذف این اسلاید مطمئن هستید؟"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(`/api/slideshow/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "حذف اسلاید ناموفق بود");
      }

      setSlides((previous) =>
        previous.filter((slide) => slide._id !== id)
      );
    } catch (err) {
      alert(err.message || "خطا در حذف اسلاید");
    } finally {
      setDeletingId(null);
    }
  };


  const getPositionLabel = (position) => {
    switch (position) {
      case "main":
        return "اسلاید اصلی";
      case "sideTop":
        return "بنر کناری بالا";
      case "sideBottom":
        return "بنر کناری پایین";
      default:
        return "نامشخص";
    }
  };

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

              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-xl font-bold">
                  مدیریت اسلایدشو
                </h1>

                <Link
                  href="/admin/slideshow/add"
                  className="btn-custom-add flex items-center gap-2"
                >
                  <AiOutlinePlus />
                  افزودن اسلاید
                </Link>
              </div>

            
              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                  {error}

                  <button
                    onClick={fetchSlides}
                    className="mr-3 underline"
                  >
                    تلاش مجدد
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">

                  <table className="w-full text-sm text-right">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="table-header-cell">تصویر</th>
                        <th className="table-header-cell">لینک مقصد</th>
                        <th className="table-header-cell">جایگاه</th>
                        <th className="table-header-cell">ترتیب</th>
                        <th className="table-header-cell">وضعیت</th>
                        <th className="table-header-cell">عملیات</th>
                      </tr>
                    </thead>

                    <tbody>
                      {slides.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-8 text-gray-500"
                          >
                            هنوز اسلایدی ثبت نشده است.
                          </td>
                        </tr>
                      ) : (
                        slides.map((slide) => (
                          <tr key={slide._id} className="border-b">

                      
                            <td className="table-cell">
                              <div className="relative w-24 h-14">
                                <Image
                                  src={slide.image}
                                  alt="تصویر اسلاید"
                                  fill
                                  sizes="96px"
                                  unoptimized
                                  className="object-cover rounded"
                                />
                              </div>
                            </td>

                        
                            <td className="table-cell max-w-48 break-all">
                              {slide.link}
                            </td>

                           
                            <td className="table-cell">
                              {getPositionLabel(slide.position)}
                            </td>

                           
                            <td className="table-cell">
                              {slide.order}
                            </td>

                      
                            <td className="table-cell">
                              <span
                                className={
                                  slide.isActive
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {slide.isActive ? "فعال" : "غیرفعال"}
                              </span>
                            </td>

                            <td className="table-cell">
                              <div className="flex items-center gap-3">

                                <Link
                                  href={`/admin/slideshow/${slide._id}`}
                                  className="btn-custom-edit"
                                  title="ویرایش"
                                >
                                  <AiOutlineEdit />
                                </Link>

                                <button
                                  onClick={() => handleDelete(slide._id)}
                                  disabled={deletingId === slide._id}
                                  className="btn-custom-delete"
                                  title="حذف"
                                >
                                  {deletingId === slide._id
                                    ? "..."
                                    : <AiOutlineDelete />}
                                </button>

                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                </div>
              )}

            </main>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
