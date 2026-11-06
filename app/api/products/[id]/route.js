
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import mongoose from "mongoose";
import { join, basename, extname } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import Tag from "@/models/Tag";
import { requireAdmin } from "@/app/lib/auth";
import ProductFile from "@/models/ProductFile";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه محصول نامعتبر است" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return Response.json(
        { message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    return Response.json(product, { status: 200 });

  } catch (error) {
    console.error("GET product error:", error);

    return Response.json(
      { message: "خطا در دریافت محصول" },
      { status: 500 }
    );
  }
}


export async function PUT(request, { params }) {

  let savedImagePath = null;
  let savedFileDiskPath = null;
  let updateCompleted = false;

  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه محصول نامعتبر است" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const author = formData.get("author");
    const description = formData.get("description");
    const category = formData.get("category");
    const fileType = formData.get("fileType");
    const tagsValue = formData.get("tags");

    if (typeof name !== "string" || !name.trim()) {
      return Response.json(
        { message: "نام محصول الزامی است" },
        { status: 400 }
      );
    }

    if (typeof author !== "string" || !author.trim()) {
      return Response.json(
        { message: "نام نویسنده الزامی است" },
        { status: 400 }
      );
    }

    if (
      typeof category !== "string" ||
      !mongoose.Types.ObjectId.isValid(category)
    ) {
      return Response.json(
        { message: "شناسه دسته‌بندی نامعتبر است" },
        { status: 400 }
      );
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return Response.json(
        { message: "دسته‌بندی مورد نظر پیدا نشد" },
        { status: 404 }
      );
    }

    let tags = [];

    try {
      if (typeof tagsValue !== "string") {
        throw new Error("فرمت برچسب نامعتبر است");
      }

      tags = JSON.parse(tagsValue || "[]");

      if (!Array.isArray(tags)) {
        throw new Error("برچسب‌ها باید آرایه باشند");
      }

    } catch {
      return Response.json(
        { message: "فرمت برچسب نامعتبر است" },
        { status: 400 }
      );
    }

    if (
      !tags.every(
        (tag) =>
          typeof tag === "string" &&
          mongoose.Types.ObjectId.isValid(tag)
      )
    ) {
      return Response.json(
        { message: "شناسه برچسب‌ها نامعتبر است" },
        { status: 400 }
      );
    }

    tags = [...new Set(tags)];

    const existingTags = await Tag.find({
      _id: { $in: tags }
    })
      .select("_id")
      .lean();

    if (existingTags.length !== tags.length) {
      return Response.json(
        { message: "یک یا چند برچسب در دیتابیس وجود ندارند" },
        { status: 400 }
      );
    }

    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));

    const discountValue = formData.get("discountPrice");

    const discountPrice =
      discountValue === null || String(discountValue).trim() === ""
        ? null
        : Number(discountValue);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return Response.json(
        { message: "قیمت یا موجودی نامعتبر است" },
        { status: 400 }
      );
    }

    if (
      discountPrice !== null &&
      (
        !Number.isFinite(discountPrice) ||
        discountPrice < 0 ||
        discountPrice >= price
      )
    ) {
      return Response.json(
        {
          message: "قیمت تخفیفی باید غیرمنفی و کمتر از قیمت اصلی باشد"
        },
        { status: 400 }
      );
    }

    const allowedBookTypes = {
      PDF: [".pdf"],
      DOCX: [".docx"],
      AUDIO: [".mp3", ".m4a"]
    };

    const normalizedFileType =
      typeof fileType === "string"
        ? fileType.trim().toUpperCase()
        : "";

    if (!Object.hasOwn(allowedBookTypes, normalizedFileType)) {
      return Response.json(
        { message: "نوع فایل کتاب معتبر نیست" },
        { status: 400 }
      );
    }

    const newFile = formData.get("file");
    const newImage = formData.get("image");

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return Response.json(
        { message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    const oldImagePath = existingProduct.image;
    const oldFilePath = existingProduct.file;

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const MAX_BOOK_SIZE = 50 * 1024 * 1024;

    if (newImage instanceof File && newImage.size > 0) {
      if (newImage.size > MAX_IMAGE_SIZE) {
        return Response.json(
          { message: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد" },
          { status: 400 }
        );
      }

      const imageExtension = extname(newImage.name).toLowerCase();

      const allowedImageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
      ];

      if (!allowedImageExtensions.includes(imageExtension)) {
        return Response.json(
          { message: "فرمت تصویر باید JPG، PNG یا WEBP باشد" },
          { status: 400 }
        );
      }
    }

    if (newFile instanceof File && newFile.size > 0) {
      if (newFile.size > MAX_BOOK_SIZE) {
        return Response.json(
          { message: "حجم فایل کتاب نباید بیشتر از ۵۰ مگابایت باشد" },
          { status: 400 }
        );
      }

      const fileExtension = extname(newFile.name).toLowerCase();

      if (
        !allowedBookTypes[normalizedFileType].includes(fileExtension)
      ) {
        return Response.json(
          { message: "نوع یا پسوند فایل کتاب معتبر نیست" },
          { status: 400 }
        );
      }
    } else if (oldFilePath) {

      const oldFileExtension = extname(oldFilePath).toLowerCase();

      if (
        !allowedBookTypes[normalizedFileType].includes(oldFileExtension)
      ) {
        return Response.json(
          { message: "نوع فایل با فایل فعلی محصول سازگار نیست" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      name: name.trim(),
      author: author.trim(),
      description:
        typeof description === "string" ? description.trim() : "",
      category,
      tags,
      fileType: normalizedFileType,
      isActive: formData.get("isActive") === "true",
      saleStatus: formData.get("saleStatus") === "true",
      price,
      stock,
      discountPrice
    };

    let newImagePath = existingProduct.image;
    let newFilePath = existingProduct.file;

    if (newImage instanceof File && newImage.size > 0) {

      const imageExtension = extname(newImage.name).toLowerCase();

      const imageDir = join(
        process.cwd(),
        "public",
        "uploadImage"
      );

      await mkdir(imageDir, { recursive: true });

      const imageFileName = `${randomUUID()}${imageExtension}`;

      savedImagePath = join(imageDir, imageFileName);

      await writeFile(
        savedImagePath,
        Buffer.from(await newImage.arrayBuffer())
      );

      newImagePath = `/uploadImage/${imageFileName}`;
    }

    if (newFile instanceof File && newFile.size > 0) {

      const fileExtension = extname(newFile.name).toLowerCase();

      const fileDir = join(
        process.cwd(),
        "private_uploads",
        "books"
      );

      await mkdir(fileDir, { recursive: true });

      const fileName = `${randomUUID()}${fileExtension}`;

      savedFileDiskPath = join(fileDir, fileName);

      await writeFile(
        savedFileDiskPath,
        Buffer.from(await newFile.arrayBuffer())
      );

      newFilePath = fileName;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        ...updateData,
        image: newImagePath,
        file: newFilePath
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return Response.json(
        { message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    updateCompleted = true;
    if (
      savedImagePath &&
      oldImagePath?.startsWith("/uploadImage/")
    ) {
      const oldImageDiskPath = join(
        process.cwd(),
        "public",
        "uploadImage",
        basename(oldImagePath)
      );

      await unlink(oldImageDiskPath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.error("OLD IMAGE DELETE ERROR:", error);
        }
      });
    }

    if (savedFileDiskPath && oldFilePath) {
      const oldFileDiskPath = join(
        process.cwd(),
        "private_uploads",
        "books",
        basename(oldFilePath)
      );

      await unlink(oldFileDiskPath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.error("OLD BOOK FILE DELETE ERROR:", error);
        }
      });
    }

    return Response.json(product, { status: 200 });

  } catch (error) {

    if (!updateCompleted) {

      if (savedImagePath) {
        await unlink(savedImagePath).catch(() => {});
      }

      if (savedFileDiskPath) {
        await unlink(savedFileDiskPath).catch(() => {});
      }
    }

    console.error("PUT product error:", error);

    return Response.json(
      { message: error.message || "خطا در ویرایش محصول" },
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

    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه محصول نامعتبر است" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return Response.json(
        { message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    const productFiles = await ProductFile.find({ product: id });

    for (const file of productFiles) {
      const filePath = join(
        process.cwd(),
        "private_uploads",
        "products",
        id,
        file.storedName
      );

      await unlink(filePath).catch(() => {});
    }

    await ProductFile.deleteMany({ product: id });

    if (product.image?.startsWith("/uploadImage/")) {
      const imagePath = join(
        process.cwd(),
        "public",
        "uploadImage",
        basename(product.image)
      );

      await unlink(imagePath).catch(() => {});
    }

    if (product.file) {
      const filePath = join(
        process.cwd(),
        "private_uploads",
        "books",
        basename(product.file)
      );

      await unlink(filePath).catch(() => {});
    }

    await Product.findByIdAndDelete(id);

    return new Response(null, { status: 204 });

  } catch (error) {
    console.error("DELETE product error:", error);

    return Response.json(
      { message: "خطا در حذف محصول" },
      { status: 500 }
    );
  }
}
