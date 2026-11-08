import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import { join, extname } from "path";
import { writeFile, mkdir, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Tag from "@/models/Tag";
import { requireAdmin } from "@/app/lib/auth";

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
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }
    const data = await request.formData();

    const imageFile = data.get("image");

    if (!imageFile) {
      return NextResponse.json(
        {
          success: false,
          message: "اپلود تصویر الزامی میباشد",
        },
        { status: 400 },
      );
    }

    const name = data.get("name");
    const description = data.get("description");
    const category = data.get("category");
    const fileType = data.get("fileType");
    const isActiveValue = data.get("isActive");
    const saleStatusValue = data.get("saleStatus");

    if (!["true", "false"].includes(isActiveValue)) {
      return Response.json(
        { message: "وضعیت فعال بودن محصول معتبر نیست." },
        { status: 400 },
      );
    }

    if (!["true", "false"].includes(saleStatusValue)) {
      return Response.json(
        { message: "وضعیت فروش محصول معتبر نیست." },
        { status: 400 },
      );
    }

    const isActive = isActiveValue === "true";
    const saleStatus = saleStatusValue === "true";

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
          message:
            "شناسه برچسب ها نامعتبر است؛ باید شناسه ارسال شود، نه نام برچسب",
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

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return Response.json(
        { message: "شناسه دسته‌بندی معتبر نیست" },
        { status: 400 },
      );
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return Response.json(
        { message: "دسته‌بندی مورد نظر پیدا نشد" },
        { status: 404 },
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

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    if (imageFile.size > MAX_IMAGE_SIZE) {
      return Response.json(
        { message: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد." },
        { status: 400 },
      );
    }

    const imageExtension = extname(imageFile.name).toLowerCase();

    const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    if (!allowedImageExtensions.includes(imageExtension)) {
      return Response.json(
        { message: "فرمت تصویر معتبر نیست" },
        { status: 400 },
      );
    }

    const normalizedFileType = fileType.toUpperCase();

    const imageDir = join(process.cwd(), "public/uploadImage");

    await mkdir(imageDir, { recursive: true });

    const imageFileName = `${randomUUID()}${imageExtension}`;

    const imagePath = join(imageDir, imageFileName);

    let imageUploaded = false;

    try {
      await writeFile(imagePath, Buffer.from(await imageFile.arrayBuffer()));
      imageUploaded = true;

      await connectToDatabase();

      const product = await Product.create({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        image: `/uploadImage/${imageFileName}`,
        file: "",
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
      if (imageUploaded) {
        await unlink(imagePath).catch(() => {});
      }

      throw error;
    }
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);

    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
