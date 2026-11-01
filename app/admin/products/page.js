"use client";

import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GeneralError from "@/components/ui/GeneralError";
import { AiOutlineEdit, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { toPersianDigits, formatPrice } from "@/app/lib/numberUtils";
import AuthWrapper from "@/components/auth/Auth";


const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [expandedCells, setExpandedCells] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("مشکل در دریافت محصولات");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      setError("مشکلی در حذف پیش آمد");
    }
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    const searchableValues = [
      product.name,
      product.author,
      product.description,
      product.file,
      product.category?.name,
      product.fileType,
      ...(Array.isArray(product.tags)
        ? product.tags.map((tag) =>
            typeof tag === "object" && tag !== null ? tag.name : tag,
          )
        : []),
    ];

    return searchableValues.some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(search),
    );
  });
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  return (
    <AuthWrapper>
    <div className="min-h-screen w-full min-w-0 overflow-x-clip">
      <div className="flex min-h-screen w-full min-w-0 gap-4">
        <div className="hidden shrink-0 md:block md:w-64">
          <Sidebar />
        </div>

        <div className="min-w-0 flex-1">
          <Header />

          <main className="content box-border min-h-screen min-w-0 p-4">
            <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <h4 className="font-bold text-[var(--color-text)]">
                  مدیریت محصولات
                </h4>

                <Link
                  href="/admin/products/add"
                  className="btn-custom-add w-fit"
                >
                  <AiOutlinePlus />
                  افزودن
                </Link>
              </div>
              <div className="border-b border-[var(--color-border)] p-3 sm:p-5">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="جست‌وجوی نام محصولات..."
                  aria-label="جست‌وجوی محصولات"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-right text-[var(--color-text)] outline-none transition focus:border-blue-500 sm:max-w-md"
                />
              </div>
              <div className="w-full min-w-0 overflow-x-auto lg:overflow-x-hidden">
                {error && <GeneralError error={error} />}
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <table className="w-full min-w-[1200px] border-collapse text-right lg:min-w-0 lg:table-fixed">
                    <thead>
                      <tr className="bg-[var(--color-background)] text-sm text-[var(--color-muted)]">
                        <th className="table-header-cell">شناسه</th>
                        <th className="table-header-cell">نام</th>
                        <th className="table-header-cell">نویسنده</th>
                        <th className="table-header-cell">توضیحات</th>
                        <th className="table-header-cell">فایل</th>
                        <th className="table-header-cell">تصویر</th>
                        <th className="table-header-cell">دسته بندی</th>
                        <th className="table-header-cell">برچسب ها</th>
                        <th className="table-header-cell">نوع فایل</th>
                        <th className="table-header-cell">وضعیت</th>
                        <th className="table-header-cell">وضعیت فروش</th>
                        <th className="table-header-cell">موجودی</th>
                        <th className="table-header-cell">قیمت</th>
                        <th className="table-header-cell">قیمت تخفیفی</th>
                        <th className="table-header-cell">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {currentProducts.map((product, index) => {
                        return (
                          <tr
                            key={product._id || index}
                            className="transition-colors duration-200"
                          >
                            <td className="table-cell hover:bg-[var(--color-hover)]">
                              {toPersianDigits(
                                (currentPage - 1) * itemsPerPage + index + 1,
                              )}
                            </td>

                            <td
                              className={`table-cell cursor-pointer hover:bg-[var(--color-hover)] ${
                                expandedCells[`${product._id}-name`]
                                  ? "whitespace-normal overflow-visible [overflow-wrap:anywhere]"
                                  : "truncate whitespace-nowrap overflow-hidden"
                              }`}
                              onClick={() =>
                                setExpandedCells((prev) => ({
                                  ...prev,
                                  [`${product._id}-name`]:
                                    !prev[`${product._id}-name`],
                                }))
                              }
                            >
                              {product.name}
                            </td>

                            <td
                              className={`table-cell cursor-pointer hover:bg-[var(--color-hover)] ${
                                expandedCells[`${product._id}-author`]
                                  ? "whitespace-normal overflow-visible [overflow-wrap:anywhere]"
                                  : "truncate whitespace-nowrap overflow-hidden"
                              }`}
                              onClick={() =>
                                setExpandedCells((prev) => ({
                                  ...prev,
                                  [`${product._id}-author`]:
                                    !prev[`${product._id}-author`],
                                }))
                              }
                              title="برای نمایش کامل متن کلیک کنید"
                            >
                              {product.author || "نامشخص"}
                            </td>

                            <td
                              className={`table-cell cursor-pointer hover:bg-[var(--color-hover)] ${
                                expandedCells[`${product._id}-description`]
                                  ? "description-expanded"
                                  : ""
                              }`}
                              onClick={() =>
                                setExpandedCells((prev) => ({
                                  ...prev,
                                  [`${product._id}-description`]:
                                    !prev[`${product._id}-description`],
                                }))
                              }
                              title="برای نمایش کامل توضیحات کلیک کنید"
                            >
                              {product.description || "بدون توضیحات"}
                            </td>

                            <td
                              className={`table-cell cursor-pointer hover:bg-[var(--color-hover)] ${
                                expandedCells[`${product._id}-file`]
                                  ? "description-expanded"
                                  : ""
                              }`}
                              onClick={() =>
                                setExpandedCells((prev) => ({
                                  ...prev,
                                  [`${product._id}-file`]:
                                    !prev[`${product._id}-file`],
                                }))
                              }
                              title="برای نمایش کامل فایل کلیک کنید"
                            >
                              {product.file || "بدون فایل"}
                            </td>

                            <td className="table-cell hover:bg-[var(--color-hover)]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-16 w-16 rounded-md object-cover"
                              />
                            </td>

                            <td
                              className={`table-cell cursor-pointer hover:bg-[var(--color-hover)] ${
                                expandedCells[`${product._id}-category`]
                                  ? "description-expanded"
                                  : ""
                              }`}
                              onClick={() =>
                                setExpandedCells((prev) => ({
                                  ...prev,
                                  [`${product._id}-category`]:
                                    !prev[`${product._id}-category`],
                                }))
                              }
                              title="برای نمایش کامل دسته‌بندی کلیک کنید"
                            >
                              {product.category?.name || "بدون دسته بندی"}
                            </td>

                            <td
                              className="table-cell cursor-pointer hover:bg-[var(--color-hover)] align-top"
                              onClick={() =>
                                setExpandedCells((prev) => ({
                                  ...prev,
                                  [`${product._id}-tags`]:
                                    !prev[`${product._id}-tags`],
                                }))
                              }
                              title="برای نمایش کامل برچسب‌ها کلیک کنید"
                            >
                              <div
                                className={`min-w-0 w-full ${
                                  expandedCells[`${product._id}-tags`]
                                    ? "whitespace-normal break-words"
                                    : "overflow-hidden text-ellipsis whitespace-nowrap"
                                }`}
                              >
                                {Array.isArray(product.tags) &&
                                product.tags.length > 0
                                  ? product.tags
                                      .map((tag) =>
                                        typeof tag === "object" && tag !== null
                                          ? tag.name
                                          : tag,
                                      )
                                      .join("، ")
                                  : "بدون برچسب"}
                              </div>
                            </td>

                            <td className="table-cell w-12">
                              {product.fileType === "AUDIO"
                                ? "کتاب صوتی"
                                : product.fileType?.toUpperCase() || "نامشخص"}
                            </td>

                            <td className="table-cell hover:bg-[var(--color-hover)]">
                              {product.isActive === true ? "فعال" : "غیرفعال"}
                            </td>

                            <td className="table-cell hover:bg-[var(--color-hover)]">
                              {product.saleStatus === true ? "فعال" : "غیرفعال"}
                            </td>

                            <td className="table-cell hover:bg-[var(--color-hover)]">
                              {toPersianDigits(product.stock)}
                            </td>

                            <td className="table-cell hover:bg-[var(--color-hover)]">
                              {toPersianDigits(formatPrice(product.price))}
                            </td>

                            <td className="table-cell hover:bg-[var(--color-hover)]">
                              {product.discountPrice != null &&
                              product.discountPrice !== ""
                                ? toPersianDigits(
                                    formatPrice(product.discountPrice),
                                  )
                                : "بدون تخفیف"}
                            </td>

                            <td className="py-2 break-word">
                              <div className="flex gap-2">
                                <Link
                                  href={`/admin/products/${product._id}`}
                                  className="btn-custom-edit"
                                  title="ویرایش"
                                >
                                  <AiOutlineEdit size={18} />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(product._id)}
                                  className="btn-custom-delete"
                                  title="حذف"
                                >
                                  <AiOutlineDelete size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {!loading && (
                <div className="min-w-0 px-2 py-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
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
};

export default Products;
