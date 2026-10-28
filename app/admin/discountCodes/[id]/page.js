"use client";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const UpdateDiscountCodes = () => {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState("");
  const [expiresDate, setExpiresDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchDiscountCode = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/discountCodes/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "کد تخفیف پیدا نشد");
        }

        setCode(data.code ?? "");
        setPercentage(String(data.percentage ?? ""));
        setExpiresDate(
          data.expiresDate
            ? new Date(data.expiresDate).toISOString().split("T")[0]
            : "",
        );
        setIsActive(data.isActive ?? true);
      } catch (error) {
        setError(error.message || "مشکلی در دریافت کد تخفیف پیش آمده است");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountCode();
  }, [id]);

  const validateForm = () => {
    if (!code.trim()) {
      setFormError("وارد کردن کد تخفیف الزامی است");
      return false;
    }

    if (code.trim().length < 3) {
      setFormError("کد تخفیف باید حداقل ۳ کاراکتر باشد");
      return false;
    }

    if (
      percentage.trim() === "" ||
      !Number.isFinite(Number(percentage)) ||
      Number(percentage) < 1 ||
      Number(percentage) > 100
    ) {
      setFormError("درصد تخفیف باید عددی بین ۱ تا ۱۰۰ باشد");
      return false;
    }

    if (!expiresDate) {
      setFormError("تاریخ انقضای کد تخفیف الزامی است");
      return false;
    }

    if (Number.isNaN(new Date(expiresDate).getTime())) {
      setFormError("تاریخ انقضا معتبر نیست");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError(null);
    setFormError("");

    try {
      const response = await fetch(`/api/discountCodes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
          percentage: Number(percentage),
          expiresDate,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "ویرایش کد تخفیف انجام نشد");
        return;
      }

      router.push("/admin/discountCodes");
    } catch (error) {
      setError("مشکلی در ارتباط با سرور پیش آمده است");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip">
      <div className="flex min-h-screen w-full min-w-0">
        <div className="hidden shrink-0 md:block md:w-64">
          <Sidebar />
        </div>
        <div className="min-w-0 flex-1">
          <Header />
          <main className="min-h-[80vh] min-w-0 overflow-x-auto p-2 sm:p-3 md:p-4">
            <div className="mx-auto w-full max-w-3xl min-w-0 rounded-xl border border-[var(--color-border)] p-3 shadow-sm sm:p-5 md:p-6">
              <h2 className="my-4">ویرایش کد تخفیف</h2>
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

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    کد تخفیف
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input-field"
                    placeholder="کد تخفیف را وارد کنید"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    درصد تخفیف
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="input-field"
                    placeholder="مثلاً ۲۰"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    تاریخ انقضا
                  </label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    value={expiresDate ? new Date(expiresDate) : ""}
                    onChange={(date) =>
                      setExpiresDate(date ? date.toDate().toISOString() : "")
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    وضعیت
                  </label>
                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="input-field"
                  >
                    <option value="true">فعال</option>
                    <option value="false">غیرفعال</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition hover:opacity-80"
                >
                  ذخیره تغییرات
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

export default UpdateDiscountCodes;
