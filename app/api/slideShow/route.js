
import connectToDatabase from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import Slide from "@/models/Slide";

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

// دریافت اسلایدها
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const showAll = url.searchParams.get("all") === "true";

    // دریافت همه اسلایدها فقط برای ادمین
    if (showAll) {
      const auth = await requireAdmin(request);

      if (!auth.authorized) {
        return auth.response;
      }
    }

    await connectToDatabase();

    const filter = showAll ? {} : { isActive: true };

    const slides = await Slide.find(filter)
      .sort({ position: 1, order: 1 })
      .lean();

    return Response.json(slides, { status: 200 });

  } catch (error) {
    console.error("GET SLIDES ERROR:", error);

    return Response.json(
      { message: "خطا در دریافت اسلایدها" },
      { status: 500 }
    );
  }
}

// افزودن اسلاید جدید
export async function POST(request) {
  let imagePath = null;

  try {
    // بررسی دسترسی ادمین
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    const data = await request.formData();

    const imageFile = data.get("image");
    const link = data.get("link");
    const position = data.get("position");
    const order = Number(data.get("order") || 0);
    const isActiveValue = data.get("isActive");

    // بررسی تصویر
    if (
      !(imageFile instanceof File) ||
      imageFile.size === 0
    ) {
      return Response.json(
        { message: "انتخاب تصویر الزامی است" },
        { status: 400 }
      );
    }

    // بررسی نوع تصویر
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return Response.json(
        { message: "فرمت تصویر معتبر نیست" },
        { status: 400 }
      );
    }

    // بررسی حجم تصویر
    if (imageFile.size > MAX_IMAGE_SIZE) {
      return Response.json(
        { message: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد" },
        { status: 400 }
      );
    }

    // بررسی پسوند تصویر
    const imageExtension = extname(imageFile.name).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(imageExtension)) {
      return Response.json(
        { message: "پسوند تصویر معتبر نیست" },
        { status: 400 }
      );
    }

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

    // بررسی وضعیت فعال یا غیرفعال
    if (
      isActiveValue !== null &&
      !["true", "false"].includes(isActiveValue)
    ) {
      return Response.json(
        { message: "وضعیت اسلاید معتبر نیست" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // بررسی ظرفیت جایگاه
    const currentCount = await Slide.countDocuments({
      position,
    });

    if (currentCount >= POSITION_LIMITS[position]) {
      return Response.json(
        { message: "ظرفیت این جایگاه تکمیل شده است" },
        { status: 400 }
      );
    }

    // ساخت پوشه تصاویر
    const imageDirectory = join(
      process.cwd(),
      "public",
      "images",
      "slideshow"
    );

    await mkdir(imageDirectory, { recursive: true });

    // ساخت نام یکتا برای تصویر
    const imageFileName = `${randomUUID()}${imageExtension}`;

    imagePath = join(imageDirectory, imageFileName);

    // ذخیره تصویر
    await writeFile(
      imagePath,
      Buffer.from(await imageFile.arrayBuffer())
    );

    // ثبت اطلاعات در دیتابیس
    const slide = await Slide.create({
      image: `/images/slideshow/${imageFileName}`,
      link: link.trim(),
      position,
      order,
      isActive: isActiveValue !== "false",
    });

    return Response.json(slide, { status: 201 });

  } catch (error) {
    // در صورت بروز خطا تصویر ذخیره‌شده پاک شود
    if (imagePath) {
      await unlink(imagePath).catch(() => {});
    }

    console.error("CREATE SLIDE ERROR:", error);

    return Response.json(
      { message: error.message || "خطا در افزودن اسلاید" },
      { status: 500 }
    );
  }
}
