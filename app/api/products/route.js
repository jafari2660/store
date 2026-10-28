import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { join, extname } from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Tag from "@/models/Tag";

export async function GET(request) {
  try {
    await connectToDatabase();

    const products = await Product.find({})
      .populate("category")
      .populate("tags");

    return Response.json(products, { status: 200 });
  } catch (error) {
    console.error("GET /api/products ERROR:", error);

    return Response.json(
      { message: error.message || "خطا در دریافت محصولات" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();

    const bookFile = data.get("file");

    if (!bookFile) {
      return NextResponse.json({
        success: false,
        message: "اپلود فایل کتاب الزامی میباشد",
      });
    }

    const imageFile = data.get("image");

    if (!imageFile) {
      return NextResponse.json({
        success: false,
        message: "اپلود تصویر الزامی میباشد",
      });
    }

    const name = data.get("name");
    const author = data.get("author");
    const description = data.get("description");
    const category = data.get("category");

    const fileType = data.get("fileType");
    const isActive = data.get("isActive") === "true";
    const saleStatus = data.get("saleStatus") === "true";

    const stock = Number(data.get("stock"));
    const price = Number(data.get("price"));
    const discountValue = data.get("discountPrice");
    const discountPrice =
      discountValue == null || discountValue.trim() === ""
        ? null
        : Number(discountValue);

    if (!name || typeof name !== "string" || name.trim() === "") {
      return new Response(
        JSON.stringify({ message: "نام محصول الزامی می‌باشد" }),
        { status: 400 },
      );
    }

    const tagsValue = data.get("tags");

    let tags = [];

    try {
      tags = JSON.parse(
        typeof tagsValue === "string" && tagsValue.trim() ? tagsValue : "[]",
      );

      if (!Array.isArray(tags)) {
        throw new Error("برچسب ها باید آرایه باشند");
      }
    } catch {
      return Response.json(
        { message: "فرمت برچسب ها نامعتبر است" },
        { status: 400 },
      );
    }

    if (
      !tags.every(
        (tag) =>
          typeof tag === "string" && mongoose.Types.ObjectId.isValid(tag),
      )
    ) {
      return Response.json(
        {
          message: "شناسه برچسب ها نامعتبر است؛ باید شناسه ارسال شود، نه نام برچسب",
        },
        { status: 400 },
      );
    }

    tags = [...new Set(tags)];

    await connectToDatabase();

    const existingTags = await Tag.find({
      _id: { $in: tags },
    })
      .select("_id")
      .lean();

    if (existingTags.length !== tags.length) {
      return Response.json(
        { message: "یک یا چند برچسب در دیتابیس وجود ندارند" },
        { status: 400 },
      );
    }

    if (name.length < 3 || name.length > 30) {
      return new Response(
        JSON.stringify({ message: "نام باید بین ۳ تا ۳۰ کاراکتر باشد" }),
        { status: 400 },
      );
    }

    if (!author || typeof author !== "string" || author.trim() === "") {
      return new Response(
        JSON.stringify({ message: "نام نویسنده محصول الزامی می‌باشد" }),
        { status: 400 },
      );
    }

    if (author.length < 3 || author.length > 30) {
      return new Response(
        JSON.stringify({
          message: "نام نویسنده باید بین ۳ تا ۳۰ کاراکتر باشد",
        }),
        { status: 400 },
      );
    }

    if (
      !description ||
      typeof description !== "string" ||
      description.trim() === ""
    ) {
      return new Response(
        JSON.stringify({ message: "توضیحات محصول الزامی می‌باشد" }),
        { status: 400 },
      );
    }

    if (description.length < 3 || description.length > 200) {
      return new Response(
        JSON.stringify({
          message: "توضیحات باید بین ۳ تا ۲۰۰ کاراکتر باشد",
        }),
        { status: 400 },
      );
    }

    if (!(bookFile instanceof File) || bookFile.size === 0) {
      return Response.json(
        { success: false, message: "فایل کتاب الزامی است" },
        { status: 400 },
      );
    }

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return Response.json(
        { success: false, message: "تصویر محصول الزامی است" },
        { status: 400 },
      );
    }

    if (!category) {
      return new Response(
        JSON.stringify({ message: "دسته‌بندی محصول الزامی می‌باشد" }),
        { status: 400 },
      );
    }

    if (!fileType || typeof fileType !== "string") {
      return new Response(
        JSON.stringify({ message: "نوع فایل الزامی می‌باشد" }),
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return Response.json(
        { success: false, message: "قیمت یا موجودی معتبر نیست" },
        { status: 400 },
      );
    }

    if (
      discountPrice !== null &&
      (!Number.isFinite(discountPrice) ||
        discountPrice < 0 ||
        discountPrice >= price)
    ) {
      return Response.json(
        { success: false, message: "قیمت تخفیفی باید کمتر از قیمت اصلی باشد" },
        { status: 400 },
      );
    }

    if (tags != null && !Array.isArray(tags)) {
      return new Response(
        JSON.stringify({ message: "برچسب‌ها باید به‌صورت آرایه باشند" }),
        { status: 400 },
      );
    }

    if (isActive != null && typeof isActive !== "boolean") {
      return new Response(
        JSON.stringify({ message: "وضعیت فعال بودن باید بولین باشد" }),
        { status: 400 },
      );
    }

    if (saleStatus != null && typeof saleStatus !== "boolean") {
      return new Response(
        JSON.stringify({ message: "وضعیت فروش باید بولی باشد" }),
        { status: 400 },
      );
    }

    const imageExtension = extname(imageFile.name).toLowerCase();
    const bookExtension = extname(bookFile.name).toLowerCase();

    const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    if (!allowedImageExtensions.includes(imageExtension)) {
      return Response.json(
        { message: "فرمت تصویر معتبر نیست" },
        { status: 400 },
      );
    }

    const allowedBookTypes = {
      PDF: [".pdf"],
      DOCX: [".docx"],
      AUDIO: [".mp3", ".m4a"],
    };

    const normalizedFileType = fileType.toUpperCase();

    if (
      !Object.hasOwn(allowedBookTypes, normalizedFileType) ||
      !allowedBookTypes[normalizedFileType].includes(bookExtension)
    ) {
      return Response.json(
        { message: "نوع یا پسوند فایل کتاب معتبر نیست" },
        { status: 400 },
      );
    }

    const imageDir = join(process.cwd(), "public/uploadImage");
    const bookDir = join(process.cwd(), "public/uploadBook");

    await mkdir(imageDir, { recursive: true });
    await mkdir(bookDir, { recursive: true });

    const imageFileName = `${randomUUID()}${imageExtension}`;
    const bookFileName = `${randomUUID()}${bookExtension}`;

    await writeFile(
      join(imageDir, imageFileName),
      Buffer.from(await imageFile.arrayBuffer()),
    );

    await writeFile(
      join(bookDir, bookFileName),
      Buffer.from(await bookFile.arrayBuffer()),
    );

    await connectToDatabase();

    const product = await Product.create({
      name,
      author: author.trim(),
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      image: `/uploadImage/${imageFileName}`,
      file: `/uploadBook/${bookFileName}`,
      fileType: normalizedFileType,
      tags,
      isActive,
      saleStatus,
      discountPrice,
    });

    return new Response(JSON.stringify(product), {
      status: 201,
    });
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);

    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
