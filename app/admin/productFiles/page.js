"use client";

import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GeneralError from "@/components/ui/GeneralError";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { toPersianDigits } from "@/app/lib/numberUtils";
import AuthWrapper from "@/components/auth/Auth";
import { AiOutlineEdit } from "react-icons/ai";

const ProductFiles = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("مشکل در دریافت محصولات");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("ساختار اطلاعات محصولات معتبر نیست.");
        }

        const productsWithFiles = await Promise.all(
          data.map(async (product) => {
            const filesResponse = await fetch(
              `/api/productFiles/${product._id}`,
            );

            if (!filesResponse.ok) {
              throw new Error(`خطا در دریافت فایل‌های محصول ${product.name}`);
            }

            const files = await filesResponse.json();

            if (!Array.isArray(files)) {
              throw new Error(
                `اطلاعات فایل‌های محصول ${product.name} معتبر نیست.`,
              );
            }

            return {
              ...product,
              productFiles: files,
            };
          }),
        );

        setProducts(productsWithFiles);
      } catch (error) {
        setError(new Error(error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getAuthors = (product) => {
    const authors = [
      ...new Set(
        (product.productFiles || [])
          .map((file) => file.author?.trim())
          .filter(Boolean),
      ),
    ];

    return authors.length ? authors.join("، ") : "نامشخص";
  };

  const getSpeakers = (product) => {
    const speakers = [
      ...new Set(
        (product.productFiles || [])
          .map((file) => file.speaker?.trim())
          .filter(Boolean),
      ),
    ];

    return speakers.length ? speakers.join("، ") : "نامشخص";
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    const authors = getAuthors(product);
    const speakers = getSpeakers(product);

    return (
      product.name?.toLowerCase().includes(search) ||
      authors.toLowerCase().includes(search) ||
      speakers.toLowerCase().includes(search)
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
                <div className="border-b border-[var(--color-border)] p-3 sm:p-5">
                  <h4 className="font-bold text-[var(--color-text)]">
                    مدیریت فایل‌های محصول
                  </h4>
                </div>

                <div className="border-b border-[var(--color-border)] p-3 sm:p-5">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="جست‌وجوی نام محصول، نویسنده یا گوینده..."
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-right text-[var(--color-text)] outline-none transition focus:border-blue-500 sm:max-w-md"
                  />
                </div>

                <div className="w-full min-w-0 overflow-x-auto lg:overflow-x-hidden">
                  {error && <GeneralError error={error} />}

                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <table className="w-full min-w-[750px] border-collapse text-right lg:min-w-0 lg:table-fixed">
                      <thead>
                        <tr className="bg-[var(--color-background)] text-sm text-[var(--color-muted)]">
                          <th className="table-header-cell">ردیف</th>
                          <th className="table-header-cell">نام محصول</th>
                          <th className="table-header-cell">نویسنده</th>
                          <th className="table-header-cell">گوینده</th>
                          <th className="table-header-cell">عملیات</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[var(--color-border)]">
                        {currentProducts.map((product, index) => (
                          <tr
                            key={product._id}
                            className="transition-colors duration-200"
                          >
                            <td className="table-cell">
                              {toPersianDigits(
                                (currentPage - 1) * itemsPerPage + index + 1,
                              )}
                            </td>

                            <td className="table-cell">{product.name}</td>

                            <td className="table-cell">
                              {getAuthors(product)}
                            </td>

                            <td className="table-cell">
                              {getSpeakers(product)}
                            </td>

                            <td className="table-cell">
                              <div className="flex w-full items-center justify-center">
                                <Link
                                  href={`/admin/productFiles/${product._id}`}
                                  className="btn-custom-edit !min-w-0 !w-8 !h-8 !p-0 inline-flex items-center justify-center"
                                  title="ویرایش"
                                >
                                  <AiOutlineEdit size={16} />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {currentProducts.length === 0 && (
                          <tr>
                            <td colSpan="5" className="table-cell text-center">
                              محصولی پیدا نشد.
                            </td>
                          </tr>
                        )}
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

export default ProductFiles;
