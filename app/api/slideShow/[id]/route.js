
import connectToDatabase from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import Slide from "@/models/Slide";

import mongoose from "mongoose";
import { join, extname } from "path";
import { writeFile, mkdir, unlink } from "fs/promises";
import { randomUUID } from "crypto";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

const ALLOWED_POSITIONS = ["main", "sideTop", "sideBottom"];

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

function deleteOldImage(image) {
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

  return unlink(filePath).catch(() => {});
}

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
    const order = Number(data.get("order") || 0);
    const isActiveValue = data.get("isActive");
    const imageFile = data.get("image");

    if (typeof link !== "string" || !link.trim()) {
      return Response.json(
        { message: "لینک اسلاید الزامی است" },
        { status: 400 }
      );
    }

    if (!ALLOWED_POSITIONS.includes(position)) {
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

    if (!["true", "false"].includes(isActiveValue)) {
      return Response.json(
        { message: "وضعیت اسلاید معتبر نیست" },
        { status: 400 }
      );
    }

    let newImage = slide.image;

    if (imageFile && imageFile.size > 0) {
      const saved = await saveImage(imageFile);
      savedFilePath = saved.filePath;
      newImage = saved.image;
    }

    const oldImage = slide.image;

    slide.link = link.trim();
    slide.position = position;
    slide.order = order;
    slide.isActive = isActiveValue === "true";
    slide.image = newImage;

    await slide.save();

    if (newImage !== oldImage) {
      await deleteOldImage(oldImage);
    }

    return Response.json(slide, { status: 200 });
  } catch (error) {
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
