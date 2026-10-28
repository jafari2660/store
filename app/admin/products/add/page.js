"use client";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const AddProduct = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [Categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [fileType, setFileType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saleStatus, setSaleStatus] = useState(true);
  const [discountPrice, setDiscountPrice] = useState("");
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت دسته بندی");
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch(() => setError("مشکلی در دریافت دسته بندی رخ داده است"));
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);

        const response = await fetch("/api/tags");

        if (!response.ok) {
          throw new Error("خطا در دریافت برچسب‌ها");
        }

        const data = await response.json();
        setAllTags(Array.isArray(data) ? data : data.tags || []);
      } catch (error) {
        setError("مشکلی در دریافت برچسب‌ها رخ داده است");
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      setFormError("نام محصول الزامی می‌باشد");
      return false;
    }

    if (name.trim().length < 3 || name.trim().length > 30) {
      setFormError("نام محصول باید بین ۳ تا ۳۰ کاراکتر باشد");
      return false;
    }

    if (!author.trim()) {
      setFormError("نام نویسنده الزامی می‌باشد");
      return false;
    }

    if (author.trim().length < 2 || author.trim().length > 100) {
      setFormError("نام نویسنده باید بین ۲ تا ۱۰۰ کاراکتر باشد");
      return false;
    }

    if (!description.trim()) {
      setFormError("توضیحات محصول الزامی می‌باشد");
      return false;
    }

    if (description.trim().length < 3 || description.trim().length > 200) {
      setFormError("توضیحات باید بین ۳ تا ۲۰۰ کاراکتر باشد");
      return false;
    }

    if (!file) {
      setFormError("فایل محصول را انتخاب کنید");
      return false;
    }

    if (!image) {
      setFormError("تصویر محصول را انتخاب کنید");
      return false;
    }

    if (!category) {
      setFormError("دسته‌بندی محصول را انتخاب کنید");
      return false;
    }

    if (!fileType.trim()) {
      setFormError("نوع فایل الزامی می‌باشد");
      return false;
    }

    if (
      price.trim() === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      setFormError("قیمت باید عددی معتبر و غیرمنفی باشد");
      return false;
    }

    if (
      stock.trim() === "" ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      setFormError("موجودی باید عدد صحیح و غیرمنفی باشد");
      return false;
    }

    if (discountPrice.trim() !== "") {
      const discount = Number(discountPrice);

      if (
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount >= Number(price)
      ) {
        setFormError("قیمت تخفیفی باید غیرمنفی و کمتر از قیمت اصلی باشد");
        return false;
      }
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError(null);
    setFormError("");

    if (!file) {
      setFormError("فایل محصول الزامی می‌باشد");
      return;
    }

    if (!author.trim()) {
      setFormError("نام نویسنده محصول الزامی می‌باشد");
      return;
    }

    if (!image) {
      setFormError("تصویر محصول الزامی می‌باشد");
      return;
    }

    if (!description.trim()) {
      setFormError("توضیحات محصول الزامی می‌باشد");
      return;
    }

    if (!category || !fileType.trim()) {
      setFormError("دسته‌بندی و نوع فایل الزامی هستند");
      return;
    }

    if (
      price.trim() === "" ||
      stock.trim() === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      !Number.isFinite(Number(stock)) ||
      Number(stock) < 0
    ) {
      setFormError("قیمت و موجودی باید عددی معتبر و غیرمنفی باشند");
      return;
    }

    const parsedDiscount =
      discountPrice.trim() === "" ? null : Number(discountPrice);

    if (
      parsedDiscount !== null &&
      (!Number.isFinite(parsedDiscount) ||
        parsedDiscount < 0 ||
        parsedDiscount >= Number(price))
    ) {
      setFormError("قیمت تخفیفی باید کمتر از قیمت اصلی باشد");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("author", author.trim());
      formData.append("description", description.trim());

      formData.append("file", file);
      formData.append("image", image);

      formData.append("category", category);
      formData.append("tags", JSON.stringify(tags));
      formData.append("fileType", fileType.trim().toLowerCase());
      formData.append("isActive", String(isActive));
      formData.append("saleStatus", String(saleStatus));

      formData.append("price", String(Number(price)));
      formData.append("stock", String(Number(stock)));
      formData.append(
        "discountPrice",
        discountPrice.trim() === "" ? "" : String(Number(discountPrice)),
      );

      const response = await fetch("/api/products", {
        method: "POST",

        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "مشکلی در ساخت محصول پیش آمده است");
        return;
      }

      router.push("/admin/products");
    } catch (error) {
      setError("مشکلی در ارتباط با سرور پیش آمده است");
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
          <main className="min-h-screen min-w-0 p-2 sm:p-3 md:p-4">
            <div className="mx-auto w-full max-w-5xl min-w-0 rounded-xl border border-[var(--color-border)] p-3 shadow-sm sm:p-5 md:p-6">
              <h2 className="my-4">افزودن محصول جدید</h2>
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
                    نام
                  </label>

                  <input
                    type="text"
                    placeholder=" نام کتاب را وارد کنید "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field w-full min-w-0"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    نویسنده
                  </label>

                  <input
                    type="text"
                    placeholder=" نام نویسنده "
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="input-field w-full min-w-0"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    توضیحات
                  </label>

                  <input
                    type="text"
                    placeholder="توضیحات کتاب را بنویسید ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field w-full min-w-0"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    فایل
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="input-field w-full min-w-0"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    تصویر
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      const selectedImage = e.target.files?.[0] || null;

                      setImage(selectedImage);

                      if (selectedImage) {
                        setImagePreview(URL.createObjectURL(selectedImage));
                      } else {
                        setImagePreview(null);
                      }
                    }}
                    className="input-field w-full min-w-0"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="mb-2 text-sm text-[var(--color-text)]">
                        پیش‌نمایش تصویر کتاب:
                      </p>

                      <img
                        src={imagePreview}
                        alt="پیش‌نمایش تصویر کتاب"
                        className="h-48 w-40 rounded-lg border border-[var(--color-border)] object-cover shadow-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    دسته بندی
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="input-field w-full"
                  >
                    <option value=""> انتخاب دسته بندی</option>
                    {Categories.map((cat) => {
                      return (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    برچسب‌ها
                  </label>

                  {tagsLoading ? (
                    <p className="text-sm">در حال دریافت برچسب‌ها...</p>
                  ) : allTags.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      برچسبی ثبت نشده است. ابتدا از بخش مدیریت برچسب‌ها، برچسب
                      ایجاد کنید.
                    </p>
                  ) : (
                    <select
                      multiple
                      value={tags}
                      onChange={(e) =>
                        setTags(
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value,
                          ),
                        )
                      }
                      className="input-field w-full min-w-0 min-h-32"
                    >
                      {allTags.map((tag) => (
                        <option key={tag._id} value={tag._id}>
                          {tag.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    برای انتخاب چند برچسب، در کامپیوتر کلید Ctrl یا در مک کلید
                    Command را نگه دارید.
                  </p>
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    نوع فایل
                  </label>

                  <select
                    name="fileType"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="input-field w-full sm:w-64 min-w-0"
                  >
                    <option value="">نوع فایل را انتخاب کنید</option>
                    <option value="pdf">کتاب PDF</option>
                    <option value="docx">کتاب Word (DOCX)</option>
                    <option value="audio">کتاب صوتی</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    وضعیت
                  </label>

                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="input-field w-full min-w-0 sm:w-64"
                  >
                    <option value="true">فعال</option>
                    <option value="false">غیرفعال</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    وضعیت فروش
                  </label>

                  <select
                    value={saleStatus ? "true" : "false"}
                    onChange={(e) => setSaleStatus(e.target.value === "true")}
                    className="input-field w-full min-w-0 sm:w-64"
                  >
                    <option value="true">فعال</option>
                    <option value="false">غیرفعال</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    موجودی
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="input-field w-full min-w-0"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    قیمت
                  </label>

                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field w-full min-w-0"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    قیمت تخفیفی
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="اختیاری"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="input-field w-full min-w-0"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 
                            text-sm text-white transition hover:opacity-80 sm:w-auto"
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

export default AddProduct;
