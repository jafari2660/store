
import connectToDatabase from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import Slide from "@/models/Slide";

import { join, extname } from "path";
import { writeFile, mkdir, unlink } from "fs/promises";
import { randomUUID } from "crypto";

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

    const slides = await Slide.find(filter).sort({
      position: 1,
      order: 1,
    });

    return Response.json(slides, { status: 200 });
  } catch (error) {
    console.error("GET SLIDES ERROR:", error);

    return Response.json(
      { message: "خطا در دریافت اسلایدها" },
      { status: 500 }
    );
  }
}

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

    // بررسی تصویر
    if (
      !imageFile ||
      typeof imageFile === "string" ||
      imageFile.size === 0
    ) {
      return Response.json(
        { message: "انتخاب تصویر الزامی است" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(imageFile.type)) {
      return Response.json(
        { message: "فرمت تصویر معتبر نیست" },
        { status: 400 }
      );
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      return Response.json(
        { message: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد" },
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

    // بررسی محل نمایش
    const allowedPositions = ["main", "sideTop", "sideBottom"];

    if (!allowedPositions.includes(position)) {
      return Response.json(
        { message: "محل نمایش اسلاید معتبر نیست" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(order) || order < 0) {
      return Response.json(
        { message: "ترتیب نمایش معتبر نیست" },
        { status: 400 }
      );
    }

    const imageExtension = extname(imageFile.name).toLowerCase();

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    if (!allowedExtensions.includes(imageExtension)) {
      return Response.json(
        { message: "پسوند تصویر معتبر نیست" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ذخیره تصویر
    const imageDir = join(process.cwd(), "public/images/slideshow");

    await mkdir(imageDir, { recursive: true });

    const imageFileName = `${randomUUID()}${imageExtension}`;

    imagePath = join(imageDir, imageFileName);

    await writeFile(
      imagePath,
      Buffer.from(await imageFile.arrayBuffer())
    );

    // ثبت اطلاعات اسلاید در دیتابیس
    const slide = await Slide.create({
      image: `/images/slideshow/${imageFileName}`,
      link: link.trim(),
      position,
      order,
      isActive: data.get("isActive") !== "false",
    });

    return Response.json(slide, { status: 201 });
  } catch (error) {
    // اگر ثبت اطلاعات ناموفق بود، تصویر ذخیره‌شده پاک شود
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
