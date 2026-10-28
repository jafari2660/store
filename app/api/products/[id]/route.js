import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import mongoose from "mongoose";
import { join, basename, extname } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import Tag from "@/models/Tag";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه محصول نامعتبر است" },
        { status: 400 },
      );
    }

    const product = await Product.findById(id).lean();

    console.log("Product from database:", product);
    console.log("Author field:", product?.author);

    if (!product) {
      return Response.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    return Response.json(product, { status: 200 });
  } catch (error) {
    console.error("GET product error:", error);

    return Response.json({ message: "خطا در دریافت محصول" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  let savedImagePath = null;
  let savedFileDiskPath = null;

  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه محصول نامعتبر است" },
        { status: 400 },
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
        { status: 400 },
      );
    }

    if (typeof author !== "string" || !author.trim()) {
      return Response.json(
        { message: "نام نویسنده الزامی است" },
        { status: 400 },
      );
    }

    if (
      typeof category !== "string" ||
      !mongoose.Types.ObjectId.isValid(category)
    ) {
      return Response.json(
        { message: "شناسه دسته‌بندی نامعتبر است" },
        { status: 400 },
      );
    }

    let tags = [];

    try {
      tags = JSON.parse(tagsValue || "[]");

      if (!Array.isArray(tags)) {
        throw new Error(" برچسب ها باید آرایه باشند");
      }
    } catch {
      return Response.json(
        { message: "فرمت برچسب نامعتبر است" },
        { status: 400 },
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
        { status: 400 },
      );
    }

    const updateData = {
      name: name.trim(),
      author: author.trim(),
      description: typeof description === "string" ? description.trim() : "",
      category,
      tags,
      fileType:
        typeof fileType === "string" ? fileType.trim().toUpperCase() : "",
      isActive: formData.get("isActive") === "true",
      saleStatus: formData.get("saleStatus") === "true",
      price,
      stock,
      discountPrice,
    };

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return Response.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    const newFile = formData.get("file");
    const newImage = formData.get("image");

    const oldImagePath = existingProduct.image;
    const oldFilePath = existingProduct.file;

    let newImagePath = existingProduct.image;
    let newFilePath = existingProduct.file;

    if (newImage instanceof File && newImage.size > 0) {
      const imageExtension = extname(newImage.name).toLowerCase();
      const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

      if (!allowedImageExtensions.includes(imageExtension)) {
        return Response.json(
          { message: "فرمت تصویر باید JPG، PNG یا WEBP باشد" },
          { status: 400 },
        );
      }

      const imageDir = join(process.cwd(), "public", "uploadImage");

      await mkdir(imageDir, { recursive: true });

      const imageFileName = `${randomUUID()}${imageExtension}`;
      const imageDiskPath = join(imageDir, imageFileName);

      await writeFile(imageDiskPath, Buffer.from(await newImage.arrayBuffer()));

      newImagePath = `/uploadImage/${imageFileName}`;
      savedImagePath = imageDiskPath;
    }

    if (newFile instanceof File && newFile.size > 0) {
      const fileExtension = extname(newFile.name).toLowerCase();

      const allowedFileExtensions = [
        ".pdf",
        ".doc",
        ".docx",
        ".epub",
        ".mp3",
        ".wav",
        ".m4a",
      ];

      if (!allowedFileExtensions.includes(fileExtension)) {
        return Response.json(
          { message: "فرمت فایل کتاب پشتیبانی نمی‌شود" },
          { status: 400 },
        );
      }

      const fileDir = join(process.cwd(), "public", "uploadBook");

      await mkdir(fileDir, { recursive: true });

      const fileName = `${randomUUID()}${fileExtension}`;
      savedFileDiskPath = join(fileDir, fileName);

      await writeFile(
        savedFileDiskPath,
        Buffer.from(await newFile.arrayBuffer()),
      );

      newFilePath = `/uploadBook/${fileName}`;
    }

    try {
      const product = await Product.findByIdAndUpdate(
        id,
        {
          ...updateData,
          image: newImagePath,
          file: newFilePath,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!product) {
        if (savedImagePath) {
          await unlink(savedImagePath).catch(() => {});
        }

        if (savedFileDiskPath) {
          await unlink(savedFileDiskPath).catch(() => {});
        }

        return Response.json({ message: "محصول یافت نشد" }, { status: 404 });
      }

      if (savedImagePath && oldImagePath?.startsWith("/uploadImage/")) {
        const oldImageDiskPath = join(
          process.cwd(),
          "public",
          "uploadImage",
          basename(oldImagePath),
        );

        await unlink(oldImageDiskPath).catch((error) => {
          if (error.code !== "ENOENT") {
            console.error("OLD IMAGE DELETE ERROR:", error);
          }
        });
      }

      if (savedFileDiskPath && oldFilePath?.startsWith("/uploadBook/")) {
        const oldFileDiskPath = join(
          process.cwd(),
          "public",
          "uploadBook",
          basename(oldFilePath),
        );

        await unlink(oldFileDiskPath).catch((error) => {
          if (error.code !== "ENOENT") {
            console.error("OLD BOOK FILE DELETE ERROR:", error);
          }
        });
      }

      return Response.json(product, { status: 200 });
    } catch (error) {
      if (savedImagePath) {
        await unlink(savedImagePath).catch(() => {});
      }

      if (savedFileDiskPath) {
        await unlink(savedFileDiskPath).catch(() => {});
      }

      throw error;
    }
  } catch (error) {
    console.error("PUT product error:", error);

    return Response.json(
      { message: error.message || "خطا در ویرایش محصول" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه محصول نامعتبر است" },
        { status: 400 },
      );
    }

    const product = await Product.findById(id);
    console.log("IMAGE PATH:", product?.image);

    if (!product) {
      return Response.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    await Product.findByIdAndDelete(id);

    if (product.image?.startsWith("/uploadImage/")) {
      const imagePath = join(
        process.cwd(),
        "public",
        "uploadImage",
        basename(product.image),
      );

      try {
        await unlink(imagePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("خطا در حذف عکس:", error);
        }
      }
    }

    if (product.file?.startsWith("/uploadBook/")) {
      const filePath = join(
        process.cwd(),
        "public",
        "uploadBook",
        basename(product.file),
      );

      try {
        await unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("خطا در حذف فایل کتاب:", error);
        }
      }
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE product error:", error);

    return Response.json({ message: "خطا در حذف محصول" }, { status: 500 });
  }
}
