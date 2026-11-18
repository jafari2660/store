
import connectToDatabase from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import Slide from "@/models/Slide";

import mongoose from "mongoose";
import { join, extname } from "path";
import { writeFile, mkdir, unlink } from "fs/promises";
import { randomUUID } from "crypto";

// حداکثر حجم تصویر: ۵ مگابایت
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// فرمت‌های مجاز تصویر
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
];

// جایگاه‌های مجاز
const ALLOWED_POSITIONS = ["main", "sideTop", "sideBottom"];

// ظرفیت هر جایگاه
const POSITION_LIMITS = {
  main: 6,
  sideTop: 1,
  sideBottom: 1,
};

// ذخیره تصویر جدید
async function saveImage(file) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("تصویر انتخاب‌شده معتبر نیست");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("فرمت تصویر معتبر نیست");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد");
  }

  const extension = extname(file.name).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error("پسوند تصویر معتبر نیست");
  }

  const directory = join(
    process.cwd(),
    "public",
    "images",
    "slideshow"
  );

  await mkdir(directory, { recursive: true });

  const fileName = `${randomUUID()}${extension}`;
  const filePath = join(directory, fileName);

  await writeFile(
    filePath,
    Buffer.from(await file.arrayBuffer())
  );

  return {
    image: `/images/slideshow/${fileName}`,
    filePath,
  };
}

// حذف تصویر قبلی
async function deleteOldImage(image) {
  if (
    typeof image !== "string" ||
    !image.startsWith("/images/slideshow/")
  ) {
    return;
  }

  const fileName = image.split("/").pop();

  if (!fileName || fileName.includes("..")) {
    return;
  }

  const filePath = join(
    process.cwd(),
    "public",
    "images",
    "slideshow",
    fileName
  );

  await unlink(filePath).catch(() => {});
}

// بررسی ظرفیت جایگاه
async function checkPositionLimit(position, currentId) {
  const limit = POSITION_LIMITS[position];

  if (!limit) {
    return false;
  }

  const count = await Slide.countDocuments({
    position,
    _id: { $ne: currentId },
  });

  return count < limit;
}

// دریافت اطلاعات یک اسلاید
export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه اسلاید معتبر نیست" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const slide = await Slide.findById(id);

    if (!slide) {
      return Response.json(
        { message: "اسلاید پیدا نشد" },
        { status: 404 }
      );
    }

    return Response.json(slide, { status: 200 });

  } catch (error) {
    console.error("GET SINGLE SLIDE ERROR:", error);

    return Response.json(
      { message: "خطا در دریافت اطلاعات اسلاید" },
      { status: 500 }
    );
  }
}

// ویرایش اسلاید
export async function PUT(request, { params }) {
  let savedFilePath = null;

  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه اسلاید معتبر نیست" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const slide = await Slide.findById(id);

    if (!slide) {
      return Response.json(
        { message: "اسلاید پیدا نشد" },
        { status: 404 }
      );
    }

    const data = await request.formData();

    const link = data.get("link");
    const position = data.get("position");
    const order = Number(data.get("order"));
    const isActiveValue = data.get("isActive");
    const imageFile = data.get("image");

    // بررسی لینک
    if (typeof link !== "string" || !link.trim()) {
      return Response.json(
        { message: "لینک اسلاید الزامی است" },
        { status: 400 }
      );
    }

    // بررسی جایگاه
    if (!ALLOWED_POSITIONS.includes(position)) {
      return Response.json(
        { message: "محل نمایش اسلاید معتبر نیست" },
        { status: 400 }
      );
    }

    // بررسی ترتیب
    if (!Number.isInteger(order) || order < 0) {
      return Response.json(
        { message: "ترتیب نمایش معتبر نیست" },
        { status: 400 }
      );
    }

    // بررسی وضعیت
    if (!["true", "false"].includes(isActiveValue)) {
      return Response.json(
        { message: "وضعیت اسلاید معتبر نیست" },
        { status: 400 }
      );
    }

    // بررسی ظرفیت جایگاه مقصد
    const hasCapacity = await checkPositionLimit(position, id);

    if (!hasCapacity) {
      return Response.json(
        { message: "ظرفیت این جایگاه تکمیل شده است" },
        { status: 400 }
      );
    }

    // تصویر قبلی
    const oldImage = slide.image;
    let newImage = oldImage;

    // اگر تصویر جدید ارسال شده باشد
    if (imageFile !== null) {
      if (!(imageFile instanceof File) || imageFile.size === 0) {
        return Response.json(
          { message: "تصویر انتخاب‌شده معتبر نیست" },
          { status: 400 }
        );
      }

      const saved = await saveImage(imageFile);

      savedFilePath = saved.filePath;
      newImage = saved.image;
    }

    // به‌روزرسانی اطلاعات
    slide.link = link.trim();
    slide.position = position;
    slide.order = order;
    slide.isActive = isActiveValue === "true";
    slide.image = newImage;

    await slide.save();

    // حذف تصویر قبلی پس از ذخیره موفق
    if (newImage !== oldImage) {
      await deleteOldImage(oldImage);
    }

    return Response.json(slide, { status: 200 });

  } catch (error) {
    // اگر ویرایش ناموفق بود تصویر جدید حذف شود
    if (savedFilePath) {
      await unlink(savedFilePath).catch(() => {});
    }

    console.error("UPDATE SLIDE ERROR:", error);

    return Response.json(
      { message: error.message || "خطا در ویرایش اسلاید" },
      { status: 500 }
    );
  }
}

// حذف اسلاید
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه اسلاید معتبر نیست" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const slide = await Slide.findById(id);

    if (!slide) {
      return Response.json(
        { message: "اسلاید پیدا نشد" },
        { status: 404 }
      );
    }

    const oldImage = slide.image;

    await Slide.findByIdAndDelete(id);

    await deleteOldImage(oldImage);

    return Response.json(
      { message: "اسلاید با موفقیت حذف شد" },
      { status: 200 }
    );

  } catch (error) {
    console.error("DELETE SLIDE ERROR:", error);

    return Response.json(
      { message: "خطا در حذف اسلاید" },
      { status: 500 }
    );
  }
}
